import test from 'node:test';
import assert from 'node:assert/strict';
import { WorkflowAnalyzerService } from '../workflow-analyzer.service.js';
import { InMemoryWorkflowAnalysisRepository } from '../workflow-analyzer.repository.js';

test('WorkflowAnalyzerService analyzes workflow JSON and stores a vectorized analysis', async () => {
  const repository = new InMemoryWorkflowAnalysisRepository();
  const service = new WorkflowAnalyzerService(repository);

  const workflowJson = {
    name: 'Real Estate Lead Qualification',
    nodes: [
      {
        id: '1',
        name: 'Webhook Trigger',
        type: 'n8n-nodes-base.webhook',
        parameters: { httpMethod: 'POST' },
        credentials: { openAIApi: { id: '1', name: 'OpenAI API' } }
      },
      {
        id: '2',
        name: 'OpenAI Classifier',
        type: 'n8n-nodes-base.openAi',
        parameters: { operation: 'chat' }
      },
      {
        id: '3',
        name: 'HubSpot CRM Update',
        type: 'n8n-nodes-base.hubspot',
        parameters: { resource: 'contact' }
      }
    ],
    connections: {},
    credentials: { openAIApi: { id: '1', name: 'OpenAI API' } }
  };

  const result = await service.analyze({ workflow_json: workflowJson });

  assert.equal(result.analysis.workflow_name, 'Real Estate Lead Qualification');
  assert.equal(result.analysis.total_node_count, 3);
  assert.ok(result.analysis.trigger_nodes.includes('Webhook Trigger'));
  assert.ok(result.analysis.ai_nodes.includes('OpenAI Classifier'));
  assert.ok(result.analysis.ai_providers_used.includes('OpenAI'));
  assert.ok(result.analysis.required_integrations.includes('openai'));
  assert.ok(result.analysis.required_integrations.includes('hubspot'));
  assert.ok(result.embedding.length > 0);
  assert.equal(result.metadata.workflow_name, 'Real Estate Lead Qualification');
});
