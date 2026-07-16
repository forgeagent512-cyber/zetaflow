export function validateRegisterIntegration(input) {
    if (!input.organizationId || typeof input.organizationId !== 'string') {
        throw new Error('organizationId is required and must be a string');
    }
    if (!input.name || typeof input.name !== 'string') {
        throw new Error('name is required and must be a string');
    }
    if (!input.provider || typeof input.provider !== 'string') {
        throw new Error('provider is required and must be a string');
    }
    if (!input.credentials || typeof input.credentials !== 'object') {
        throw new Error('credentials is required and must be an object');
    }
    return {
        organizationId: input.organizationId,
        name: input.name,
        provider: input.provider,
        credentials: input.credentials
    };
}
export function validateUpdateIntegration(input) {
    const result = {};
    if (input.name !== undefined) {
        if (typeof input.name !== 'string' || !input.name.trim()) {
            throw new Error('name must be a non-empty string');
        }
        result.name = input.name;
    }
    if (input.credentials !== undefined) {
        if (typeof input.credentials !== 'object' || input.credentials === null) {
            throw new Error('credentials must be a valid object');
        }
        result.credentials = input.credentials;
    }
    return result;
}
