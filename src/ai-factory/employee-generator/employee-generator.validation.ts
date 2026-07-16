export class EmployeeGeneratorValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmployeeGeneratorValidationError';
  }
}

export interface EmployeeGeneratorValidationInput {
  industry?: unknown;
  automation_type?: unknown;
  business_name?: unknown;
  requirements?: unknown;
  organizationId?: unknown;
}

export function validateEmployeeGeneratorInput(input: EmployeeGeneratorValidationInput) {
  const industry = typeof input.industry === 'string' && input.industry.trim() ? input.industry.trim() : null;
  const automationType = typeof input.automation_type === 'string' && input.automation_type.trim() ? input.automation_type.trim() : null;
  const businessName = typeof input.business_name === 'string' && input.business_name.trim() ? input.business_name.trim() : null;
  const requirements = Array.isArray(input.requirements) && input.requirements.every((item) => typeof item === 'string' && item.trim())
    ? input.requirements.filter((item): item is string => typeof item === 'string').map((item) => item.trim())
    : [];

  if (!industry || !automationType || !businessName) {
    throw new EmployeeGeneratorValidationError('industry, automation_type, and business_name are required');
  }

  if (requirements.length === 0) {
    throw new EmployeeGeneratorValidationError('requirements must include at least one item');
  }

  return {
    industry,
    automation_type: automationType,
    business_name: businessName,
    requirements
  };
}

export function validateGeneratedEmployee(employee: Record<string, unknown>) {
  const name = typeof employee.employee_name === 'string' && employee.employee_name.trim() ? employee.employee_name.trim() : null;
  const prompt = typeof employee.system_prompt === 'string' && employee.system_prompt.trim() ? employee.system_prompt.trim() : null;
  const skills = Array.isArray(employee.skills) ? employee.skills : [];
  const tools = Array.isArray(employee.required_tools) ? employee.required_tools : [];
  const integrations = Array.isArray(employee.required_integrations) ? employee.required_integrations : [];

  if (!name || !prompt) {
    throw new EmployeeGeneratorValidationError('employee_name and system_prompt are required');
  }

  if (prompt.length < 80) {
    throw new EmployeeGeneratorValidationError('system_prompt must be at least 80 characters long');
  }

  if (skills.length === 0) {
    throw new EmployeeGeneratorValidationError('skills must not be empty');
  }

  if (tools.length === 0) {
    throw new EmployeeGeneratorValidationError('required_tools must not be empty');
  }

  if (integrations.length === 0) {
    throw new EmployeeGeneratorValidationError('required_integrations must not be empty');
  }

  return employee as Record<string, unknown>;
}
