export class KnowledgeGeneratorValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'KnowledgeGeneratorValidationError';
    }
}
export function validateKnowledgeGeneratorInput(input) {
    const organizationId = typeof input.organizationId === 'string' && input.organizationId.trim() ? input.organizationId.trim() : '';
    const content = typeof input.content === 'string' && input.content.trim() ? input.content.trim() : null;
    const rawFiles = Array.isArray(input.files) ? input.files : [];
    const files = rawFiles
        .filter((f) => !!f && typeof f === 'object')
        .map((f) => ({
        name: typeof f.name === 'string' ? f.name : 'unknown',
        content: typeof f.content === 'string' ? f.content : undefined,
        mimeType: typeof f.mimeType === 'string' ? f.mimeType : undefined,
    }))
        .filter((f) => f.name !== 'unknown');
    const title = typeof input.title === 'string' && input.title.trim() ? input.title.trim() : 'Knowledge Base';
    if (!organizationId) {
        throw new KnowledgeGeneratorValidationError('organizationId is required');
    }
    if (!content && files.length === 0) {
        throw new KnowledgeGeneratorValidationError('Either content or files must be provided');
    }
    return { organizationId, content, files, title };
}
