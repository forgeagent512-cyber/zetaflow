import type { WorkflowGeneratorRepository, GeneratedWorkflowRecord } from './workflow-generator.types.js';
import type { WorkflowGeneratorInputDto } from './workflow-generator.dto.js';

export class InMemoryWorkflowGeneratorRepository implements WorkflowGeneratorRepository {
  private readonly records: GeneratedWorkflowRecord[] = [];

  async findSimilarWorkflow(input: WorkflowGeneratorInputDto, workflowName: string): Promise<GeneratedWorkflowRecord | null> {
    return this.records.find((record) => record.workflowName === workflowName) ?? null;
  }

  async save(record: GeneratedWorkflowRecord): Promise<GeneratedWorkflowRecord> {
    this.records.push(record);
    return record;
  }
}
