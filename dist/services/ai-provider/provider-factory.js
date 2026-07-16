import { OpenRouterClient } from './openrouter-client.js';
import { getOpenAIConfig, getAnthropicConfig, getGeminiConfig } from './ai-provider.config.js';
class OpenAIClient extends OpenRouterClient {
    constructor() {
        super(getOpenAIConfig());
    }
    getProviderName() {
        return 'openai';
    }
    getDefaultBaseUrl() {
        return 'https://api.openai.com/v1';
    }
    getHeaders() {
        return {
            Authorization: `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
        };
    }
    getFeatures() {
        return {
            supportsStreaming: true,
            supportsFunctions: true,
            maxTokens: 128000,
            models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo']
        };
    }
}
class AnthropicClient extends OpenRouterClient {
    constructor() {
        super(getAnthropicConfig());
    }
    getProviderName() {
        return 'anthropic';
    }
    getDefaultBaseUrl() {
        return 'https://api.anthropic.com/v1';
    }
    getHeaders() {
        return {
            'x-api-key': this.config.apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
        };
    }
    getFeatures() {
        return {
            supportsStreaming: true,
            supportsFunctions: true,
            maxTokens: 200000,
            models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022']
        };
    }
}
class GeminiClient extends OpenRouterClient {
    constructor() {
        super(getGeminiConfig());
    }
    getProviderName() {
        return 'gemini';
    }
    getDefaultBaseUrl() {
        return 'https://generativelanguage.googleapis.com/v1beta';
    }
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.config.apiKey
        };
    }
    getFeatures() {
        return {
            supportsStreaming: true,
            supportsFunctions: true,
            maxTokens: 1048576,
            models: ['gemini-2.0-flash-001', 'gemini-1.5-pro-001']
        };
    }
}
const providerInstances = new Map();
export class ProviderFactory {
    static create(provider = 'openrouter') {
        if (!providerInstances.has(provider)) {
            const instance = ProviderFactory.createNew(provider);
            providerInstances.set(provider, instance);
        }
        return providerInstances.get(provider);
    }
    static createNew(provider) {
        switch (provider) {
            case 'openrouter':
                return new OpenRouterClient();
            case 'openai':
                return new OpenAIClient();
            case 'anthropic':
                return new AnthropicClient();
            case 'gemini':
                return new GeminiClient();
            default:
                return new OpenRouterClient();
        }
    }
    static switchProvider(current, target) {
        if (current === target) {
            const instance = ProviderFactory.create(current);
            return { from: current, to: target, instance };
        }
        const instance = ProviderFactory.createNew(target);
        providerInstances.set(target, instance);
        return { from: current, to: target, instance };
    }
    static getActiveProvider() {
        return Array.from(providerInstances.keys())[0] ?? 'openrouter';
    }
    static clearInstances() {
        providerInstances.clear();
    }
}
