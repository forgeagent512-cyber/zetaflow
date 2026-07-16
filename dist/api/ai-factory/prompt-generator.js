import { PromptGeneratorService } from '../../ai-factory/prompt-generator/prompt-generator.service.js';
import { InMemoryPromptRepository } from '../../ai-factory/prompt-generator/prompt-generator.repository.js';
export async function promptGeneratorHandler(req, res) {
    try {
        const repository = new InMemoryPromptRepository();
        const service = new PromptGeneratorService(repository);
        const result = await service.generate(req.body);
        return res.json({ success: true, data: result });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Prompt generation failed';
        return res.status(400).json({ success: false, message });
    }
}
