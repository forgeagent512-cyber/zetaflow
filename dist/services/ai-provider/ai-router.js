import { ProviderFactory } from './provider-factory.js';
import { ModelSelector } from './model-selector.js';
const TIER_CONFIGS = {
    economy: {
        label: 'Economy AI',
        models: {
            coding: 'google/gemini-2.0-flash-001',
            workflow: 'google/gemini-2.0-flash-001',
            reasoning: 'google/gemini-2.0-flash-001',
            writing: 'meta-llama/llama-3.1-8b-instruct',
            vision: 'google/gemini-2.0-flash-001',
        },
        provider: 'openrouter',
        maxCostPerRequest: 0.001,
    },
    balanced: {
        label: 'Balanced AI',
        models: {
            coding: 'openai/gpt-4o-mini',
            workflow: 'openai/gpt-4o-mini',
            reasoning: 'anthropic/claude-3.5-haiku',
            writing: 'openai/gpt-4o-mini',
            vision: 'openai/gpt-4o-mini',
        },
        provider: 'openrouter',
        maxCostPerRequest: 0.01,
    },
    premium: {
        label: 'Premium AI',
        models: {
            coding: 'openai/gpt-4o',
            workflow: 'openai/gpt-4o',
            reasoning: 'anthropic/claude-3.5-sonnet',
            writing: 'openai/gpt-4o',
            vision: 'openai/gpt-4o',
        },
        provider: 'openrouter',
        maxCostPerRequest: 0.05,
    },
    enterprise: {
        label: 'Enterprise AI',
        models: {
            coding: 'openai/gpt-4o',
            workflow: 'anthropic/claude-3.5-sonnet',
            reasoning: 'anthropic/claude-3.5-sonnet',
            writing: 'openai/gpt-4o',
            vision: 'openai/gpt-4o',
        },
        provider: 'openrouter',
        maxCostPerRequest: 0.5,
    },
};
export class AiRouter {
    selector = new ModelSelector();
    getTierLabel(tier) {
        return TIER_CONFIGS[tier].label;
    }
    async route(taskType, messages, tier = 'balanced', options) {
        const config = TIER_CONFIGS[tier];
        const model = config.models[taskType];
        const provider = ProviderFactory.create(config.provider);
        const request = {
            model,
            messages,
            temperature: options?.temperature ?? 0.2,
            maxTokens: options?.maxTokens ?? 2048,
        };
        const response = await provider.generate(request);
        return {
            content: response.content,
            model: response.model,
            tier: config.label,
            cost: response.cost?.totalCost ?? 0,
        };
    }
    detectTaskType(prompt, context) {
        const combined = `${prompt} ${context ?? ''}`.toLowerCase();
        if (/\b(html|css|javascript|typescript|python|code|function|class|api|endpoint|route|middleware|database|sql|query)\b/i.test(combined)) {
            return 'coding';
        }
        if (/\b(workflow|n8n|automation|trigger|node|webhook|action|connection)\b/i.test(combined)) {
            return 'workflow';
        }
        if (/\b(analyze|reason|think|conclude|evaluate|compare|contrast|diagnose|audit)\b/i.test(combined)) {
            return 'reasoning';
        }
        if (/\b(image|photo|picture|video|vision|detect|recognize|visual|screenshot)\b/i.test(combined)) {
            return 'vision';
        }
        return 'writing';
    }
    selectTier(organizationTier) {
        switch (organizationTier?.toLowerCase()) {
            case 'enterprise': return 'enterprise';
            case 'premium': return 'premium';
            case 'balanced': return 'balanced';
            default: return 'economy';
        }
    }
}
