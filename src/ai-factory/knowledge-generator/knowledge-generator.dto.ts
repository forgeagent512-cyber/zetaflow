export type KnowledgeContentType = 'faq' | 'sop' | 'documentation' | 'ai_context' | 'prompt_context' | 'training_material';

export interface KnowledgeGeneratorInputDto {
  organizationId: string;
  employeeId?: string;
  agentId?: string;
  sourceType?: string;
  sourceUrl?: string;
  title?: string;
  content?: string;
  files?: Array<{ name: string; content?: string; mimeType?: string }>;
  metadata?: Record<string, unknown>;
  requirements?: string[];
  requestedBy?: string;
  correlationId?: string;
  contentType?: KnowledgeContentType;
  autoGenerate?: boolean;
}

export interface KnowledgeDocumentDto {
  id: string;
  title: string;
  content: string;
  sourceType: string;
  sourceUrl?: string;
  metadata: Record<string, unknown>;
  tags: string[];
  language: string;
  summary: string;
}

export interface KnowledgeBaseDto {
  id: string;
  organizationId: string;
  title: string;
  documents: KnowledgeDocumentDto[];
  tags: string[];
  metadata: Record<string, unknown>;
}

export interface KnowledgeGeneratorResponseDto {
  id: string;
  organizationId: string;
  title: string;
  documents: KnowledgeDocumentDto[];
  tags: string[];
  metadata: Record<string, unknown>;
  status: 'active' | 'draft';
  createdAt: string;
  updatedAt: string;
}
