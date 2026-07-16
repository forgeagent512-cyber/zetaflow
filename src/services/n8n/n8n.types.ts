export interface N8nWorkflowPayload {
  name: string;
  nodes: Array<Record<string, unknown>>;
  connections: Record<string, unknown>;
  settings?: Record<string, unknown>;
}

export interface N8nCredentialPayload {
  name: string;
  type: string;
  data: Record<string, unknown>;
}

export interface N8nWorkflowResult {
  id: string;
  name: string;
  active: boolean;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface N8nExecutionResult {
  executionId: string;
  workflowId: string;
  status: 'running' | 'success' | 'failed';
}

export interface N8nHealth {
  status: 'ok' | 'degraded' | 'error';
  details?: Record<string, unknown>;
}

export interface N8nConfig {
  baseUrl: string;
  apiKey: string;
  timeoutMs: number;
}
