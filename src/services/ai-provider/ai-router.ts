import { ProviderFactory } from './provider-factory.js';
import type { AIProvider, AIProviderRequest, AIProviderResponse, ProviderType } from './ai-provider.types.js';
import { ModelSelector } from './model-selector.js';

export type AiTier = 'economy' | 'balanced' | 'premium' | 'enterprise';

interface TierConfig {
  label: string;
  models: {
    coding: string;
    workflow: string;
    reasoning: string;
    writing: string;
    vision: string;
  };
  provider: ProviderType;
  maxCostPerRequest: number;
}

const TIER_CONFIGS: Record<AiTier, TierConfig> = {
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

export type AiTaskType = 'coding' | 'workflow' | 'reasoning' | 'writing' | 'vision';

export class AiRouter {
  private selector = new ModelSelector();

  getTierLabel(tier: AiTier): string {
    return TIER_CONFIGS[tier].label;
  }

  async route(
    taskType: AiTaskType,
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    tier: AiTier = 'balanced',
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<{ content: string; model: string; tier: string; cost: number }> {
    const config = TIER_CONFIGS[tier];
    const model = config.models[taskType];
    const provider: AIProvider = ProviderFactory.create(config.provider);

    const request: AIProviderRequest = {
      model,
      messages,
      temperature: options?.temperature ?? 0.2,
      maxTokens: options?.maxTokens ?? 2048,
    };

    const response: AIProviderResponse = await provider.generate(request);

    return {
      content: response.content,
      model: response.model,
      tier: config.label,
      cost: response.cost?.totalCost ?? 0,
    };
  }

  detectTaskType(prompt: string, context?: string): AiTaskType {
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

  selectTier(organizationTier?: string): AiTier {
    switch (organizationTier?.toLowerCase()) {
      case 'enterprise': return 'enterprise';
      case 'premium': return 'premium';
      case 'balanced': return 'balanced';
      default: return 'economy';
    }
  }
}
