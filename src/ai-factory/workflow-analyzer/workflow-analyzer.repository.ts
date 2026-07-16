import type { WorkflowAnalysisRepository } from './workflow-analyzer.types.js';
import type { WorkflowAnalysisRecordDto } from './workflow-analyzer.dto.js';

export class InMemoryWorkflowAnalysisRepository implements WorkflowAnalysisRepository {
  private readonly records: WorkflowAnalysisRecordDto[] = [];

  async save(record: WorkflowAnalysisRecordDto): Promise<WorkflowAnalysisRecordDto> {
    this.records.push(record);
    return record;
  }

  async findByWorkflowId(workflowId: string): Promise<WorkflowAnalysisRecordDto | null> {
    return this.records.find((record) => record.workflow_id === workflowId) ?? null;
  }
}
