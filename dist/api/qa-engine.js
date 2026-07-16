import { QaEngineService, InMemoryQaRepository } from '../ai-factory/qa-engine/index.js';
export async function qaEngineHandler(req, res) {
    try {
        const repository = new InMemoryQaRepository();
        const service = new QaEngineService(repository);
        const result = await service.evaluate(req.body);
        return res.json({ success: true, data: result });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'QA evaluation failed';
        return res.status(400).json({ success: false, message });
    }
}
