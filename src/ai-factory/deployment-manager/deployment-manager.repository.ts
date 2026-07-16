import type { DeploymentRecord, DeploymentRepository } from './deployment-manager.types.js';

export class InMemoryDeploymentRepository implements DeploymentRepository {
  private readonly records: DeploymentRecord[] = [];

  async save(record: DeploymentRecord): Promise<DeploymentRecord> {
    this.records.push(record);
    return record;
  }

  async findById(id: string): Promise<DeploymentRecord | null> {
    return this.records.find((record) => record.id === id) ?? null;
  }
}
