export class WorkflowGeneratorValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'WorkflowGeneratorValidationError';
    }
}
export function validateWorkflowGeneratorInput(input) {
    const organizationId = typeof input.organizationId === 'string' && input.organizationId.trim() ? input.organizationId.trim() : 'system';
    const industry = typeof input.industry === 'string' && input.industry.trim() ? input.industry.trim() : 'General';
    const requirements = Array.isArray(input.requirements)
        ? input.requirements.filter((item) => typeof item === 'string' && item.trim().length > 0)
        : [];
    const employee = input.employee && typeof input.employee === 'object' ? input.employee : {};
    const agents = Array.isArray(input.agents) ? input.agents.filter((item) => item && typeof item === 'object') : [];
    if (requirements.length === 0) {
        throw new WorkflowGeneratorValidationError('requirements must contain at least one integration or workflow requirement');
    }
    return { organizationId, industry, requirements, employee, agents };
}
