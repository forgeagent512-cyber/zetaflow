import { randomUUID } from 'node:crypto';
import { validateBusinessAnalyzerRequest } from './business-analysis.validation.js';
export class BusinessAnalyzerService {
    repository;
    analyzer;
    constructor(repository, analyzer) {
        this.repository = repository;
        this.analyzer = analyzer;
    }
    async analyze(request) {
        const validated = validateBusinessAnalyzerRequest({
            ...request,
            organizationId: request.organizationId,
            requestedBy: request.requestedBy,
            correlationId: request.correlationId
        });
        const analysis = await this.analyzer.generateAnalysis({
            ...request,
            industry: validated.industry,
            businessName: validated.businessName,
            goal: validated.goal,
            requirements: validated.requirements,
            organizationId: validated.organizationId,
            requestedBy: validated.requestedBy,
            correlationId: validated.correlationId
        });
        const entity = {
            id: randomUUID(),
            organizationId: validated.organizationId,
            request: {
                ...request,
                organizationId: validated.organizationId,
                requestedBy: validated.requestedBy,
                correlationId: validated.correlationId
            },
            analysis,
            confidence: analysis.confidence,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: validated.requestedBy
        };
        await this.repository.save(entity);
        return {
            id: entity.id,
            status: 'completed',
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            organizationId: entity.organizationId,
            request: entity.request,
            analysis,
            confidence: analysis.confidence
        };
    }
}
