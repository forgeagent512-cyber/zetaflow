import { randomUUID } from 'node:crypto';
import { N8nClient } from './n8n-client.js';
import type { N8nWorkflowPayload, N8nWorkflowResult } from './n8n.types.js';

export class N8nDeploymentService {
  constructor(private readonly client: N8nClient = new N8nClient()) {}

  async deployWorkflow(payload: N8nWorkflowPayload): Promise<N8nWorkflowResult> {
    const workflow = await this.client.deployWorkflow(payload);
    return { ...workflow, id: workflow.id || randomUUID() };
  }

  async updateWorkflow(id: string, payload: N8nWorkflowPayload): Promise<N8nWorkflowResult> {
    return this.client.updateWorkflow(id, payload);
  }

  async activateWorkflow(id: string): Promise<N8nWorkflowResult> {
    return this.client.activateWorkflow(id);
  }

  async deactivateWorkflow(id: string): Promise<N8nWorkflowResult> {
    return this.client.deactivateWorkflow(id);
  }

  async deleteWorkflow(id: string): Promise<{ success: boolean }> {
    return this.client.deleteWorkflow(id);
  }

  async executeWorkflow(id: string): Promise<{ executionId: string; workflowId: string; status: 'running' | 'success' | 'failed' }> {
    return this.client.executeWorkflow(id);
  }

  async getWorkflowStatus(id: string): Promise<N8nWorkflowResult> {
    return this.client.getWorkflowStatus(id);
  }
}
