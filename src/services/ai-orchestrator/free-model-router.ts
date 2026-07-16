import type { AiTaskType, FreeModelInfo } from './ai-orchestrator.types.js';

interface FreeModelDefinition {
  model: string;
  provider: string;
  contextWindow: number;
  capabilities: Partial<Record<AiTaskType, number>>;
  rateLimit: { requestsPerMin: number; tokensPerMin: number };
}

const FREE_MODELS: FreeModelDefinition[] = [
  {
    model: 'google/gemini-2.0-flash-001',
    provider: 'google',
    contextWindow: 1048576,
    capabilities: {
      coding: 0.9, reasoning: 0.85, workflow: 0.8, planning: 0.8,
      vision: 0.9, writing: 0.85, summarization: 0.9, translation: 0.85,
      analysis: 0.85, chat: 0.9, content_writing: 0.8, marketing: 0.75,
      sales: 0.7, customer_support: 0.85, image_analysis: 0.9,
      document_processing: 0.85, knowledge_search: 0.8,
      prompt_engineering: 0.8, business_analysis: 0.8
    },
    rateLimit: { requestsPerMin: 60, tokensPerMin: 1000000 }
  },
  {
    model: 'meta-llama/llama-3.1-8b-instruct',
    provider: 'meta',
    contextWindow: 131072,
    capabilities: {
      coding: 0.7, reasoning: 0.7, workflow: 0.65, planning: 0.65,
      vision: 0, writing: 0.75, summarization: 0.8, translation: 0.7,
      analysis: 0.7, chat: 0.8, content_writing: 0.7, marketing: 0.65,
      sales: 0.6, customer_support: 0.75, image_analysis: 0,
      document_processing: 0.7, knowledge_search: 0.65,
      prompt_engineering: 0.65, business_analysis: 0.65
    },
    rateLimit: { requestsPerMin: 30, tokensPerMin: 500000 }
  },
  {
    model: 'mistralai/mistral-7b-instruct',
    provider: 'mistral',
    contextWindow: 32768,
    capabilities: {
      coding: 0.65, reasoning: 0.7, workflow: 0.6, planning: 0.6,
      vision: 0, writing: 0.7, summarization: 0.75, translation: 0.7,
      analysis: 0.7, chat: 0.75, content_writing: 0.65, marketing: 0.6,
      sales: 0.55, customer_support: 0.7, image_analysis: 0,
      document_processing: 0.65, knowledge_search: 0.6,
      prompt_engineering: 0.6, business_analysis: 0.6
    },
    rateLimit: { requestsPerMin: 30, tokensPerMin: 400000 }
  },
  {
    model: 'microsoft/phi-3-mini',
    provider: 'microsoft',
    contextWindow: 128000,
    capabilities: {
      coding: 0.6, reasoning: 0.55, workflow: 0.5, planning: 0.5,
      vision: 0, writing: 0.6, summarization: 0.65, translation: 0.55,
      analysis: 0.55, chat: 0.65, content_writing: 0.55, marketing: 0.5,
      sales: 0.45, customer_support: 0.6, image_analysis: 0,
      document_processing: 0.55, knowledge_search: 0.5,
      prompt_engineering: 0.5, business_analysis: 0.5
    },
    rateLimit: { requestsPerMin: 30, tokensPerMin: 300000 }
  },
  {
    model: 'google/gemma-2-9b-it',
    provider: 'google',
    contextWindow: 8192,
    capabilities: {
      coding: 0.55, reasoning: 0.55, workflow: 0.5, planning: 0.5,
      vision: 0, writing: 0.6, summarization: 0.65, translation: 0.55,
      analysis: 0.55, chat: 0.65, content_writing: 0.55, marketing: 0.5,
      sales: 0.45, customer_support: 0.6, image_analysis: 0,
      document_processing: 0.5, knowledge_search: 0.5,
      prompt_engineering: 0.5, business_analysis: 0.5
    },
    rateLimit: { requestsPerMin: 30, tokensPerMin: 250000 }
  }
];

