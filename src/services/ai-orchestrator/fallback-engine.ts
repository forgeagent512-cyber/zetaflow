import type { RouterRequest, RouterResponse } from './ai-orchestrator.types.js';
import { FreeModelRouter } from './free-model-router.js';
import { ProviderFactory } from '../ai-provider/provider-factory.js';
import type { AIProvider, AIProviderRequest, AIProviderResponse } from '../ai-provider/ai-provider.types.js';
import { MODEL_COSTS, calculateCost, estimateTokens, getFallbackChain } from '../ai-provider/model-registry.js';

interface AttemptRecord {
  model: string;
  provider: string;
  tier: string;
  success: boolean;
  latency: number;
  error?: string;
  timestamp: string;
}

export class FallbackEngine {
  private modelRouter: FreeModelRouter;
  private attempts: AttemptRecord[] = [];
  private static readonly MAX_ATTEMPTS = 1000;

  constructor() {
    this.modelRouter = new FreeModelRouter();
  }

  async executeWithFallback(request: RouterRequest): Promise<RouterResponse> {
    const startTime = Date.now();

    const taskType = request.taskType ?? 'chat';
    const modelInfo = this.modelRouter.getBestModel(taskType);

    const provider: AIProvider = ProviderFactory.create(modelInfo.provider as any);

    const primaryRequest: AIProviderRequest = {
      model: modelInfo.model,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      maxTokens: request.maxTokens ?? 2048,
      stream: request.stream ?? false
    };

    const allModels = [
      { model: modelInfo.model, provider: modelInfo.provider, tier: request.tier },
      ...this.getFallbackCandidates(modelInfo.model, taskType, request.tier)
    ];

    if (request.tier !== 'economy' && request.tier !== 'balanced') {
      const paidModels = this.getPaidFallbacks(taskType);
      allModels.push(...paidModels);
    }

    for (const candidate of allModels) {
      try {
        const candidateProvider: AIProvider = ProviderFactory.create(candidate.provider as any);
        const candidateRequest: AIProviderRequest = {
          model: candidate.model,
          messages: request.messages,
          temperature: request.temperature ?? 0.7,
          maxTokens: request.maxTokens ?? 2048,
          stream: request.stream ?? false
        };

        const response: AIProviderResponse = await candidateProvider.generate(candidateRequest);

        const latency = (Date.now() - startTime) / 1000;

        const promptText = request.messages.map(m => m.content).join(' ');
        const promptTokens = response.usage.promptTokens || estimateTokens(promptText);
        const completionTokens = response.usage.completionTokens || estimateTokens(response.content);
        const costResult = calculateCost(candidate.model, promptTokens, completionTokens);

        this.recordAttempt({
          model: candidate.model,
          provider: candidate.provider,
          tier: candidate.tier as string,
          success: true,
          latency,
          timestamp: new Date().toISOString()
        });

        const finalResponse: RouterResponse = {
          content: response.content,
          model: response.model ?? candidate.model,
          provider: response.provider ?? candidate.provider,
          tier: candidate.tier as string,
          taskType,
          usage: {
            promptTokens,
            completionTokens,
            totalTokens: promptTokens + completionTokens
          },
          cost: {
            totalCost: costResult.totalCost,
            costPerToken: costResult.costPerToken,
            model: candidate.model,
            provider: candidate.provider
          },
          latency
        };

        return finalResponse;
      } catch (error) {
        this.recordAttempt({
          model: candidate.model,
          provider: candidate.provider,
          tier: candidate.tier as string,
          success: false,
          latency: (Date.now() - startTime) / 1000,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    }

    throw new Error(`All models in fallback chain failed for task type: ${taskType}`);
  }

  getAttempts(): AttemptRecord[] {
    return [...this.attempts];
  }

  clearAttempts(): void {
    this.attempts = [];
  }

  private recordAttempt(attempt: AttemptRecord): void {
    this.attempts.push(attempt);

    if (this.attempts.length > FallbackEngine.MAX_ATTEMPTS) {
      this.attempts = this.attempts.slice(-FallbackEngine.MAX_ATTEMPTS);
    }
  }

  private getFallbackCandidates(failedModel: string, taskType: string, tier: string): Array<{ model: string; provider: string; tier: string }> {
    const fallbackChain = getFallbackChain(failedModel);
    const candidates: Array<{ model: string; provider: string; tier: string }> = [];

    for (const model of fallbackChain) {
      if (model === failedModel) continue;
      const provider = model.includes('/') ? model.split('/')[0] : 'openrouter';
      candidates.push({ model, provider, tier });
    }

    return candidates;
  }

  private getPaidFallbacks(taskType: string): Array<{ model: string; provider: string; tier: string }> {
    const paidModels: Array<{ model: string; provider: string; tier: string }> = [];

    if (MODEL_COSTS['openai/gpt-4o-mini']) {
      paidModels.push({ model: 'openai/gpt-4o-mini', provider: 'openai', tier: 'balanced' });
    }
    if (MODEL_COSTS['openai/gpt-4o']) {
      paidModels.push({ model: 'openai/gpt-4o', provider: 'openai', tier: 'premium' });
    }
    if (MODEL_COSTS['anthropic/claude-3.5-sonnet']) {
      paidModels.push({ model: 'anthropic/claude-3.5-sonnet', provider: 'anthropic', tier: 'premium' });
    }

    return paidModels;
  }
}
