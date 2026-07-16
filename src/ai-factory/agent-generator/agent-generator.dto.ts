import type { AiFactoryRequest, AiFactoryResponse } from '../shared/contracts.js';

export interface AgentGeneratorInputDto extends AiFactoryRequest {
  employee_name: string;
  industry: string;
  department: string;
  required_workflows: string[];
  required_integrations: string[];
  required_tools?: string[];
}

export interface AgentDefinitionDto {
  agent_name: string;
  role: string;
  description: string;
  system_prompt: string;
  goals: string[];
  tools: string[];
  permissions: string[];
  memory: string;
  llm: string;
  trigger_events?: string[];
  required_workflows?: string[];
  required_integrations?: string[];
  communication_rules?: Record<string, unknown>;
  personality?: {
    tone: string;
    style: string;
    behavior_traits: string[];
  };
  error_handling?: {
    strategy: 'retry' | 'fallback' | 'escalate' | 'ignore';
    max_retries: number;
    fallback_action: string;
  };
  retry_logic?: {
    max_attempts: number;
    backoff_strategy: 'exponential' | 'linear' | 'fixed';
    delay_ms: number;
  };
}

export interface AgentGenerationOutputDto {
  employee_name: string;
  agents: AgentDefinitionDto[];
}

export interface AgentGeneratorResponseDto extends AiFactoryResponse {
  organizationId: string;
  input: AgentGeneratorInputDto;
  agents: AgentGenerationOutputDto;
}
