import type { AgentGeneratorInputDto, AgentDefinitionDto } from './agent-generator.dto.js';

export class AgentPromptBuilder {
  build(input: AgentGeneratorInputDto, index: number): AgentDefinitionDto {
    const role = index === 0 ? 'Lead Qualification' : index === 1 ? 'Booking' : index === 2 ? 'Follow-up' : 'Operations';
    const agentName = `${role} Agent`;
    return {
      agent_name: agentName,
      role,
      description: `${role} for ${input.employee_name}.`,
      system_prompt: `You are the ${role.toLowerCase()} agent for ${input.employee_name}. Operate within ${input.industry} and coordinate with ${input.required_integrations.join(', ')}. Use ${input.required_workflows.join(', ')} as your workflow context.`,
      goals: [`Handle ${role.toLowerCase()} tasks`, 'Coordinate with other agents'],
      tools: input.required_tools ?? ['workflow_engine', 'crm_api'],
      permissions: ['read:customer-data', 'write:task-state'],
      memory: 'long_term',
      llm: 'gemini',
      trigger_events: ['new_request', 'scheduled_check'],
      required_workflows: input.required_workflows,
      required_integrations: input.required_integrations,
      communication_rules: {
        sequential_execution: true,
        fallback_agent: 'operations',
        retry_strategy: 'exponential_backoff',
        timeout_strategy: 'escalate'
      },
      personality: {
        tone: 'professional',
        style: 'direct',
        behavior_traits: ['proactive', 'courteous', 'detail-oriented']
      },
      error_handling: {
        strategy: 'retry',
        max_retries: 3,
        fallback_action: 'escalate'
      },
      retry_logic: {
        max_attempts: 3,
        backoff_strategy: 'exponential',
        delay_ms: 1000
      }
    };
  }
}
