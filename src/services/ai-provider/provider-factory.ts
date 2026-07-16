import { OpenRouterClient } from './openrouter-client.js';
import type { AIProvider, AIProviderConfig, ProviderType } from './ai-provider.types.js';
import { getOpenRouterConfig, getOpenAIConfig, getAnthropicConfig, getGeminiConfig } from './ai-provider.config.js';

class OpenAIClient extends OpenRouterClient {
  constructor() {
    super(getOpenAIConfig());
  }

  protected override getProviderName(): string {
    return 'openai';
  }

  protected override getDefaultBaseUrl(): string {
    return 'https://api.openai.com/v1';
  }

  protected override getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  override getFeatures() {
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

  protected override getProviderName(): string {
    return 'anthropic';
  }

  protected override getDefaultBaseUrl(): string {
    return 'https://api.anthropic.com/v1';
  }

  protected override getHeaders(): Record<string, string> {
    return {
      'x-api-key': this.config.apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    };
  }

  override getFeatures() {
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

  protected override getProviderName(): string {
    return 'gemini';
  }

  protected override getDefaultBaseUrl(): string {
    return 'https://generativelanguage.googleapis.com/v1beta';
  }

  protected override getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-goog-api-key': this.config.apiKey
    };
  }

  override getFeatures() {
    return {
      supportsStreaming: true,
      supportsFunctions: true,
      maxTokens: 1048576,
      models: ['gemini-2.0-flash-001', 'gemini-1.5-pro-001']
    };
  }
}

const providerInstances = new Map<ProviderType, AIProvider>();

export class ProviderFactory {
  static create(provider: ProviderType = 'openrouter'): AIProvider {
    if (!providerInstances.has(provider)) {
      const instance = ProviderFactory.createNew(provider);
      providerInstances.set(provider, instance);
    }
    return providerInstances.get(provider)!;
  }

  static createNew(provider: ProviderType): AIProvider {
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

  static switchProvider(current: ProviderType, target: ProviderType): { from: ProviderType; to: ProviderType; instance: AIProvider } {
    if (current === target) {
      const instance = ProviderFactory.create(current);
      return { from: current, to: target, instance };
    }

    const instance = ProviderFactory.createNew(target);
    providerInstances.set(target, instance);
    return { from: current, to: target, instance };
  }

  static getActiveProvider(): ProviderType {
    return Array.from(providerInstances.keys())[0] ?? 'openrouter';
  }

  static clearInstances(): void {
    providerInstances.clear();
  }
}
