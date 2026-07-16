import test from 'node:test';
import assert from 'node:assert/strict';
import { DeploymentManagerService } from '../deployment-manager.service.js';
import { InMemoryDeploymentRepository } from '../deployment-manager.repository.js';

test('DeploymentManagerService returns a successful deployment report', async () => {
  const repository = new InMemoryDeploymentRepository();
  const service = new DeploymentManagerService(repository);

  const result = await service.deploy({
    organizationId: 'org-1',
    strategy: 'fresh_install',
    target: 'n8n'
  });

  assert.equal(result.status, 'success');
  assert.equal(result.employee_deployed, true);
  assert.equal(result.workflow_deployed, true);
  assert.ok(result.logs.length > 0);
});
