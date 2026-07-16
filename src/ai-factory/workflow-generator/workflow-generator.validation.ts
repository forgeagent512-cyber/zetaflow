export class WorkflowGeneratorValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkflowGeneratorValidationError';
  }
}

export interface WorkflowGeneratorValidationInput {
  organizationId?: unknown;
  industry?: unknown;
  requirements?: unknown;
  employee?: unknown;
  agents?: unknown;
}

export function validateWorkflowGeneratorInput(input: WorkflowGeneratorValidationInput) {
  const organizationId = typeof input.organizationId === 'string' && input.organizationId.trim() ? input.organizationId.trim() : 'system';
  const industry = typeof input.industry === 'string' && input.industry.trim() ? input.industry.trim() : 'General';
  const requirements = Array.isArray(input.requirements)
    ? input.requirements.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : [];
  const employee = input.employee && typeof input.employee === 'object' ? input.employee as Record<string, unknown> : {};
  const agents = Array.isArray(input.agents) ? input.agents.filter((item): item is Record<string, unknown> => item && typeof item === 'object') : [];

  if (requirements.length === 0) {
    throw new WorkflowGeneratorValidationError('requirements must contain at least one integration or workflow requirement');
  }

  return { organizationId, industry, requirements, employee, agents };
}
