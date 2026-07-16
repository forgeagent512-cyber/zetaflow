import test from 'node:test';
import assert from 'node:assert/strict';
import { WorkflowGeneratorService } from '../workflow-generator.service.js';
import { InMemoryWorkflowGeneratorRepository } from '../workflow-generator.repository.js';
test('WorkflowGeneratorService creates a deployable workflow payload', async () => {
    const repository = new InMemoryWorkflowGeneratorRepository();
    const service = new WorkflowGeneratorService(repository);
    const result = await service.generate({
        organizationId: 'org-1',
        employeeId: 'employee-1',
        employee: { name: 'Mina' },
        agents: [{ agent_name: 'Sales Agent' }],
        requirements: ['WhatsApp', 'CRM', 'Stripe'],
        industry: 'Restaurant',
        workflowType: 'Booking'
    });
    assert.equal(result.workflow_name, 'Restaurant Booking');
    assert.equal(result.required_credentials[0], 'WhatsApp');
    assert.equal(result.required_integrations[0], 'WhatsApp');
    assert.equal(result.deployment_strategy, 'cloud');
    assert.ok(result.workflow_json.nodes);
});
