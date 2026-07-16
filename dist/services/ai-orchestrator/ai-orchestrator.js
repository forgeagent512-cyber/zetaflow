import { TaskClassifier } from './task-classifier.js';
import { FreeModelRouter } from './free-model-router.js';
import { FallbackEngine } from './fallback-engine.js';
import { CostOptimizer } from './cost-optimizer.js';
import { ProviderHealthMonitor } from './provider-health-monitor.js';
export class AIOrchestrator {
    classifier;
    modelRouter;
    fallbackEngine;
    costOptimizer;
    healthMonitor;
    config;
    constructor(config, classifier, modelRouter, fallbackEngine, costOptimizer, healthMonitor) {
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
    async process(request) {
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
                if (m.model === modelInfo.model)
                    return false;
                const pStatus = this.healthMonitor.getProviderStatus(m.provider);
                return pStatus.then(s => s.status !== 'unhealthy').catch(() => false);
            });
            if (healthyModel) {
                modelInfo.model = healthyModel.model;
                modelInfo.provider = healthyModel.provider;
            }
        }
        const costEstimate = this.costOptimizer.estimateCost(modelInfo.model, promptText, request.tier);
        const enrichedRequest = {
            ...request,
            taskType: classified.taskType
        };
        let finalResponse;
        if (this.config.enableFallback) {
            try {
                finalResponse = await this.fallbackEngine.executeWithFallback(enrichedRequest);
            }
            catch (fallbackError) {
                this.healthMonitor.recordFailure(modelInfo.provider, modelInfo.model);
                if (this.config.enablePaidFallback) {
                    try {
                        const paidResponse = await this.executePaidFallback(enrichedRequest);
                        return paidResponse;
                    }
                    catch (paidError) {
                        throw new Error(`All fallback attempts failed: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`);
                    }
                }
                throw fallbackError;
            }
        }
        else {
            const { FallbackEngine: FE } = await import('./fallback-engine.js');
            const directEngine = new FE();
            finalResponse = await directEngine.executeWithFallback(enrichedRequest);
        }
        const latency = (Date.now() - startTime) / 1000;
        const response = {
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
        await this.costOptimizer.trackUsage(enrichedRequest, response).catch(() => { });
        return response;
    }
    async executePaidFallback(request) {
        const paidTiers = ['balanced', 'premium'];
        const lastError = [];
        for (const tier of paidTiers) {
            try {
                const paidRequest = { ...request, tier };
                return await this.fallbackEngine.executeWithFallback(paidRequest);
            }
            catch (error) {
                if (error instanceof Error) {
                    lastError.push(error);
                }
            }
        }
        throw new Error(`Paid fallback failed: ${lastError.map(e => e.message).join('; ')}`);
    }
    async generate(prompt, context, model) {
        const messages = [];
        if (context)
            messages.push({ role: 'system', content: context });
        messages.push({ role: 'user', content: prompt });
        return this.process({ messages, tier: 'economy' });
    }
    async classify(input, categories) {
        return this.classifier.classify(input, categories.join(' '));
    }
    async estimateCost(model, tokens, operation) {
        return this.costOptimizer.estimateCost(model, '', 'economy');
    }
    async selectModel(task, requirements) {
        const classified = this.classifier.classify(task);
        return this.modelRouter.getBestModel(classified.taskType);
    }
    async compare(prompt, models) {
        const results = [];
        for (const model of models) {
            try {
                const messages = [{ role: 'user', content: prompt }];
                const result = await this.process({ messages, tier: 'economy' });
                results.push(result);
            }
            catch {
                continue;
            }
        }
        return results;
    }
    async healthCheck() {
        return this.healthMonitor.checkHealth();
    }
    async getProviderStatus() {
        return this.healthMonitor.checkHealth();
    }
    getFreeModels() {
        return this.modelRouter.getAllFreeModels();
    }
    getClassifier() {
        return this.classifier;
    }
    getModelRouter() {
        return this.modelRouter;
    }
    getFallbackEngine() {
        return this.fallbackEngine;
    }
    getCostOptimizer() {
        return this.costOptimizer;
    }
    getHealthMonitor() {
        return this.healthMonitor;
    }
    getConfig() {
        return { ...this.config };
    }
}
