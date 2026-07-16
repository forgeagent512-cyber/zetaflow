export interface AIProviderRequest {
  model?: string;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AIUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface CostTracking {
  totalCost: number;
  costPerToken: number;
  model: string;
  provider: string;
}

export interface ModelCost {
  model: string;
  inputCostPer1K: number;
  outputCostPer1K: number;
}

export interface AIProviderFeatures {
  supportsStreaming: boolean;
  supportsFunctions: boolean;
  maxTokens: number;
  models: string[];
}

export interface AIProviderResponse {
  content: string;
  model: string;
  provider: string;
  usage: AIUsage;
  cost?: CostTracking;
}

export interface AIProviderHealth {
  status: 'ok' | 'degraded' | 'error';
  provider: string;
  details?: Record<string, unknown>;
}

export interface AIProvider {
  generate(request: AIProviderRequest): Promise<AIProviderResponse>;
  stream(request: AIProviderRequest): AsyncIterable<string>;
  health(): Promise<AIProviderHealth>;
  getFeatures(): AIProviderFeatures;
}

export interface AIProviderConfig {
  apiKey: string;
  baseUrl?: string;
  timeoutMs?: number;
  retries?: number;
}

export type ProviderType = 'openrouter' | 'openai' | 'anthropic' | 'gemini';

export interface ModelSelectionCriteria {
  capabilities: string[];
  maxCostPer1K?: number;
  minTokens?: number;
  preferredProvider?: ProviderType;
}

export interface StreamingCostTracking {
  streamId: string;
  model: string;
  provider: string;
  estimatedPromptTokens: number;
  estimatedCompletionTokens: number;
  estimatedCost: number;
  startedAt: string;
}
