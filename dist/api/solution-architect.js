import { SolutionArchitectService, InMemorySolutionArchitectureRepository } from '../ai-factory/solution-architect/index.js';
export async function solutionArchitectHandler(req, res) {
    try {
        const repository = new InMemorySolutionArchitectureRepository();
        const service = new SolutionArchitectService(repository);
        const result = await service.design(req.body);
        return res.json({ success: true, data: result });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Solution architecture design failed';
        return res.status(400).json({ success: false, message });
    }
}
