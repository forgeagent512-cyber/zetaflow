import test from 'node:test';
import assert from 'node:assert/strict';
import { slugify, inferTriggerType, extractWorkflowMetadata } from '../workflow-import.service.js';

test('slugify converts workflow names into stable slugs', () => {
  assert.equal(slugify('Lead Capture Automation'), 'lead-capture-automation');
  assert.equal(slugify('Customer Support / CRM'), 'customer-support-crm');
});

test('inferTriggerType detects webhook workflows from node types', () => {
  assert.equal(inferTriggerType([{ type: 'n8n-nodes-base.webhook' }]), 'webhook');
  assert.equal(inferTriggerType([{ type: 'n8n-nodes-base.scheduleTrigger' }]), 'schedule');
  assert.equal(inferTriggerType([{ type: 'n8n-nodes-base.set' }]), 'unknown');
});

test('extractWorkflowMetadata builds import metadata from a workflow object', () => {
  const workflow = {
    name: 'Lead Capture Automation',
    nodes: [{ type: 'n8n-nodes-base.webhook' }, { type: 'n8n-nodes-base.set' }],
    meta: { description: 'Captures and qualifies leads', tags: ['sales', 'lead-gen'] }
  };

  const metadata = extractWorkflowMetadata(workflow as any, 'demo.json');

  assert.equal(metadata.templateName, 'Lead Capture Automation');
  assert.equal(metadata.slug, 'lead-capture-automation');
  assert.equal(metadata.triggerType, 'webhook');
  assert.equal(metadata.nodeCount, 2);
  assert.equal(metadata.description, 'Captures and qualifies leads');
  assert.deepEqual(metadata.tags, ['sales', 'lead-gen']);
});
