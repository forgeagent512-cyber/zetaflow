import { TemplateSearchService } from '../ai-factory/workflow-generator/template-search.service.js';
import { InMemoryWorkflowGeneratorRepository } from '../ai-factory/workflow-generator/workflow-generator.repository.js';

async function main() {
  const service = new TemplateSearchService(new InMemoryWorkflowGeneratorRepository());
  const result = await service.search({
    business_purpose: 'lead qualification',
    industry: 'real estate',
    category: 'sales',
    trigger: 'webhook',
    integrations: ['crm'],
    tags: ['lead', 'sales'],
    ai_provider: 'OpenAI',
    complexity: 75,
    node_types: ['webhook']
  });

  console.log(JSON.stringify({ success: true, data: result }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
