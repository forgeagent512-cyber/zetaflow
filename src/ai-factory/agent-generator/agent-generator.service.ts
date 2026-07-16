import { randomUUID } from 'node:crypto';
import type { AgentGeneratorInputDto, AgentGenerationOutputDto, AgentGeneratorResponseDto } from './agent-generator.dto.js';
import type { AgentRepository } from './agent-generator.repository.js';
import { validateAgentGeneratorInput, validateAgentCollection } from './agent-generator.validation.js';
import type { AgentGeneratorProvider } from './agent-generator.types.js';
import { AgentPromptBuilder } from './agent-prompt-builder.js';
import { CommunicationPlanner } from './communication-planner.js';
import { HierarchyBuilder } from './hierarchy-builder.js';

export interface IAgentGeneratorService {
  generate(input: AgentGeneratorInputDto): Promise<AgentGeneratorResponseDto>;
}

export class AgentGeneratorService implements IAgentGeneratorService {
  constructor(
    private readonly repository: AgentRepository,
    private readonly provider: AgentGeneratorProvider,
    private readonly promptBuilder: AgentPromptBuilder = new AgentPromptBuilder(),
    private readonly communicationPlanner: CommunicationPlanner = new CommunicationPlanner(),
    private readonly hierarchyBuilder: HierarchyBuilder = new HierarchyBuilder()
  ) {}

  async generate(input: AgentGeneratorInputDto): Promise<AgentGeneratorResponseDto> {
    const validated = validateAgentGeneratorInput({
      ...input,
      required_tools: input.required_tools
    });

    const generated = await this.provider.generate({
      ...input,
      required_tools: input.required_tools ?? ['workflow_engine', 'crm_api']
    });

    const agents = validateAgentCollection(generated.agents as unknown as Array<Record<string, unknown>>);
    const communicationPlan = this.communicationPlanner.plan(agents as Array<{ agent_name: string }>);
    const hierarchy = this.hierarchyBuilder.build(agents as Array<{ agent_name: string; role: string; description: string; system_prompt: string; goals: string[]; tools: string[]; permissions: string[]; memory: string; llm: string; trigger_events?: string[]; required_workflows?: string[]; required_integrations?: string[]; communication_rules?: Record<string, unknown> }>);

    const payload: AgentGenerationOutputDto = {
      employee_name: generated.employee_name,
      agents: (agents as Array<Record<string, unknown>>).map((agent, index) => ({
        ...(agent as Record<string, unknown>),
        communication_rules: {
          ...((agent as Record<string, unknown>).communication_rules as Record<string, unknown> | undefined),
          communication_plan: communicationPlan,
          hierarchy
        },
        required_workflows: Array.isArray((agent as Record<string, unknown>).required_workflows) ? (agent as Record<string, unknown>).required_workflows as string[] : validated.workflows,
        required_integrations: Array.isArray((agent as Record<string, unknown>).required_integrations) ? (agent as Record<string, unknown>).required_integrations as string[] : validated.integrations
      })) as unknown as Array<{ agent_name: string; role: string; description: string; system_prompt: string; goals: string[]; tools: string[]; permissions: string[]; memory: string; llm: string; trigger_events?: string[]; required_workflows?: string[]; required_integrations?: string[]; communication_rules?: Record<string, unknown> }>
    };

    const employeeId = input.correlationId ?? randomUUID();
    for (const agent of payload.agents) {
      const record = {
        id: randomUUID(),
        organizationId: input.organizationId ?? 'system',
        employeeId,
        agentName: agent.agent_name,
        agentRole: agent.role,
        industry: validated.industry,
        systemPrompt: agent.system_prompt,
        agentJson: agent,
        status: 'active' as const,
        version: '1.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: input.requestedBy
      };
      await this.repository.save(record);
    }

    return {
      id: randomUUID(),
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      organizationId: input.organizationId ?? 'system',
      input,
      agents: payload
    };
  }
}
