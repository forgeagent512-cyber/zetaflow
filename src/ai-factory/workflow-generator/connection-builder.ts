import type { WorkflowDefinitionDto } from './workflow-generator.dto.js';

export class ConnectionBuilder {
  build(definition: WorkflowDefinitionDto): Record<string, Array<Array<{ from: string; to: string; type?: 'main'; index?: number }>>> {
    return {
      trigger: [[{ from: 'trigger', to: 'set-context' }]],
      'set-context': [[{ from: 'set-context', to: 'decision' }]],
      decision: [
        [{ from: 'decision', to: 'action' }],
        [{ from: 'decision', to: 'persist' }]
      ],
      action: [[{ from: 'action', to: 'persist' }]],
      persist: []
    };
  }
}
