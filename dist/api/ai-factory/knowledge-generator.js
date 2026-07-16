import { KnowledgeGeneratorService } from '../../ai-factory/knowledge-generator/knowledge-generator.service.js';
import { InMemoryKnowledgeRepository } from '../../ai-factory/knowledge-generator/knowledge-generator.repository.js';
export async function knowledgeGeneratorHandler(req, res) {
    try {
        const repository = new InMemoryKnowledgeRepository();
        const service = new KnowledgeGeneratorService(repository);
        const result = await service.generate(req.body);
        return res.json({ success: true, data: result });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Knowledge generation failed';
        return res.status(400).json({ success: false, message });
    }
}
