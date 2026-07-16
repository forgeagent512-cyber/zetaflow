import { getN8nConfig } from './n8n.config.js';
export class N8nClient {
    config;
    constructor(config = getN8nConfig()) {
        this.config = config;
    }
    async deployWorkflow(payload) {
        return this.request('/workflows', 'POST', payload);
    }
    async updateWorkflow(id, payload) {
        return this.request(`/workflows/${id}`, 'PUT', payload);
    }
    async activateWorkflow(id) {
        return this.request(`/workflows/${id}/activate`, 'POST');
    }
    async deactivateWorkflow(id) {
        return this.request(`/workflows/${id}/deactivate`, 'POST');
    }
    async deleteWorkflow(id) {
        await this.request(`/workflows/${id}`, 'DELETE');
        return { success: true };
    }
    async executeWorkflow(id) {
        return this.request(`/workflows/${id}/execute`, 'POST');
    }
    async getWorkflowStatus(id) {
        return this.request(`/workflows/${id}`, 'GET');
    }
    async syncCredentials(payload) {
        await this.request('/credentials', 'POST', payload);
        return { success: true };
    }
    async health() {
        if (!this.config) {
            return {
                status: 'degraded',
                details: { message: 'n8n not configured' }
            };
        }
        try {
            const response = await fetch(`${this.config.baseUrl}/healthz`, {
                headers: {
                    'X-N8N-API-KEY': this.config.apiKey
                },
                signal: AbortSignal.timeout(this.config.timeoutMs)
            });
            return {
                status: response.ok ? 'ok' : 'degraded',
                details: { status: response.status }
            };
        }
        catch (error) {
            return {
                status: 'error',
                details: { message: error instanceof Error ? error.message : 'Unknown error' }
            };
        }
    }
    async request(path, method, body) {
        if (!this.config) {
            throw new Error('n8n is not configured');
        }
        const response = await fetch(`${this.config.baseUrl}${path}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-N8N-API-KEY': this.config.apiKey
            },
            body: body ? JSON.stringify(body) : undefined,
            signal: AbortSignal.timeout(this.config.timeoutMs)
        });
        if (!response.ok) {
            throw new Error(`n8n request failed with status ${response.status}`);
        }
        if (response.status === 204) {
            return {};
        }
        return response.json();
    }
}
