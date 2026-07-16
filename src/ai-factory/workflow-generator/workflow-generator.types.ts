import type { WorkflowGeneratorInputDto, WorkflowGeneratorOutputDto } from './workflow-generator.dto.js';

export interface GeneratedWorkflowRecord {
  id: string;
  organizationId: string;
  employeeId?: string;
  workflowName: string;
  workflowJson: Record<string, unknown>;
  industry: string;
  status: 'active' | 'draft' | 'disabled';
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowGeneratorRepository {
  findSimilarWorkflow(input: WorkflowGeneratorInputDto, workflowName: string): Promise<GeneratedWorkflowRecord | null>;
  save(record: GeneratedWorkflowRecord): Promise<GeneratedWorkflowRecord>;
}

export interface WorkflowGeneratorProvider {
  generate(input: WorkflowGeneratorInputDto): Promise<WorkflowGeneratorOutputDto>;
}

export type WorkflowCategory =
  | 'lead_qualification'
  | 'sales'
  | 'customer_support'
  | 'booking'
  | 'crm'
  | 'invoice'
  | 'payment'
  | 'reminder'
  | 'calendar'
  | 'email'
  | 'whatsapp'
  | 'telegram'
  | 'slack'
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'knowledge_base'
  | 'human_escalation'
  | 'follow_up'
  | 'reporting'
  | 'analytics'
  | 'document_generation'
  | 'proposal'
  | 'contract'
  | 'client_onboarding'
  | 'employee_onboarding'
  | 'inventory'
  | 'hr'
  | 'finance'
  | 'operations';
