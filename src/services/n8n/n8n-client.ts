import { getN8nConfig } from './n8n.config.js';
import type { N8nConfig, N8nCredentialPayload, N8nExecutionResult, N8nHealth, N8nWorkflowPayload, N8nWorkflowResult } from './n8n.types.js';

export class N8nClient {
  constructor(private readonly config: N8nConfig = getN8nConfig()) {}

  async deployWorkflow(payload: N8nWorkflowPayload): Promise<N8nWorkflowResult> {
    return this.request<N8nWorkflowResult>('/workflows', 'POST', payload);
  }

  async updateWorkflow(id: string, payload: N8nWorkflowPayload): Promise<N8nWorkflowResult> {
    return this.request<N8nWorkflowResult>(`/workflows/${id}`, 'PUT', payload);
  }

  async activateWorkflow(id: string): Promise<N8nWorkflowResult> {
    return this.request<N8nWorkflowResult>(`/workflows/${id}/activate`, 'POST');
  }

  async deactivateWorkflow(id: string): Promise<N8nWorkflowResult> {
    return this.request<N8nWorkflowResult>(`/workflows/${id}/deactivate`, 'POST');
  }

  async deleteWorkflow(id: string): Promise<{ success: boolean }> {
    await this.request(`/workflows/${id}`, 'DELETE');
    return { success: true };
  }

  async executeWorkflow(id: string): Promise<N8nExecutionResult> {
    return this.request<N8nExecutionResult>(`/workflows/${id}/execute`, 'POST');
  }

  async getWorkflowStatus(id: string): Promise<N8nWorkflowResult> {
    return this.request<N8nWorkflowResult>(`/workflows/${id}`, 'GET');
  }

  async syncCredentials(payload: N8nCredentialPayload): Promise<{ success: boolean }> {
    await this.request('/credentials', 'POST', payload);
    return { success: true };
  }

  async health(): Promise<N8nHealth> {
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
    } catch (error) {
      return {
        status: 'error',
        details: { message: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  private async request<T>(path: string, method: string, body?: unknown): Promise<T> {
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
      return {} as T;
    }

    return response.json() as Promise<T>;
  }
}
