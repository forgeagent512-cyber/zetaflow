import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { WorkflowAnalyzerService } from '../ai-factory/workflow-analyzer/workflow-analyzer.service.js';
import { InMemoryWorkflowAnalysisRepository } from '../ai-factory/workflow-analyzer/workflow-analyzer.repository.js';

async function main() {
  const workflowJson = {
    name: 'CLI Analyzed Workflow',
    nodes: [{ id: '1', name: 'Webhook', type: 'n8n-nodes-base.webhook' }],
    connections: {}
  };

  const service = new WorkflowAnalyzerService(new InMemoryWorkflowAnalysisRepository());
  const result = await service.analyze({ workflow_json: workflowJson });
  console.log(JSON.stringify({ success: true, data: result }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
