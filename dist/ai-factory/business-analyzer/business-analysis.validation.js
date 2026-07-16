export class BusinessAnalyzerValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'BusinessAnalyzerValidationError';
    }
}
export function validateBusinessAnalyzerRequest(input) {
    const organizationId = typeof input.organizationId === 'string' && input.organizationId.trim() ? input.organizationId.trim() : 'system';
    const requestedBy = typeof input.requestedBy === 'string' && input.requestedBy.trim() ? input.requestedBy.trim() : undefined;
    const correlationId = typeof input.correlationId === 'string' && input.correlationId.trim() ? input.correlationId.trim() : undefined;
    const industry = typeof input.industry === 'string' && input.industry.trim() ? input.industry.trim() : null;
    const businessName = typeof input.businessName === 'string' && input.businessName.trim() ? input.businessName.trim() : null;
    const goal = typeof input.goal === 'string' && input.goal.trim() ? input.goal.trim() : null;
    const requirements = typeof input.requirements === 'string' && input.requirements.trim() ? input.requirements.trim() : null;
    if (!industry || !businessName || !goal || !requirements) {
        throw new BusinessAnalyzerValidationError('industry, businessName, goal, and requirements are required');
    }
    return {
        organizationId,
        requestedBy,
        correlationId,
        industry,
        businessName,
        goal,
        requirements
    };
}
