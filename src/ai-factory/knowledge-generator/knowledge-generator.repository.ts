import type { KnowledgeRepository, KnowledgeBaseRecord } from './knowledge-generator.types.js';

export class InMemoryKnowledgeRepository implements KnowledgeRepository {
  private readonly records: KnowledgeBaseRecord[] = [];

  async save(record: KnowledgeBaseRecord): Promise<KnowledgeBaseRecord> {
    this.records.push(record);
    return record;
  }

  async findByOrganizationId(organizationId: string): Promise<KnowledgeBaseRecord[]> {
    return this.records.filter((record) => record.organizationId === organizationId);
  }
}
