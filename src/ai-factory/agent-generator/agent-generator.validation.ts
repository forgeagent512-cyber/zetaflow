export class AgentGeneratorValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AgentGeneratorValidationError';
  }
}

export interface AgentGeneratorValidationInput {
  employee_name?: unknown;
  industry?: unknown;
  department?: unknown;
  required_workflows?: unknown;
  required_integrations?: unknown;
  required_tools?: unknown;
}

export function validateAgentGeneratorInput(input: AgentGeneratorValidationInput) {
  const employeeName = typeof input.employee_name === 'string' && input.employee_name.trim() ? input.employee_name.trim() : null;
  const industry = typeof input.industry === 'string' && input.industry.trim() ? input.industry.trim() : null;
  const department = typeof input.department === 'string' && input.department.trim() ? input.department.trim() : null;
  const workflows = Array.isArray(input.required_workflows) ? input.required_workflows.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];
  const integrations = Array.isArray(input.required_integrations) ? input.required_integrations.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];
  const tools = Array.isArray(input.required_tools) ? input.required_tools.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];

  if (!employeeName || !industry || !department) {
    throw new AgentGeneratorValidationError('employee_name, industry, and department are required');
  }

  if (workflows.length === 0) {
    throw new AgentGeneratorValidationError('required_workflows must not be empty');
  }

  if (integrations.length === 0) {
    throw new AgentGeneratorValidationError('required_integrations must not be empty');
  }

  return { employeeName, industry, department, workflows, integrations, tools };
}

export function validateAgentCollection(agents: Array<Record<string, unknown>>) {
  const names = new Set<string>();
  for (const agent of agents) {
    const name = typeof agent.agent_name === 'string' && agent.agent_name.trim() ? agent.agent_name.trim() : null;
    const prompt = typeof agent.system_prompt === 'string' && agent.system_prompt.trim() ? agent.system_prompt.trim() : null;
    if (!name || !prompt) {
      throw new AgentGeneratorValidationError('Each agent needs agent_name and system_prompt');
    }
    if (names.has(name)) {
      throw new AgentGeneratorValidationError('Duplicate agent name detected');
    }
    names.add(name);
  }
  return agents;
}
