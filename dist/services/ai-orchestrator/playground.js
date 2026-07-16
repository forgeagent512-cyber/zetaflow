import { AIOrchestrator } from './ai-orchestrator.js';
export class Playground {
    orchestrator;
    constructor() {
        this.orchestrator = new AIOrchestrator();
    }
    async generate(prompt, model, tier, parameters) {
        return this.orchestrator.generate(prompt, undefined, model);
    }
    async compareModels(prompt, models) {
        const results = [];
        for (const model of models) {
            try {
                const result = await this.orchestrator.generate(prompt, undefined, model);
                results.push({ model, result, status: 'success' });
            }
            catch (error) {
                results.push({ model, error: error instanceof Error ? error.message : 'Generation failed', status: 'error' });
            }
        }
        return results;
    }
}
