import type { PromptRepository, GeneratedPromptRecord } from './prompt-generator.types.js';

export class InMemoryPromptRepository implements PromptRepository {
  private readonly records: GeneratedPromptRecord[] = [];

  async findByName(promptName: string): Promise<GeneratedPromptRecord | null> {
    return this.records.find((record) => record.promptName === promptName) ?? null;
  }

  async save(record: GeneratedPromptRecord): Promise<GeneratedPromptRecord> {
    this.records.push(record);
    return record;
  }
}
