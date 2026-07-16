import type { Request, Response } from 'express';
import { DeploymentManagerService } from '../../ai-factory/deployment-manager/deployment-manager.service.js';
import { InMemoryDeploymentRepository } from '../../ai-factory/deployment-manager/deployment-manager.repository.js';

export async function deploymentManagerHandler(req: Request, res: Response) {
  try {
    const repository = new InMemoryDeploymentRepository();
    const service = new DeploymentManagerService(repository);
    const result = await service.deploy(req.body);
    return res.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Deployment failed';
    return res.status(400).json({ success: false, message });
  }
}
