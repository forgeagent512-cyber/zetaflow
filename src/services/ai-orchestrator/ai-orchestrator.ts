import type { RouterRequest, RouterResponse, OrchestratorConfig, ClassifiedTask, CostEstimate, FreeModelInfo, ProviderHealthStatus } from './ai-orchestrator.types.js';
import { TaskClassifier } from './task-classifier.js';
import { FreeModelRouter } from './free-model-router.js';
import { FallbackEngine } from './fallback-engine.js';
import { CostOptimizer } from './cost-optimizer.js';
import { ProviderHealthMonitor } from './provider-health-monitor.js';

export class AIOrchestrator {
  private classifier: TaskClassifier;
  private modelRouter: FreeModelRouter;
  private fallbackEngine: FallbackEngine;
  private costOptimizer: CostOptimizer;
  private healthMonitor: ProviderHealthMonitor;
  private config: OrchestratorConfig;

  constructor(
    config?: Partial<OrchestratorConfig>,
    classifier?: TaskClassifier,
    modelRouter?: FreeModelRouter,
    fallbackEngine?: FallbackEngine,
    costOptimizer?: CostOptimizer,
    healthMonitor?: ProviderHealthMonitor
  ) {
    this.config = {
      enableFallback: config?.enableFallback ?? true,
      enablePaidFallback: config?.enablePaidFallback ?? true,
      preferredProviders: config?.preferredProviders ?? ['openrouter'],
      maxRetries: config?.maxRetries ?? 3,
      timeout: config?.timeout ?? 60000
    };

    this.classifier = classifier ?? new TaskClassifier();
    this.modelRouter = modelRouter ?? new FreeModelRouter();
    this.fallbackEngine = fallbackEngine ?? new FallbackEngine();
    this.costOptimizer = costOptimizer ?? new CostOptimizer();
    this.healthMonitor = healthMonitor ?? new ProviderHealthMonitor();
  }

  async process(request: RouterRequest): Promise<RouterResponse> {
    const startTime = Date.now();

    const promptText = request.messages.map(m => m.content).join('\n');
    const context = request.messages.find(m => m.role === 'system')?.content;

    const classified = request.taskType
      ? { taskType: request.taskType, confidence: 1, reasoning: 'Pre-classified by caller' }
      : this.classifier.classify(promptText, context);

    const modelInfo = this.modelRouter.getBestModel(classified.taskType);

    const providerStatus = await this.healthMonitor.getProviderStatus(modelInfo.provider);
    if (providerStatus.status === 'unhealthy') {
      const allFreeModels = this.modelRouter.getAllFreeModels();
      const healthyModel = allFreeModels.find(m => {
        if (m.model === modelInfo.model) return false;
        const pStatus = this.healthMonitor.getProviderStatus(m.provider);
        return pStatus.then(s => s.status !== 'unhealthy').catch(() => false);
      });

      if (healthyModel) {
        modelInfo.model = healthyModel.model;
        modelInfo.provider = healthyModel.provider;
      }
    }

    const costEstimate = this.costOptimizer.estimateCost(
      modelInfo.model,
      promptText,
      request.tier
    );

    const enrichedRequest: RouterRequest = {
      ...request,
      taskType: classified.taskType
    };

    let finalResponse: RouterResponse;

    if (this.config.enableFallback) {
      try {
        finalResponse = await this.fallbackEngine.executeWithFallback(enrichedRequest);
      } catch (fallbackError) {
        this.healthMonitor.recordFailure(modelInfo.provider, modelInfo.model);

        if (this.config.enablePaidFallback) {
          try {
            const paidResponse = await this.executePaidFallback(enrichedRequest);
            return paidResponse;
          } catch (paidError) {
            throw new Error(
              `All fallback attempts failed: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`
            );
          }
        }

        throw fallbackError;
      }
    } else {
      const { FallbackEngine: FE } = await import('./fallback-engine.js');
      const directEngine = new FE();
      finalResponse = await directEngine.executeWithFallback(enrichedRequest);
    }

    const latency = (Date.now() - startTime) / 1000;

    const response: RouterResponse = {
      content: finalResponse.content,
      model: finalResponse.model,
      provider: finalResponse.provider,
      tier: request.tier,
      taskType: classified.taskType,
      usage: finalResponse.usage,
      cost: {
        totalCost: finalResponse.cost.totalCost,
        costPerToken: finalResponse.cost.costPerToken,
        model: finalResponse.model,
        provider: finalResponse.provider
      },
      latency
    };

    await this.costOptimizer.trackUsage(enrichedRequest, response).catch(() => {});

    return response;
  }

  private async executePaidFallback(request: RouterRequest): Promise<RouterResponse> {
    const paidTiers: Array<'balanced' | 'premium' | 'enterprise'> = ['balanced', 'premium'];
    const lastError: Error[] = [];

    for (const tier of paidTiers) {
      try {
        const paidRequest: RouterRequest = { ...request, tier };
        return await this.fallbackEngine.executeWithFallback(paidRequest);
      } catch (error) {
        if (error instanceof Error) {
          lastError.push(error);
        }
      }
    }

    throw new Error(`Paid fallback failed: ${lastError.map(e => e.message).join('; ')}`);
  }

  async generate(prompt: string, context?: string, model?: string): Promise<RouterResponse> {
    const messages: RouterRequest['messages'] = [];
    if (context) messages.push({ role: 'system', content: context });
    messages.push({ role: 'user', content: prompt });
    return this.process({ messages, tier: 'economy' });
  }

  async classify(input: string, categories: string[]): Promise<ClassifiedTask> {
    return this.classifier.classify(input, categories.join(' '));
  }

  async estimateCost(model: string, tokens?: number, operation?: string): Promise<CostEstimate> {
    return this.costOptimizer.estimateCost(model, '', 'economy');
  }

  async selectModel(task: string, requirements?: Record<string, unknown>): Promise<FreeModelInfo> {
    const classified = this.classifier.classify(task);
    return this.modelRouter.getBestModel(classified.taskType);
  }

  async compare(prompt: string, models: string[]): Promise<RouterResponse[]> {
    const results: RouterResponse[] = [];
    for (const model of models) {
      try {
        const messages: RouterRequest['messages'] = [{ role: 'user', content: prompt }];
        const result = await this.process({ messages, tier: 'economy' });
        results.push(result);
      } catch {
        continue;
      }
    }
    return results;
  }

  async healthCheck(): Promise<ProviderHealthStatus[]> {
    return this.healthMonitor.checkHealth();
  }

  async getProviderStatus(): Promise<ProviderHealthStatus[]> {
    return this.healthMonitor.checkHealth();
  }

  getFreeModels(): FreeModelInfo[] {
    return this.modelRouter.getAllFreeModels();
  }

  getClassifier(): TaskClassifier {
    return this.classifier;
  }

  getModelRouter(): FreeModelRouter {
    return this.modelRouter;
  }

  getFallbackEngine(): FallbackEngine {
    return this.fallbackEngine;
  }

  getCostOptimizer(): CostOptimizer {
    return this.costOptimizer;
  }

  getHealthMonitor(): ProviderHealthMonitor {
    return this.healthMonitor;
  }

  getConfig(): OrchestratorConfig {
    return { ...this.config };
  }
}
