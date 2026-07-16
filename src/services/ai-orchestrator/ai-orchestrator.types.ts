export type QualityTier = 'economy' | 'balanced' | 'premium' | 'enterprise';
export type AiTaskType = 'coding' | 'reasoning' | 'workflow' | 'planning' | 'vision' | 'voice' | 'writing' | 'summarization' | 'translation' | 'analysis' | 'chat' | 'content_writing' | 'marketing' | 'sales' | 'customer_support' | 'image_analysis' | 'document_processing' | 'knowledge_search' | 'prompt_engineering' | 'business_analysis';
export type ProviderType = 'openrouter' | 'openai' | 'anthropic' | 'gemini' | 'groq' | 'deepseek' | 'mistral' | 'meta' | 'qwen' | 'ollama' | 'azure';

export interface ModelScore {
  model: string;
  provider: string;
  availability: number;
  latency: number;
  quality: number;
  contextWindow: number;
  reasoning: number;
  coding: number;
  vision: number;
  reliability: number;
  overallScore: number;
}

export interface RouterRequest {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  tier: QualityTier;
  taskType?: AiTaskType;
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
}

export interface RouterResponse {
  content: string;
  model: string;
  provider: string;
  tier: string;
  taskType: AiTaskType;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
  cost: { totalCost: number; costPerToken: number; model: string; provider: string };
  latency: number;
}

export interface ClassifiedTask {
  taskType: AiTaskType;
  confidence: number;
  reasoning: string;
}

export interface CostEstimate {
  model: string;
  provider: string;
  tier: QualityTier;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  currency: string;
}

export interface ProviderHealthStatus {
  provider: string;
  status: 'ok' | 'degraded' | 'unhealthy';
  latency: number;
  errorRate: number;
  rateLimited: boolean;
  lastChecked: string;
  models: Array<{ model: string; status: string; latency: number }>;
}

export interface FreeModelInfo {
  model: string;
  provider: string;
  score: number;
  contextWindow: number;
  capabilities: string[];
}

export interface OrchestratorConfig {
  enableFallback: boolean;
  enablePaidFallback: boolean;
  preferredProviders: ProviderType[];
  maxRetries: number;
  timeout: number;
}