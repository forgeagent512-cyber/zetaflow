import type { Auditable } from '../shared/contracts.js';
import type { BusinessAnalyzerAnalysisDto, BusinessAnalyzerRequestDto } from './business-analysis.dto.js';

export type ComplexityLevel = 'low' | 'medium' | 'high';

export interface BusinessAnalysisRecord extends Auditable {
  organizationId: string;
  request: BusinessAnalyzerRequestDto;
  analysis: BusinessAnalyzerAnalysisDto;
  confidence: number;
}

export interface BusinessAnalysisProvider {
  generateAnalysis(request: BusinessAnalyzerRequestDto): Promise<BusinessAnalyzerAnalysisDto>;
}
