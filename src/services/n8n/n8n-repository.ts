export interface N8nRepository<TRecord> {
  save(record: TRecord): Promise<TRecord>;
  findById(id: string): Promise<TRecord | null>;
  delete(id: string): Promise<boolean>;
}

export class InMemoryN8nRepository<TRecord extends { id: string }> implements N8nRepository<TRecord> {
  private readonly records = new Map<string, TRecord>();

  async save(record: TRecord): Promise<TRecord> {
    this.records.set(record.id, record);
    return record;
  }

  async findById(id: string): Promise<TRecord | null> {
    return this.records.get(id) ?? null;
  }

  async delete(id: string): Promise<boolean> {
    return this.records.delete(id);
  }
}
