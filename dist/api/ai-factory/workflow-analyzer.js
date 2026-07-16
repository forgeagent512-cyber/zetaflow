import { WorkflowAnalyzerService } from '../../ai-factory/workflow-analyzer/workflow-analyzer.service.js';
import { InMemoryWorkflowAnalysisRepository } from '../../ai-factory/workflow-analyzer/workflow-analyzer.repository.js';
export async function workflowAnalyzerHandler(req, res) {
    try {
        const repository = new InMemoryWorkflowAnalysisRepository();
        const service = new WorkflowAnalyzerService(repository);
        const result = await service.analyze(req.body);
        return res.json({ success: true, data: result });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Workflow analysis failed';
        return res.status(400).json({ success: false, message });
    }
}
