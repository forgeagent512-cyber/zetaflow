export interface DeploymentManagerInputDto {
  organizationId: string;
  employeeId?: string;
  agentId?: string;
  workflowId?: string;
  knowledgeId?: string;
  promptId?: string;
  strategy?: 'fresh_install' | 'upgrade' | 'patch' | 'rollback' | 'clone' | 'duplicate' | 'multi_tenant';
  target?: 'n8n' | 'supabase' | 'railway' | 'client_workspace' | 'marketplace';
  metadata?: Record<string, unknown>;
  requestedBy?: string;
  correlationId?: string;
}

export interface DeploymentStepDto {
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  target: string;
  details?: string;
}

export interface DeploymentReportDto {
  deployment_id: string;
  status: 'success' | 'failed' | 'rolled_back';
  employee_deployed: boolean;
  agents_deployed: boolean;
  workflow_deployed: boolean;
  knowledge_installed: boolean;
  marketplace_published: boolean;
  client_workspace_created: boolean;
  deployment_url?: string;
  logs: string[];
}

export interface DeploymentManagerResponseDto extends DeploymentReportDto {
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}
