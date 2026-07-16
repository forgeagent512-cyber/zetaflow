import type { Auditable } from '../shared/contracts.js';
import type { AgentDefinitionDto, AgentGenerationOutputDto, AgentGeneratorInputDto } from './agent-generator.dto.js';

export interface GeneratedAgentRecord extends Auditable {
  organizationId: string;
  employeeId: string;
  agentName: string;
  agentRole: string;
  industry: string;
  systemPrompt: string;
  agentJson: AgentDefinitionDto;
  status: 'draft' | 'active' | 'disabled';
  version: string;
}

export interface AgentGeneratorProvider {
  generate(input: AgentGeneratorInputDto): Promise<AgentGenerationOutputDto>;
}
