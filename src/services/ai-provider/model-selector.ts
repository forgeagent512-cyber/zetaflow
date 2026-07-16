import { MODEL_COSTS, OPENROUTER_MODELS, OPENAI_MODELS, ANTHROPIC_MODELS, GEMINI_MODELS } from './model-registry.js';
import { ProviderFactory } from './provider-factory.js';
import type { ModelSelectionCriteria, ProviderType, AIProvider } from './ai-provider.types.js';
import { randomUUID } from 'node:crypto';

export interface SelectedModel {
  model: string;
  provider: ProviderType;
  inputCostPer1K: number;
  outputCostPer1K: number;
  estimatedTotalCost: number;
}

export class ModelSelector {
  selectByCriteria(criteria: ModelSelectionCriteria): SelectedModel {
    const candidates = this.getCandidates(criteria);
    if (candidates.length === 0) {
      return this.getDefaultFallback();
    }
    return candidates[0];
  }

  selectCheapest(capabilities: string[]): SelectedModel {
    return this.selectByCriteria({ capabilities });
  }

  selectBestValue(capabilities: string[], maxCostPer1K: number): SelectedModel {
    return this.selectByCriteria({ capabilities, maxCostPer1K });
  }

  selectForTask(taskType: 'analysis' | 'generation' | 'chat' | 'embedding'): SelectedModel {
    switch (taskType) {
      case 'analysis':
        return this.selectByCriteria({ capabilities: ['reasoning'], maxCostPer1K: 0.005 });
      case 'generation':
        return this.selectByCriteria({ capabilities: ['code'], maxCostPer1K: 0.01 });
      case 'chat':
        return this.selectByCriteria({ capabilities: ['text'], maxCostPer1K: 0.003 });
      case 'embedding':
        return { model: 'openai/gpt-4o-mini', provider: 'openrouter', inputCostPer1K: 0.00015, outputCostPer1K: 0.0006, estimatedTotalCost: 0 };
    }
  }

  private getCandidates(criteria: ModelSelectionCriteria): SelectedModel[] {
    const allModels = [
      ...OPENROUTER_MODELS.map(m => ({ model: m, provider: 'openrouter' as ProviderType })),
      ...OPENAI_MODELS.map(m => ({ model: m, provider: 'openai' as ProviderType })),
      ...ANTHROPIC_MODELS.map(m => ({ model: m, provider: 'anthropic' as ProviderType })),
      ...GEMINI_MODELS.map(m => ({ model: m, provider: 'gemini' as ProviderType }))
    ];

    const scored = allModels
      .filter(m => MODEL_COSTS[m.model])
      .map(m => {
        const cost = MODEL_COSTS[m.model];
        const totalCostPer1K = cost.inputCostPer1K + cost.outputCostPer1K;
        return { ...m, ...cost, totalCostPer1K };
      })
      .filter(m => {
        if (criteria.preferredProvider && m.provider !== criteria.preferredProvider) return false;
        if (criteria.maxCostPer1K && m.totalCostPer1K > criteria.maxCostPer1K) return false;
        return true;
      })
      .sort((a, b) => a.totalCostPer1K - b.totalCostPer1K);

    return scored.map(s => ({
      model: s.model,
      provider: s.provider,
      inputCostPer1K: s.inputCostPer1K,
      outputCostPer1K: s.outputCostPer1K,
      estimatedTotalCost: s.totalCostPer1K
    }));
  }

  private getDefaultFallback(): SelectedModel {
    const m = MODEL_COSTS['openai/gpt-4o-mini'];
    return {
      model: 'openai/gpt-4o-mini',
      provider: 'openrouter',
      inputCostPer1K: m.inputCostPer1K,
      outputCostPer1K: m.outputCostPer1K,
      estimatedTotalCost: m.inputCostPer1K + m.outputCostPer1K
    };
  }
}

export function trackStreamingCost(model: string, provider: string, promptText: string): StreamingCostEntry {
  const estimatedPromptTokens = Math.ceil(promptText.length / 4);
  const costEntry = MODEL_COSTS[model];
  const estimatedCost = costEntry
    ? ((estimatedPromptTokens / 1000) * costEntry.inputCostPer1K)
    : 0;

  return {
    streamId: randomUUID(),
    model,
    provider,
    estimatedPromptTokens,
    estimatedCompletionTokens: 0,
    estimatedCost,
    startedAt: new Date().toISOString()
  };
}

export interface StreamingCostEntry {
  streamId: string;
  model: string;
  provider: string;
  estimatedPromptTokens: number;
  estimatedCompletionTokens: number;
  estimatedCost: number;
  startedAt: string;
}

export interface ProviderSwitchResult {
  from: ProviderType;
  to: ProviderType;
  instance: AIProvider;
  reason: string;
}
