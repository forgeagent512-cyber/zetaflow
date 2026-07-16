export class WorkflowAnalyzerValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkflowAnalyzerValidationError';
  }
}

export interface WorkflowAnalyzerValidationInput {
  workflow_json?: unknown;
  workflow_id?: unknown;
}

export function validateWorkflowAnalyzerInput(input: WorkflowAnalyzerValidationInput) {
  const workflowJson = input.workflow_json;
  if (typeof workflowJson === 'string') {
    try {
      const parsed = JSON.parse(workflowJson) as Record<string, unknown>;
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new WorkflowAnalyzerValidationError('workflow_json must be a JSON object');
      }
      return {
        workflow_json: parsed,
        workflow_id: typeof input.workflow_id === 'string' && input.workflow_id.trim() ? input.workflow_id.trim() : `wf-${Date.now()}`
      };
    } catch (error) {
      throw new WorkflowAnalyzerValidationError('workflow_json must be valid JSON');
    }
  }

  if (workflowJson && typeof workflowJson === 'object' && !Array.isArray(workflowJson)) {
    return {
      workflow_json: workflowJson as Record<string, unknown>,
      workflow_id: typeof input.workflow_id === 'string' && input.workflow_id.trim() ? input.workflow_id.trim() : `wf-${Date.now()}`
    };
  }

  throw new WorkflowAnalyzerValidationError('workflow_json is required and must be a JSON object');
}
