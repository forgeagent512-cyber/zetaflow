export const OPENROUTER_MODELS = [
    'openai/gpt-4o-mini',
    'anthropic/claude-3.5-sonnet',
    'google/gemini-2.0-flash-001',
    'meta-llama/llama-3.1-8b-instruct'
];
export const OPENAI_MODELS = [
    'gpt-4o-mini',
    'gpt-4o',
    'gpt-4-turbo'
];
export const ANTHROPIC_MODELS = [
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022'
];
export const GEMINI_MODELS = [
    'gemini-2.0-flash-001',
    'gemini-1.5-pro-001'
];
export const MODEL_COSTS = {
    'openai/gpt-4o-mini': { model: 'openai/gpt-4o-mini', inputCostPer1K: 0.00015, outputCostPer1K: 0.0006 },
    'openai/gpt-4o': { model: 'openai/gpt-4o', inputCostPer1K: 0.0025, outputCostPer1K: 0.01 },
    'openai/gpt-4-turbo': { model: 'openai/gpt-4-turbo', inputCostPer1K: 0.01, outputCostPer1K: 0.03 },
    'gpt-4o-mini': { model: 'gpt-4o-mini', inputCostPer1K: 0.00015, outputCostPer1K: 0.0006 },
    'gpt-4o': { model: 'gpt-4o', inputCostPer1K: 0.0025, outputCostPer1K: 0.01 },
    'gpt-4-turbo': { model: 'gpt-4-turbo', inputCostPer1K: 0.01, outputCostPer1K: 0.03 },
    'anthropic/claude-3.5-sonnet': { model: 'anthropic/claude-3.5-sonnet', inputCostPer1K: 0.003, outputCostPer1K: 0.015 },
    'anthropic/claude-3.5-haiku': { model: 'anthropic/claude-3.5-haiku', inputCostPer1K: 0.001, outputCostPer1K: 0.005 },
    'claude-3-5-sonnet-20241022': { model: 'claude-3-5-sonnet-20241022', inputCostPer1K: 0.003, outputCostPer1K: 0.015 },
    'claude-3-5-haiku-20241022': { model: 'claude-3-5-haiku-20241022', inputCostPer1K: 0.001, outputCostPer1K: 0.005 },
    'google/gemini-2.0-flash-001': { model: 'google/gemini-2.0-flash-001', inputCostPer1K: 0.0001, outputCostPer1K: 0.0004 },
    'google/gemini-1.5-pro-001': { model: 'google/gemini-1.5-pro-001', inputCostPer1K: 0.00125, outputCostPer1K: 0.005 },
    'gemini-2.0-flash-001': { model: 'gemini-2.0-flash-001', inputCostPer1K: 0.0001, outputCostPer1K: 0.0004 },
    'gemini-1.5-pro-001': { model: 'gemini-1.5-pro-001', inputCostPer1K: 0.00125, outputCostPer1K: 0.005 },
    'meta-llama/llama-3.1-8b-instruct': { model: 'meta-llama/llama-3.1-8b-instruct', inputCostPer1K: 0.00005, outputCostPer1K: 0.00005 }
};
export const FALLBACK_CHAINS = {
    'openai/gpt-4o-mini': ['openai/gpt-4o-mini', 'openai/gpt-4o', 'anthropic/claude-3.5-sonnet', 'google/gemini-2.0-flash-001'],
    'openai/gpt-4o': ['openai/gpt-4o', 'openai/gpt-4o-mini', 'anthropic/claude-3.5-sonnet', 'google/gemini-2.0-flash-001'],
    'gpt-4o-mini': ['gpt-4o-mini', 'gpt-4o', 'claude-3-5-sonnet-20241022', 'gemini-2.0-flash-001'],
    'gpt-4o': ['gpt-4o', 'gpt-4o-mini', 'claude-3-5-sonnet-20241022', 'gemini-2.0-flash-001'],
    'anthropic/claude-3.5-sonnet': ['anthropic/claude-3.5-sonnet', 'openai/gpt-4o', 'google/gemini-2.0-flash-001', 'openai/gpt-4o-mini'],
    'claude-3-5-sonnet-20241022': ['claude-3-5-sonnet-20241022', 'gpt-4o', 'gemini-2.0-flash-001', 'gpt-4o-mini'],
    'google/gemini-2.0-flash-001': ['google/gemini-2.0-flash-001', 'openai/gpt-4o-mini', 'anthropic/claude-3.5-sonnet', 'meta-llama/llama-3.1-8b-instruct'],
    'gemini-2.0-flash-001': ['gemini-2.0-flash-001', 'gpt-4o-mini', 'claude-3-5-sonnet-20241022', 'gpt-4o']
};
export function resolveModel(model) {
    if (model && model.trim()) {
        return model.trim();
    }
    return process.env.OPENROUTER_MODEL ?? OPENROUTER_MODELS[0];
}
export function getFallbackChain(model) {
    return FALLBACK_CHAINS[model] ?? [model, ...OPENROUTER_MODELS.filter(m => m !== model)];
}
export function estimateTokens(text) {
    return Math.ceil(text.length / 4);
}
export function calculateCost(model, promptTokens, completionTokens) {
    const costEntry = MODEL_COSTS[model];
    if (!costEntry) {
        return { totalCost: 0, costPerToken: 0 };
    }
    const inputCost = (promptTokens / 1000) * costEntry.inputCostPer1K;
    const outputCost = (completionTokens / 1000) * costEntry.outputCostPer1K;
    const totalCost = Number((inputCost + outputCost).toFixed(10));
    const totalTokens = promptTokens + completionTokens || 1;
    const costPerToken = Number((totalCost / totalTokens).toFixed(10));
    return { totalCost, costPerToken };
}
export function estimateCost(model, promptText) {
    const inputTokens = estimateTokens(promptText);
    const outputTokens = Math.ceil(inputTokens * 0.4);
    const { totalCost } = calculateCost(model, inputTokens, outputTokens);
    return { inputTokens, outputTokens, estimatedCost: totalCost };
}
