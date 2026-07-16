import type { WorkflowDefinitionDto, WorkflowNodeDto } from './workflow-generator.dto.js';

export class NodeBuilder {
  build(definition: WorkflowDefinitionDto): WorkflowNodeDto[] {
    const nodes: WorkflowNodeDto[] = [
      {
        id: 'trigger',
        name: `${definition.workflowType} Trigger`,
        type: 'n8n-nodes-base.webhook',
        typeVersion: 1,
        position: [250, 300],
        parameters: {
          httpMethod: 'POST',
          path: definition.workflowType.toLowerCase().replace(/\s+/g, '-'),
          responseMode: 'onReceived'
        }
      },
      {
        id: 'set-context',
        name: 'Initialize Context',
        type: 'n8n-nodes-base.set',
        typeVersion: 2.1,
        position: [500, 300],
        parameters: {
          values: {
            string: [
              { name: 'workflow_type', value: definition.workflowType },
              { name: 'industry', value: definition.name.split(' ')[0] }
            ]
          }
        }
      },
      {
        id: 'decision',
        name: 'Route by Intent',
        type: 'n8n-nodes-base.if',
        typeVersion: 2.1,
        position: [750, 300],
        parameters: {
          conditions: {
            string: [[{ value1: '={{ $json.intent }}', operation: 'notEmpty' }]]
          }
        }
      },
      {
        id: 'action',
        name: 'Execute Action',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [1000, 300],
        parameters: {
          method: 'POST',
          url: 'https://api.example.com/automation',
          sendBody: true,
          spec: { response: { response: { body: { content: { 'application/json': { schema: { type: 'object' } } } } } } }
        }
      },
      {
        id: 'persist',
        name: 'Persist Result',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [1250, 300],
        parameters: {
          jsCode: 'return items;'
        }
      }
    ];

    return nodes;
  }
}
