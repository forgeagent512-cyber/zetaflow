import { WorkflowGenerationService } from '../ai-factory/workflow-generator/workflow-generation.service.js';
import { WorkflowGeneratorService } from '../ai-factory/workflow-generator/workflow-generator.service.js';
import { InMemoryWorkflowGeneratorRepository } from '../ai-factory/workflow-generator/workflow-generator.repository.js';

async function main() {
  const generator = new WorkflowGeneratorService(new InMemoryWorkflowGeneratorRepository());
  const service = new WorkflowGenerationService(generator);
  const result = await service.generate({
    business_purpose: 'lead qualification',
    industry: 'real estate',
    category: 'sales'
  });

  console.log(JSON.stringify({ success: true, data: result }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
