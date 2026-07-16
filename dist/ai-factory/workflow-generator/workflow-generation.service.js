import { randomUUID } from 'node:crypto';
import { WorkflowAnalyzerService } from '../workflow-analyzer/workflow-analyzer.service.js';
import { InMemoryWorkflowAnalysisRepository } from '../workflow-analyzer/workflow-analyzer.repository.js';
export class WorkflowGenerationService {
    workflowGeneratorService;
    analyzerService;
    constructor(workflowGeneratorService, analyzerService = new WorkflowAnalyzerService(new InMemoryWorkflowAnalysisRepository())) {
        this.workflowGeneratorService = workflowGeneratorService;
        this.analyzerService = analyzerService;
    }
    async generate(input) {
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
            analysis: analysis.analysis,
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
