export interface WorkflowGeneratorInputDto {
  organizationId: string;
  employeeId?: string;
  employee?: Record<string, unknown>;
  agents?: Array<Record<string, unknown>>;
  requirements?: string[];
  industry?: string;
  workflowType?: string;
  requestedBy?: string;
  correlationId?: string;
}

export interface WorkflowNodeDto {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, unknown>;
  credentials?: Record<string, string>;
  continueOnFail?: boolean;
  retryOnFail?: boolean;
  notes?: string;
}

export interface WorkflowConnectionDto {
  from: string;
  to: string;
  type?: 'main';
  index?: number;
}

export interface WorkflowDefinitionDto {
  name: string;
  workflowType: string;
  description: string;
  nodes: WorkflowNodeDto[];
  connections: Record<string, Array<Array<WorkflowConnectionDto>>>;
  settings: Record<string, unknown>;
  tags: string[];
  variables: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export interface WorkflowGeneratorOutputDto {
  workflow_name: string;
  version: string;
  description: string;
  workflow_json: Record<string, unknown>;
  required_credentials: string[];
  required_nodes: string[];
  required_integrations: string[];
  deployment_strategy: 'cloud' | 'self_hosted' | 'hybrid';
}

export interface WorkflowGeneratorResponseDto extends WorkflowGeneratorOutputDto {
  id: string;
  organizationId: string;
  employeeId?: string;
  status: 'active' | 'reused' | 'failed';
  createdAt: string;
  updatedAt: string;
}
