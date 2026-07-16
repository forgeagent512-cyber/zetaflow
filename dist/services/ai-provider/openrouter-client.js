import { resolveModel, getFallbackChain, calculateCost, estimateTokens } from './model-registry.js';
import { getOpenRouterConfig } from './ai-provider.config.js';
export class OpenRouterClient {
    config;
    trackedCosts = [];
    constructor(config) {
        this.config = config ?? getOpenRouterConfig();
    }
    getTrackedCosts() {
        return [...this.trackedCosts];
    }
    getFeatures() {
        return {
            supportsStreaming: true,
            supportsFunctions: true,
            maxTokens: 128000,
            models: ['openai/gpt-4o-mini', 'anthropic/claude-3.5-sonnet', 'google/gemini-2.0-flash-001', 'meta-llama/llama-3.1-8b-instruct']
        };
    }
    async generate(request) {
        const model = resolveModel(request.model);
        const fallbackChain = getFallbackChain(model);
        let lastError;
        for (const fallbackModel of fallbackChain) {
            try {
                const response = await this.requestWithRetry({ ...request, model: fallbackModel });
                const payload = await response.json();
                const choice = Array.isArray(payload.choices) ? payload.choices[0] : undefined;
                const message = choice?.message;
                const content = typeof message?.content === 'string' ? message.content : '';
                const usage = payload.usage;
                let promptTokens = Number(usage?.prompt_tokens ?? 0);
                let completionTokens = Number(usage?.completion_tokens ?? 0);
                if (!promptTokens && !completionTokens) {
                    const promptText = request.messages.map(m => m.content).join(' ');
                    promptTokens = estimateTokens(promptText);
                    completionTokens = estimateTokens(content);
                }
                const costResult = calculateCost(fallbackModel, promptTokens, completionTokens);
                const cost = {
                    totalCost: costResult.totalCost,
                    costPerToken: costResult.costPerToken,
                    model: fallbackModel,
                    provider: this.getProviderName()
                };
                this.trackedCosts.push(cost);
                return {
                    content,
                    model: typeof payload.model === 'string' ? payload.model : fallbackModel,
                    provider: this.getProviderName(),
                    usage: {
                        promptTokens,
                        completionTokens,
                        totalTokens: promptTokens + completionTokens
                    },
                    cost
                };
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error('Request failed');
                continue;
            }
        }
        throw lastError ?? new Error(`All models in fallback chain failed for ${model}`);
    }
    async *stream(request) {
        const model = resolveModel(request.model);
        const fallbackChain = getFallbackChain(model);
        let lastError;
        for (const fallbackModel of fallbackChain) {
            try {
                const response = await this.requestWithRetry({ ...request, model: fallbackModel, stream: true });
                const contentType = response.headers.get('content-type') ?? '';
                if (contentType.includes('text/event-stream')) {
                    const reader = response.body?.getReader();
                    if (!reader) {
                        yield '';
                        return;
                    }
                    const decoder = new TextDecoder();
                    let buffer = '';
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done)
                            break;
                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split('\n');
                        buffer = lines.pop() ?? '';
                        for (const line of lines) {
                            const trimmed = line.trim();
                            if (!trimmed || !trimmed.startsWith('data:'))
                                continue;
                            const data = trimmed.slice(5).trim();
                            if (data === '[DONE]')
                                return;
                            try {
                                const parsed = JSON.parse(data);
                                const choices = parsed.choices;
                                if (!choices || choices.length === 0)
                                    continue;
                                const delta = choices[0]?.delta;
                                const content = typeof delta?.content === 'string' ? delta.content : '';
                                if (content)
                                    yield content;
                            }
                            catch {
                                continue;
                            }
                        }
                    }
                }
                else {
                    const payload = await response.json();
                    const choice = Array.isArray(payload.choices) ? payload.choices[0] : undefined;
                    const message = choice?.message;
                    const content = typeof message?.content === 'string' ? message.content : '';
                    yield content;
                }
                return;
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error('Stream request failed');
                continue;
            }
        }
        throw lastError ?? new Error(`All models in fallback chain failed for streaming ${model}`);
    }
    async health() {
        try {
            const response = await fetch(`${this.config.baseUrl ?? this.getDefaultBaseUrl()}/models`, {
                headers: {
                    Authorization: `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json'
                },
                signal: AbortSignal.timeout(this.config.timeoutMs ?? 30000)
            });
            return {
                status: response.ok ? 'ok' : 'degraded',
                provider: this.getProviderName(),
                details: { status: response.status }
            };
        }
        catch (error) {
            return {
                status: 'error',
                provider: this.getProviderName(),
                details: { message: error instanceof Error ? error.message : 'Unknown error' }
            };
        }
    }
    async requestWithRetry(request) {
        let lastError;
        for (let attempt = 0; attempt <= (this.config.retries ?? 3); attempt += 1) {
            try {
                return await fetch(`${this.getBaseUrl()}/chat/completions`, {
                    method: 'POST',
                    headers: this.getHeaders(),
                    body: JSON.stringify({
                        model: resolveModel(request.model),
                        messages: request.messages,
                        temperature: request.temperature ?? 0.2,
                        max_tokens: request.maxTokens ?? 1024,
                        stream: request.stream ?? false
                    }),
                    signal: AbortSignal.timeout(this.config.timeoutMs ?? 30000)
                });
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error('Request failed');
            }
        }
        throw lastError ?? new Error(`${this.getProviderName()} request failed`);
    }
    getProviderName() {
        return 'openrouter';
    }
    getBaseUrl() {
        return this.config.baseUrl ?? this.getDefaultBaseUrl();
    }
    getDefaultBaseUrl() {
        return 'https://openrouter.ai/api/v1';
    }
    getHeaders() {
        return {
            Authorization: `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.APP_BASE_URL ?? 'http://localhost:3000',
            'X-Title': process.env.APP_NAME ?? 'AI Real Estate Sales Employee'
        };
    }
}
