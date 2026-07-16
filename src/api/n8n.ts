import type { Request, Response } from 'express';
import { N8nDeploymentService } from '../services/n8n/n8n-deployment.service.js';
import { CredentialSyncService } from '../services/n8n/credential-sync.service.js';
import { N8nClient } from '../services/n8n/n8n-client.js';

const deploymentService = new N8nDeploymentService();
const credentialSyncService = new CredentialSyncService();
const client = new N8nClient();

export async function deployN8nWorkflowHandler(req: Request, res: Response) {
  try {
    const result = await deploymentService.deployWorkflow(req.body);
    return res.json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Deployment failed' });
  }
}

export async function updateN8nWorkflowHandler(req: Request, res: Response) {
  try {
    const workflowId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await deploymentService.updateWorkflow(workflowId, req.body);
    return res.json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Update failed' });
  }
}

export async function activateN8nWorkflowHandler(req: Request, res: Response) {
  try {
    const workflowId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await deploymentService.activateWorkflow(workflowId);
    return res.json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Activation failed' });
  }
}

export async function deactivateN8nWorkflowHandler(req: Request, res: Response) {
  try {
    const workflowId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await deploymentService.deactivateWorkflow(workflowId);
    return res.json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Deactivation failed' });
  }
}

export async function executeN8nWorkflowHandler(req: Request, res: Response) {
  try {
    const workflowId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await deploymentService.executeWorkflow(workflowId);
    return res.json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Execution failed' });
  }
}

export async function deleteN8nWorkflowHandler(req: Request, res: Response) {
  try {
    const workflowId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await deploymentService.deleteWorkflow(workflowId);
    return res.json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Deletion failed' });
  }
}

export async function getN8nWorkflowHandler(req: Request, res: Response) {
  try {
    const workflowId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await deploymentService.getWorkflowStatus(workflowId);
    return res.json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Status lookup failed' });
  }
}

export async function n8nHealthHandler(req: Request, res: Response) {
  try {
    const health = await client.health();
    return res.json({ success: true, data: health });
  } catch (error) {
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Health check failed' });
  }
}

export async function syncN8nCredentialsHandler(req: Request, res: Response) {
  try {
    const result = await credentialSyncService.syncCredentials(req.body);
    return res.json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Credential sync failed' });
  }
}
