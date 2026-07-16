import { randomUUID } from 'node:crypto';
import type { BusinessAnalyzerRequestDto, BusinessAnalyzerResponseDto } from './business-analysis.dto.js';
import { validateBusinessAnalyzerRequest } from './business-analysis.validation.js';
import type { BusinessAnalysisRepository } from './business-analysis.repository.js';
import type { BusinessAnalysisProvider } from './business-analysis.types.js';

export interface IBusinessAnalyzerService {
  analyze(request: BusinessAnalyzerRequestDto): Promise<BusinessAnalyzerResponseDto>;
}

export class BusinessAnalyzerService implements IBusinessAnalyzerService {
  constructor(
    private readonly repository: BusinessAnalysisRepository,
    private readonly analyzer: BusinessAnalysisProvider
  ) {}

  async analyze(request: BusinessAnalyzerRequestDto): Promise<BusinessAnalyzerResponseDto> {
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
