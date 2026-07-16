import { randomUUID } from 'node:crypto';
import type { WorkflowGeneratorService } from './workflow-generator.service.js';
import { WorkflowAnalyzerService } from '../workflow-analyzer/workflow-analyzer.service.js';
import { InMemoryWorkflowAnalysisRepository } from '../workflow-analyzer/workflow-analyzer.repository.js';

export interface WorkflowGenerationInputDto {
  workflow_json?: Record<string, unknown>;
  business_purpose?: string;
  industry?: string;
  category?: string;
}

export interface WorkflowGenerationResponseDto {
  workflow_id: string;
  template_id: string;
  status: string;
  workflow_json: Record<string, unknown>;
  analysis: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export class WorkflowGenerationService {
  constructor(
    private readonly workflowGeneratorService: WorkflowGeneratorService,
    private readonly analyzerService: WorkflowAnalyzerService = new WorkflowAnalyzerService(new InMemoryWorkflowAnalysisRepository())
  ) {}

  async generate(input: WorkflowGenerationInputDto): Promise<WorkflowGenerationResponseDto> {
    const workflowJson = input.workflow_json ?? {
      name: `${input.industry ?? 'Automation'} Workflow`,
      nodes: [],
      connections: {}
    };

    const analysis = await this.analyzerService.analyze({ workflow_json: workflowJson, workflow_id: randomUUID() });
    const workflowId = randomUUID();
    const templateId = randomUUID();

    return {
      workflow_id: workflowId,
      template_id: templateId,
      status: 'generated',
      workflow_json: workflowJson,
      analysis: analysis.analysis as unknown as Record<string, unknown>,
      metadata: {
        workflow_name: analysis.analysis.workflow_name,
        business_purpose: analysis.analysis.business_purpose,
        industry: analysis.analysis.industry,
        category: analysis.analysis.category,
        required_integrations: analysis.analysis.required_integrations,
        embedding_size: analysis.embedding.length
      }
    };
  }
}
