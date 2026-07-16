import { TemplateSearchService } from '../../ai-factory/workflow-generator/template-search.service.js';
import { InMemoryWorkflowGeneratorRepository } from '../../ai-factory/workflow-generator/workflow-generator.repository.js';
export async function templateSearchHandler(req, res) {
    try {
        const service = new TemplateSearchService(new InMemoryWorkflowGeneratorRepository());
        const result = await service.search(req.body);
        return res.json({ success: true, data: result });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Template search failed';
        return res.status(400).json({ success: false, message });
    }
}
