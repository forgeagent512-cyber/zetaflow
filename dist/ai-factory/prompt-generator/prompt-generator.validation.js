export class PromptGeneratorValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PromptGeneratorValidationError';
    }
}
export function validatePromptGeneratorInput(input) {
    const organizationId = typeof input.organizationId === 'string' && input.organizationId.trim() ? input.organizationId.trim() : 'system';
    const employee = input.employee && typeof input.employee === 'object' ? input.employee : {};
    const agent = input.agent && typeof input.agent === 'object' ? input.agent : {};
    const requirements = Array.isArray(input.requirements)
        ? input.requirements.filter((item) => typeof item === 'string' && item.trim().length > 0)
        : [];
    const promptType = typeof input.promptType === 'string' && input.promptType.trim() ? input.promptType.trim() : 'Custom';
    if (!employee && !agent) {
        throw new PromptGeneratorValidationError('At least one of employee or agent is required');
    }
    if (requirements.length === 0) {
        throw new PromptGeneratorValidationError('At least one requirement is required');
    }
    return { organizationId, employee, agent, requirements, promptType };
}
