import test from 'node:test';
import assert from 'node:assert/strict';
import { KnowledgeGeneratorService } from '../knowledge-generator.service.js';
import { InMemoryKnowledgeRepository } from '../knowledge-generator.repository.js';
test('KnowledgeGeneratorService builds a knowledge base from content', async () => {
    const repository = new InMemoryKnowledgeRepository();
    const service = new KnowledgeGeneratorService(repository);
    const result = await service.generate({
        organizationId: 'org-1',
        title: 'Sales SOP',
        content: 'Sales SOP: Follow up with clients within one day. Document every lead and escalate if payment fails.',
        sourceType: 'text',
        requirements: ['sales', 'support']
    });
    assert.equal(result.title, 'Sales SOP');
    assert.equal(result.documents.length, 1);
    assert.ok(result.tags.includes('sales'));
    assert.equal(result.status, 'active');
});
