import type { KnowledgeGeneratorInputDto, KnowledgeBaseDto, KnowledgeDocumentDto } from './knowledge-generator.dto.js';

export interface KnowledgeBaseRecord {
  id: string;
  organizationId: string;
  title: string;
  documents: KnowledgeDocumentDto[];
  tags: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeRepository {
  save(record: KnowledgeBaseRecord): Promise<KnowledgeBaseRecord>;
  findByOrganizationId(organizationId: string): Promise<KnowledgeBaseRecord[]>;
}

export interface KnowledgeGeneratorProvider {
  generate(input: KnowledgeGeneratorInputDto): Promise<KnowledgeBaseDto>;
}

export interface SearchRequest {
  organizationId: string;
  query: string;
  topK?: number;
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  score: number;
}
