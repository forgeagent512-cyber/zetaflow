import { AIOrchestrator } from './ai-orchestrator.js';

export class Playground {
  private orchestrator: AIOrchestrator;

  constructor() {
    this.orchestrator = new AIOrchestrator();
  }

  async generate(prompt: string, model: string, tier?: string, parameters?: Record<string, unknown>): Promise<unknown> {
    return this.orchestrator.generate(prompt, undefined, model);
  }

  async compareModels(prompt: string, models: string[]): Promise<unknown[]> {
    const results = [];
    for (const model of models) {
      try {
        const result = await this.orchestrator.generate(prompt, undefined, model);
        results.push({ model, result, status: 'success' });
      } catch (error) {
        results.push({ model, error: error instanceof Error ? error.message : 'Generation failed', status: 'error' });
      }
    }
    return results;
  }
}
