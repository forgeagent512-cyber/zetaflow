import type { Request, Response } from 'express';
import { WorkflowGenerationService } from '../../ai-factory/workflow-generator/workflow-generation.service.js';
import { WorkflowGeneratorService } from '../../ai-factory/workflow-generator/workflow-generator.service.js';
import { InMemoryWorkflowGeneratorRepository } from '../../ai-factory/workflow-generator/workflow-generator.repository.js';

export async function workflowGenerateHandler(req: Request, res: Response) {
  try {
    const workflowGeneratorService = new WorkflowGeneratorService(new InMemoryWorkflowGeneratorRepository());
    const service = new WorkflowGenerationService(workflowGeneratorService);
    const result = await service.generate(req.body);
    return res.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Workflow generation failed';
    return res.status(400).json({ success: false, message });
  }
}
