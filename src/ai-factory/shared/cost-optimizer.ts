export interface ModelOption {
  name: string;
  provider: string;
  inputCostPer1K: number;
  outputCostPer1K: number;
  maxTokens: number;
  capabilities: string[];
}

const DEFAULT_MODELS: ModelOption[] = [
  { name: 'gemini-2.0-flash', provider: 'gemini', inputCostPer1K: 0.0001, outputCostPer1K: 0.0004, maxTokens: 8192, capabilities: ['text', 'code', 'reasoning'] },
  { name: 'gpt-4o-mini', provider: 'openai', inputCostPer1K: 0.00015, outputCostPer1K: 0.0006, maxTokens: 16384, capabilities: ['text', 'code', 'reasoning', 'vision'] },
  { name: 'gpt-4o', provider: 'openai', inputCostPer1K: 0.0025, outputCostPer1K: 0.01, maxTokens: 16384, capabilities: ['text', 'code', 'reasoning', 'vision'] },
  { name: 'claude-3-5-sonnet', provider: 'claude', inputCostPer1K: 0.003, outputCostPer1K: 0.015, maxTokens: 8192, capabilities: ['text', 'code', 'reasoning'] },
  { name: 'deepseek-chat', provider: 'deepseek', inputCostPer1K: 0.00014, outputCostPer1K: 0.00028, maxTokens: 32768, capabilities: ['text', 'code'] },
  { name: 'mistral-large', provider: 'mistral', inputCostPer1K: 0.002, outputCostPer1K: 0.006, maxTokens: 8192, capabilities: ['text', 'code', 'reasoning'] },
  { name: 'llama-3-70b', provider: 'llama', inputCostPer1K: 0.00059, outputCostPer1K: 0.00079, maxTokens: 8192, capabilities: ['text', 'code'] },
  { name: 'openrouter/auto', provider: 'openrouter', inputCostPer1K: 0.001, outputCostPer1K: 0.003, maxTokens: 16384, capabilities: ['text', 'code', 'reasoning', 'vision'] }
];

export class CostOptimizer {
  private models: ModelOption[];

  constructor(models: ModelOption[] = DEFAULT_MODELS) {
    this.models = models;
  }

  selectCheapest(capabilities: string[], maxTokens?: number): ModelOption {
    const candidates = this.filterModels(capabilities, maxTokens);
    if (candidates.length === 0) {
      throw new Error('No model matches the specified capabilities');
    }
    return candidates.reduce((a, b) =>
      a.inputCostPer1K + a.outputCostPer1K < b.inputCostPer1K + b.outputCostPer1K ? a : b
    );
  }

  selectBestValue(capabilities: string[], maxCost: number): ModelOption {
    const candidates = this.filterModels(capabilities).filter(
      (m) => m.inputCostPer1K + m.outputCostPer1K <= maxCost
    );
    if (candidates.length === 0) {
      throw new Error('No model matches the specified capabilities and cost limit');
    }
    return candidates.reduce((a, b) =>
      a.maxTokens / (a.inputCostPer1K + a.outputCostPer1K) >
      b.maxTokens / (b.inputCostPer1K + b.outputCostPer1K) ? a : b
    );
  }

  estimateCost(model: string, inputTokens: number, outputTokens: number): number {
    const entry = this.models.find((m) => m.name === model);
    if (!entry) {
      throw new Error(`Unknown model: ${model}`);
    }
    const inputCost = (inputTokens / 1000) * entry.inputCostPer1K;
    const outputCost = (outputTokens / 1000) * entry.outputCostPer1K;
    return inputCost + outputCost;
  }

  private filterModels(capabilities: string[], maxTokens?: number): ModelOption[] {
    return this.models.filter((m) => {
      const hasCapabilities = capabilities.every((c) => m.capabilities.includes(c));
      const withinTokens = maxTokens ? m.maxTokens >= maxTokens : true;
      return hasCapabilities && withinTokens;
    });
  }
}
