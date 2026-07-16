export interface PromptGeneratorInputDto {
  organizationId: string;
  employeeId?: string;
  agentId?: string;
  employee?: Record<string, unknown>;
  agent?: Record<string, unknown>;
  promptType?: string;
  model?: 'gemini' | 'openai' | 'claude' | 'deepseek' | 'mistral' | 'llama' | 'openrouter';
  language?: string;
  tone?: string;
  requirements?: string[];
  context?: Record<string, unknown>;
  workflow?: Record<string, unknown>;
  requestedBy?: string;
  correlationId?: string;
}

export interface PromptPackageDto {
  prompt_name: string;
  prompt_type: string;
  system_prompt: string;
  developer_prompt: string;
  assistant_prompt: string;
  prompt_json: Record<string, unknown>;
  version: string;
  status: 'active' | 'draft';
}

export interface PromptGeneratorResponseDto extends PromptPackageDto {
  id: string;
  organizationId: string;
  employeeId?: string;
  agentId?: string;
  createdAt: string;
  updatedAt: string;
}
