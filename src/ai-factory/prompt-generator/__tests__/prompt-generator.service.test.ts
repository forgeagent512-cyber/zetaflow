import test from 'node:test';
import assert from 'node:assert/strict';
import { PromptGeneratorService } from '../prompt-generator.service.js';
import { InMemoryPromptRepository } from '../prompt-generator.repository.js';

test('PromptGeneratorService creates a production-grade prompt package', async () => {
  const repository = new InMemoryPromptRepository();
  const service = new PromptGeneratorService(repository);

  const result = await service.generate({
    organizationId: 'org-1',
    employeeId: 'employee-1',
    agentId: 'agent-1',
    employee: { employee_name: 'Mina', role: 'Sales' },
    agent: { agent_name: 'Booking Agent', role: 'Booking' },
    promptType: 'Sales',
    model: 'gemini',
    requirements: ['WhatsApp', 'CRM', 'Stripe'],
    language: 'English',
    tone: 'professional'
  });

  assert.equal(result.prompt_type, 'Sales');
  assert.ok(result.system_prompt.includes('Mina'));
  assert.ok(result.developer_prompt.includes('gemini'));
  assert.ok(result.assistant_prompt.includes('Booking Agent'));
});
