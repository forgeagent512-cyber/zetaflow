import test from 'node:test';
import assert from 'node:assert/strict';
import { GeminiAgentGenerator } from '../gemini-agent-generator.js';
test('GeminiAgentGenerator calls Gemini and parses generated agents', async () => {
    const originalFetch = globalThis.fetch;
    const requests = [];
    globalThis.fetch = (async (input, init) => {
        requests.push({ input, init });
        return new Response(JSON.stringify({
            candidates: [{
                    content: {
                        parts: [{
                                text: JSON.stringify({
                                    employee_name: 'Sales Ops AI Employee',
                                    agents: [{
                                            agent_name: 'Lead Qualification Agent',
                                            role: 'Lead Qualification',
                                            description: 'Qualifies and routes leads',
                                            system_prompt: 'You qualify and route leads.',
                                            goals: ['Qualify incoming leads'],
                                            tools: ['crm_api'],
                                            permissions: ['read:customer-data'],
                                            memory: 'long_term',
                                            llm: 'gemini',
                                            trigger_events: ['new_request'],
                                            required_workflows: ['lead-capture'],
                                            required_integrations: ['crm']
                                        }]
                                })
                            }]
                    }
                }]
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    });
    try {
        const provider = new GeminiAgentGenerator({ apiKey: 'test-key' });
        const result = await provider.generate({
            employee_name: 'Sales Ops AI Employee',
            industry: 'Real Estate',
            department: 'Sales',
            required_workflows: ['lead-capture'],
            required_integrations: ['crm'],
            required_tools: ['crm_api'],
            organizationId: 'org-1',
            requestedBy: 'tester'
        });
        assert.equal(requests.length, 1);
        assert.equal(result.agents[0].agent_name, 'Lead Qualification Agent');
        assert.deepEqual(result.agents[0].required_workflows, ['lead-capture']);
    }
    finally {
        globalThis.fetch = originalFetch;
    }
});
