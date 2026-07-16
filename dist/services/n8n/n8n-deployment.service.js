import { randomUUID } from 'node:crypto';
import { N8nClient } from './n8n-client.js';
export class N8nDeploymentService {
    client;
    constructor(client = new N8nClient()) {
        this.client = client;
    }
    async deployWorkflow(payload) {
        const workflow = await this.client.deployWorkflow(payload);
        return { ...workflow, id: workflow.id || randomUUID() };
    }
    async updateWorkflow(id, payload) {
        return this.client.updateWorkflow(id, payload);
    }
    async activateWorkflow(id) {
        return this.client.activateWorkflow(id);
    }
    async deactivateWorkflow(id) {
        return this.client.deactivateWorkflow(id);
    }
    async deleteWorkflow(id) {
        return this.client.deleteWorkflow(id);
    }
    async executeWorkflow(id) {
        return this.client.executeWorkflow(id);
    }
    async getWorkflowStatus(id) {
        return this.client.getWorkflowStatus(id);
    }
}
