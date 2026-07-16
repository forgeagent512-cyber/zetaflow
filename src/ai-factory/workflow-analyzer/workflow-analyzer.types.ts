import type { WorkflowAnalysisRecordDto } from './workflow-analyzer.dto.js';

export interface WorkflowAnalysisRepository {
  save(record: WorkflowAnalysisRecordDto): Promise<WorkflowAnalysisRecordDto>;
  findByWorkflowId(workflowId: string): Promise<WorkflowAnalysisRecordDto | null>;
}