const FALLBACK_CHAINS: Partial<Record<AiTaskType, string[]>> = {
  coding: ['google/gemini-2.0-flash-001', 'meta-llama/llama-3.1-8b-instruct', 'mistralai/mistral-7b-instruct', 'microsoft/phi-3-mini', 'google/gemma-2-9b-it'],
  reasoning: ['google/gemini-2.0-flash-001', 'meta-llama/llama-3.1-8b-instruct', 'mistralai/mistral-7b-instruct', 'google/gemma-2-9b-it', 'microsoft/phi-3-mini'],
  vision: ['google/gemini-2.0-flash-001'],
  image_analysis: ['google/gemini-2.0-flash-001'],
  workflow: ['google/gemini-2.0-flash-001', 'meta-llama/llama-3.1-8b-instruct', 'mistralai/mistral-7b-instruct', 'microsoft/phi-3-mini'],
  writing: ['google/gemini-2.0-flash-001', 'meta-llama/llama-3.1-8b-instruct', 'mistralai/mistral-7b-instruct', 'google/gemma-2-9b-it', 'microsoft/phi-3-mini'],
  summarization: ['meta-llama/llama-3.1-8b-instruct', 'google/gemini-2.0-flash-001', 'mistralai/mistral-7b-instruct', 'google/gemma-2-9b-it', 'microsoft/phi-3-mini'],
  chat: ['meta-llama/llama-3.1-8b-instruct', 'google/gemini-2.0-flash-001', 'mistralai/mistral-7b-instruct', 'microsoft/phi-3-mini', 'google/gemma-2-9b-it'],
  analysis: ['google/gemini-2.0-flash-001', 'meta-llama/llama-3.1-8b-instruct', 'mistralai/mistral-7b-instruct', 'google/gemma-2-9b-it'],
  translation: ['google/gemini-2.0-flash-001', 'meta-llama/llama-3.1-8b-instruct', 'mistralai/mistral-7b-instruct', 'google/gemma-2-9b-it'],
  knowledge_search: ['google/gemini-2.0-flash-001', 'meta-llama/llama-3.1-8b-instruct', 'mistralai/mistral-7b-instruct'],
  document_processing: ['google/gemini-2.0-flash-001', 'meta-llama/llama-3.1-8b-instruct', 'mistralai/mistral-7b-instruct'],
  prompt_engineering: ['google/gemini-2.0-flash-001', 'meta-llama/llama-3.1-8b-instruct', 'mistralai/mistral-7b-instruct'],
  business_analysis: ['google/gemini-2.0-flash-001', 'meta-llama/llama-3.1-8b-instruct', 'mistralai/mistral-7b-instruct']
};

function calculateScore(model: FreeModelDefinition, taskType: AiTaskType): number {
  const capabilityScore = model.capabilities[taskType] ?? 0;
  const contextScore = Math.min(model.contextWindow / 1048576, 1);
  return (capabilityScore * 0.7) + (contextScore * 0.3);
}

export class FreeModelRouter {
  private models: FreeModelDefinition[] = [...FREE_MODELS];

  getBestModel(taskType: AiTaskType): FreeModelInfo {
    const available = this.models
      .filter(m => (m.capabilities[taskType] ?? 0) > 0)
      .sort((a, b) => calculateScore(b, taskType) - calculateScore(a, taskType));

    if (available.length === 0) {
      const fallback = this.models[0];
      return {
        model: fallback.model,
        provider: fallback.provider,
        score: 0,
        contextWindow: fallback.contextWindow,
        capabilities: Object.entries(fallback.capabilities)
          .filter(([, v]) => v > 0)
          .map(([k]) => k)
      };
    }

    const best = available[0];
    return {
      model: best.model,
      provider: best.provider,
      score: calculateScore(best, taskType),
      contextWindow: best.contextWindow,
      capabilities: Object.entries(best.capabilities)
        .filter(([, v]) => v > 0)
        .map(([k]) => k)
    };
  }

  getFallbackModel(failedModel: string, taskType: AiTaskType): FreeModelInfo {
    const chain = FALLBACK_CHAINS[taskType] ?? Object.values(FALLBACK_CHAINS).flat().filter(Boolean);
    const failedIndex = chain.indexOf(failedModel);
    const candidates = chain.slice(failedIndex + 1);

    for (const modelName of candidates) {
      const modelDef = this.models.find(m => m.model === modelName);
      if (modelDef) {
        return {
          model: modelDef.model,
          provider: modelDef.provider,
          score: calculateScore(modelDef, taskType),
          contextWindow: modelDef.contextWindow,
          capabilities: Object.entries(modelDef.capabilities)
            .filter(([, v]) => v > 0)
            .map(([k]) => k)
        };
      }
    }

    return this.getBestModel(taskType);
  }

  getAllFreeModels(): FreeModelInfo[] {
    return this.models.map(m => ({
      model: m.model,
      provider: m.provider,
      score: 0,
      contextWindow: m.contextWindow,
      capabilities: Object.entries(m.capabilities)
        .filter(([, v]) => v > 0)
        .map(([k]) => k)
    }));
  }

  async refreshModels(): Promise<void> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json() as { data: Array<Record<string, unknown>> };
      const freeModels = (data.data ?? []).filter((m: Record<string, unknown>) => {
        const pricing = m.pricing as Record<string, unknown> | undefined;
        if (!pricing) return false;
        const prompt = Number(pricing.prompt ?? 1);
        const completion = Number(pricing.completion ?? 1);
        return prompt === 0 && completion === 0;
      });

      if (freeModels.length > 0) {
        const refreshed = freeModels.map((m: Record<string, unknown>) => {
          const existing = this.models.find(e => e.model === m.id);
          return {
            model: m.id as string,
            provider: (m.id as string).split('/')[0] ?? 'unknown',
            contextWindow: Number(m.context_length ?? (existing?.contextWindow ?? 4096)),
            capabilities: existing?.capabilities ?? FREE_MODELS[0].capabilities,
            rateLimit: existing?.rateLimit ?? { requestsPerMin: 30, tokensPerMin: 250000 }
          };
        });

        for (const model of refreshed) {
          const idx = this.models.findIndex(m => m.model === model.model);
          if (idx >= 0) {
            this.models[idx] = model;
          } else {
            this.models.push(model);
          }
        }
      }
    } catch {
      // silently fail; keep existing model list
    }
  }
}
