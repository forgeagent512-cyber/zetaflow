import type { AiFactoryRequest, AiFactoryResponse } from '../shared/contracts.js';

export interface EmployeeGeneratorInputDto extends AiFactoryRequest {
  industry: string;
  automation_type: string;
  business_name: string;
  requirements: string[];
}

export interface EmployeePersonalityDto {
  tone: string;
  language: string;
  temperature: number;
}

export interface EmployeeMemoryDto {
  type: string;
}

export interface EmployeeGeneratorOutputDto {
  employee_name: string;
  department: string;
  role: string;
  description: string;
  system_prompt: string;
  personality: EmployeePersonalityDto;
  skills: string[];
  goals: string[];
  responsibilities: string[];
  limitations: string[];
  knowledge_base: string[];
  required_tools: string[];
  required_integrations: string[];
  required_agents: string[];
  required_workflows: string[];
  memory: EmployeeMemoryDto;
  recommended_models: string[];
  openai_settings?: Record<string, unknown>;
  gemini_settings?: Record<string, unknown>;
  claude_settings?: Record<string, unknown>;
  tools?: string[];
  function_calls?: string[];
  vector_search_settings?: Record<string, unknown>;
  security_rules?: string[];
  permissions?: string[];
  kpis?: Array<{ metric: string; target: string; measurement: string }>;
  escalation_rules?: Array<{ condition: string; action: string; escalate_to: string }>;
}

export interface EmployeeGeneratorResponseDto extends AiFactoryResponse {
  organizationId: string;
  input: EmployeeGeneratorInputDto;
  employee: EmployeeGeneratorOutputDto;
}
