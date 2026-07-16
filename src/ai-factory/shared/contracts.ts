export interface Identifiable {
  id: string;
}

export interface Auditable extends Identifiable {
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface AiFactoryRequest {
  organizationId: string;
  requestedBy?: string;
  correlationId?: string;
}

export interface AiFactoryResponse {
  id: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface AiFactoryMetadata {
  resourceType: string;
  source: string;
  confidence: number;
}
