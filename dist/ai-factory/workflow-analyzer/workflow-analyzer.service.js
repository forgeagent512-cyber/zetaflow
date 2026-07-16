import { randomUUID } from 'node:crypto';
import { validateWorkflowAnalyzerInput } from './workflow-analyzer.validation.js';
import { EmbeddingService } from './embedding-service.js';
export class WorkflowAnalyzerService {
    repository;
    embeddingService;
    constructor(repository, embeddingService = new EmbeddingService()) {
        this.repository = repository;
        this.embeddingService = embeddingService;
    }
    async analyze(input) {
        const validated = validateWorkflowAnalyzerInput(input);
        const workflowJson = validated.workflow_json;
        const workflowName = this.extractString(workflowJson.name) ?? 'Untitled Workflow';
        const nodes = Array.isArray(workflowJson.nodes) ? workflowJson.nodes : [];
        const nodeList = nodes.filter((node) => !!node && typeof node === 'object');
        const triggerNodes = nodeList.filter((node) => this.isTriggerNode(node)).map((node) => this.extractString(node.name) ?? 'Unnamed Trigger');
        const actionNodes = nodeList.filter((node) => !this.isTriggerNode(node) && !this.isAiNode(node)).map((node) => this.extractString(node.name) ?? 'Unnamed Action');
        const aiNodes = nodeList.filter((node) => this.isAiNode(node)).map((node) => this.extractString(node.name) ?? 'Unnamed AI Node');
        const aiProvidersUsed = this.collectAiProviders(nodeList);
        const credentialsRequired = this.collectStrings(nodeList, 'credentials').map((value) => value.replace(/Api$/i, ' API'));
        const integrationsUsed = this.collectIntegrations(nodeList, workflowJson);
        const requiredIntegrations = this.collectRequiredIntegrations(nodeList, workflowJson, credentialsRequired, aiProvidersUsed, integrationsUsed);
        const externalApis = this.collectExternalApis(nodeList);
        const saasProductsUsed = this.collectSaasProducts(nodeList);
        const nodeTypes = this.collectNodeTypes(nodeList);
        const requiredConnections = this.collectRequiredConnections(nodeList, workflowJson);
        const category = this.inferCategory(triggerNodes, aiNodes);
        const categories = this.inferCategories(integrationsUsed, category, workflowName);
        const estimatedCost = this.estimateCost(nodeList.length, aiNodes.length);
        const analysis = {
            workflow_name: workflowName,
            business_purpose: this.inferBusinessPurpose(workflowName, integrationsUsed, aiProvidersUsed),
            business_summary: `Automates ${workflowName.toLowerCase()} using ${integrationsUsed.join(', ') || 'standard automation'}.`,
            industry: this.inferIndustry(workflowName, integrationsUsed),
            category,
            use_case: this.inferUseCase(workflowName),
            trigger_type: triggerNodes.length > 0 ? 'webhook' : 'manual',
            trigger_nodes: triggerNodes,
            action_nodes: actionNodes,
            ai_nodes: aiNodes,
            total_node_count: nodeList.length,
            credentials_required: credentialsRequired,
            required_integrations: requiredIntegrations,
            integrations_used: integrationsUsed,
            external_apis: externalApis,
            saas_products_used: saasProductsUsed,
            ai_providers_used: aiProvidersUsed,
            required_connections: requiredConnections,
            node_types: nodeTypes,
            categories,
            estimated_cost: estimatedCost,
            complexity_score: this.scoreComplexity(nodeList.length, aiNodes.length, integrationsUsed.length),
            automation_score: this.scoreAutomation(nodeList.length, aiNodes.length),
            reusability_score: this.scoreReusability(integrationsUsed.length, aiNodes.length),
            suitable_industries: this.suggestIndustries(integrationsUsed, aiProvidersUsed),
            required_environment_variables: this.extractEnvironmentVariables(integrationsUsed, aiProvidersUsed),
            required_secrets: this.extractSecrets(credentialsRequired),
            human_readable_description: `${workflowName} orchestrates ${triggerNodes.length > 0 ? 'event-driven' : 'manual'} automation with ${aiNodes.length > 0 ? 'AI assistance' : 'rule-based processing'}.`,
            search_tags: this.buildTags(workflowName, integrationsUsed, aiProvidersUsed),
            keywords: this.buildKeywords(workflowName, integrationsUsed, aiProvidersUsed)
        };
        const embedding = await this.embeddingService.generate(analysis);
        const now = new Date().toISOString();
        const record = {
            id: randomUUID(),
            workflow_id: validated.workflow_id,
            metadata: {
                workflow_name: workflowName,
                node_count: nodeList.length,
                source: 'workflow-json'
            },
            embedding,
            analysis,
            created_at: now,
            updated_at: now
        };
        await this.repository.save(record);
        return record;
    }
    extractString(value) {
        return typeof value === 'string' && value.trim() ? value.trim() : undefined;
    }
    isTriggerNode(node) {
        const type = this.extractString(node.type) ?? '';
        return /trigger|webhook/i.test(type);
    }
    isAiNode(node) {
        const type = this.extractString(node.type) ?? '';
        const name = this.extractString(node.name) ?? '';
        return /openai|ai|gpt|gemini|claude|llm|chat/i.test(`${type} ${name}`);
    }
    collectStrings(nodes, field) {
        const values = new Set();
        for (const node of nodes) {
            const fieldValue = node[field];
            if (fieldValue && typeof fieldValue === 'object' && !Array.isArray(fieldValue)) {
                for (const [key] of Object.entries(fieldValue)) {
                    values.add(key);
                }
            }
        }
        return [...values];
    }
    collectIntegrations(nodes, workflowJson) {
        const detected = new Set();
        for (const node of nodes) {
            const identifiers = [this.extractString(node.type), this.extractString(node.name)];
            for (const identifier of identifiers) {
                if (identifier) {
                    for (const token of this.normalizeIntegrationTokens(identifier)) {
                        detected.add(token);
                    }
                }
            }
            const credentials = node.credentials;
            if (credentials && typeof credentials === 'object' && !Array.isArray(credentials)) {
                for (const [key] of Object.entries(credentials)) {
                    for (const token of this.normalizeIntegrationTokens(key)) {
                        detected.add(token);
                    }
                }
            }
        }
        for (const token of this.normalizeIntegrationTokens(JSON.stringify(workflowJson))) {
            detected.add(token);
        }
        return [...detected].filter((token) => token.length > 2);
    }
    collectRequiredIntegrations(nodes, workflowJson, credentialsRequired, aiProvidersUsed, integrationsUsed) {
        const required = new Set(integrationsUsed);
        for (const node of nodes) {
            const credentials = node.credentials;
            if (credentials && typeof credentials === 'object' && !Array.isArray(credentials)) {
                for (const [key] of Object.entries(credentials)) {
                    for (const token of this.normalizeIntegrationTokens(key)) {
                        required.add(token);
                    }
                }
            }
        }
        for (const credential of credentialsRequired) {
            for (const token of this.normalizeIntegrationTokens(credential)) {
                required.add(token);
            }
        }
        for (const provider of aiProvidersUsed) {
            for (const token of this.normalizeIntegrationTokens(provider)) {
                required.add(token);
            }
        }
        for (const token of this.normalizeIntegrationTokens(JSON.stringify(workflowJson))) {
            required.add(token);
        }
        return [...required].filter((token) => token.length > 2);
    }
    normalizeIntegrationTokens(value) {
        const text = value
            .toLowerCase()
            .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
            .replace(/[^a-z0-9]+/g, ' ')
            .trim();
        const stopWords = new Set([
            'n8n', 'nodes', 'base', 'node', 'webhook', 'trigger', 'http', 'request', 'set', 'if', 'code', 'json', 'workflow',
            'action', 'auth', 'api', 'credential', 'credentials', 'parameters', 'value', 'values', 'operation', 'response',
            'body', 'headers', 'method', 'path', 'name', 'type', 'id', 'version', 'main', 'data', 'description', 'position',
            'notes', 'continue', 'retry', 'output', 'input', 'template', 'automation', 'event', 'resource', 'task', 'lead', 'contact',
            'update', 'create', 'read', 'write', 'delete', 'send', 'receive', 'chat', 'message', 'email', 'text', 'with', 'and',
            'for', 'the', 'from', 'into', 'this', 'that', 'your', 'workflow', 'json', 'field', 'fields', 'string', 'number', 'bool', 'object'
        ]);
        return text
            .split(/\s+/)
            .filter((token) => token.length > 2 && !stopWords.has(token));
    }
    collectExternalApis(nodes) {
        return [...new Set(nodes.flatMap((node) => {
                const text = `${this.extractString(node.type) ?? ''} ${this.extractString(node.name) ?? ''}`.toLowerCase();
                return /api|http|webhook/i.test(text) ? ['HTTP API'] : [];
            }))];
    }
    collectSaasProducts(nodes) {
        const products = new Set();
        for (const node of nodes) {
            const text = `${this.extractString(node.type) ?? ''} ${this.extractString(node.name) ?? ''}`.toLowerCase();
            if (text.includes('hubspot'))
                products.add('HubSpot');
            if (text.includes('salesforce'))
                products.add('Salesforce');
            if (text.includes('slack'))
                products.add('Slack');
            if (text.includes('notion'))
                products.add('Notion');
        }
        return [...products];
    }
    collectAiProviders(nodes) {
        const providers = new Set();
        for (const node of nodes) {
            const text = `${this.extractString(node.type) ?? ''} ${this.extractString(node.name) ?? ''}`.toLowerCase();
            if (text.includes('openai'))
                providers.add('OpenAI');
            if (text.includes('gemini'))
                providers.add('Gemini');
            if (text.includes('claude'))
                providers.add('Claude');
        }
        return [...providers];
    }
    scoreComplexity(nodeCount, aiNodeCount, integrationCount) {
        return Math.min(100, 20 + nodeCount * 8 + aiNodeCount * 10 + integrationCount * 5);
    }
    scoreAutomation(nodeCount, aiNodeCount) {
        return Math.min(100, 40 + nodeCount * 6 + aiNodeCount * 4);
    }
    scoreReusability(integrationCount, aiNodeCount) {
        return Math.min(100, 50 + integrationCount * 4 + aiNodeCount * 2);
    }
    inferBusinessPurpose(workflowName, integrationsUsed, aiProvidersUsed) {
        const providerText = aiProvidersUsed.length ? ` with ${aiProvidersUsed.join(', ')}` : '';
        return `${workflowName} automates operational work${providerText}.`;
    }
    inferIndustry(workflowName, integrationsUsed) {
        if (workflowName.toLowerCase().includes('real estate'))
            return 'Real Estate';
        if (integrationsUsed.some((item) => item.includes('crm')))
            return 'Sales';
        return 'General Business';
    }
    inferCategory(triggerNodes, aiNodes) {
        if (aiNodes.length > 0)
            return 'AI Automation';
        if (triggerNodes.length > 0)
            return 'Workflow Automation';
        return 'Operations';
    }
    inferUseCase(workflowName) {
        if (workflowName.toLowerCase().includes('lead'))
            return 'Lead Management';
        if (workflowName.toLowerCase().includes('support'))
            return 'Customer Support';
        return 'Business Automation';
    }
    suggestIndustries(integrationsUsed, aiProvidersUsed) {
        const industries = ['Real Estate', 'Sales', 'Operations'];
        if (aiProvidersUsed.length > 0)
            industries.push('Professional Services');
        if (integrationsUsed.some((item) => item.includes('crm')))
            industries.push('B2B SaaS');
        return industries;
    }
    extractEnvironmentVariables(integrationsUsed, aiProvidersUsed) {
        const vars = new Set();
        for (const integration of integrationsUsed) {
            vars.add(`${integration.toUpperCase()}_API_URL`);
        }
        if (aiProvidersUsed.length > 0)
            vars.add('OPENAI_API_KEY');
        return [...vars];
    }
    extractSecrets(credentialsRequired) {
        return credentialsRequired.map((credential) => `${credential.toUpperCase().replace(/\s+/g, '_')}_KEY`);
    }
    buildTags(workflowName, integrationsUsed, aiProvidersUsed) {
        return [...new Set([workflowName.toLowerCase(), ...integrationsUsed, ...aiProvidersUsed, 'automation', 'workflow'])];
    }
    buildKeywords(workflowName, integrationsUsed, aiProvidersUsed) {
        return [...new Set([workflowName, ...integrationsUsed, ...aiProvidersUsed, 'automation', 'n8n'])];
    }
    collectNodeTypes(nodes) {
        const types = new Set();
        for (const node of nodes) {
            const nodeType = this.extractString(node.type);
            if (nodeType) {
                types.add(nodeType);
            }
        }
        return [...types];
    }
    collectRequiredConnections(nodes, workflowJson) {
        const connections = workflowJson.connections;
        const result = new Set();
        if (connections && typeof connections === 'object' && !Array.isArray(connections)) {
            for (const [sourceNode, targets] of Object.entries(connections)) {
                if (Array.isArray(targets)) {
                    for (const targetGroup of targets) {
                        if (Array.isArray(targetGroup)) {
                            for (const target of targetGroup) {
                                if (target && typeof target === 'object') {
                                    const targetNode = this.extractString(target.node);
                                    if (targetNode) {
                                        result.add(`${sourceNode}->${targetNode}`);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return [...result];
    }
    estimateCost(nodeCount, aiNodeCount) {
        return nodeCount * 5 + aiNodeCount * 20;
    }
    inferCategories(integrationsUsed, category, workflowName) {
        const cats = new Set();
        cats.add(category);
        if (integrationsUsed.some((item) => /crm|lead|sales|hubspot|salesforce/i.test(item)))
            cats.add('Sales');
        if (integrationsUsed.some((item) => /market|email|campaign|mailchimp|sendgrid/i.test(item)))
            cats.add('Marketing');
        if (integrationsUsed.some((item) => /support|ticket|zendesk|freshdesk|servicedesk|helpdesk/i.test(item)))
            cats.add('Customer Support');
        if (integrationsUsed.some((item) => /hr|hris|bamboo|workday|personio/i.test(item)))
            cats.add('HR');
        if (integrationsUsed.some((item) => /finance|account|invoice|quickbooks|xero|stripe|payment/i.test(item)))
            cats.add('Finance');
        if (integrationsUsed.some((item) => /ops|operation|it|devops|pagerduty|datadog|sentry/i.test(item)))
            cats.add('Operations');
        if (workflowName.toLowerCase().includes('lead') || workflowName.toLowerCase().includes('deal'))
            cats.add('Sales');
        if (workflowName.toLowerCase().includes('support') || workflowName.toLowerCase().includes('ticket'))
            cats.add('Customer Support');
        if (workflowName.toLowerCase().includes('market') || workflowName.toLowerCase().includes('campaign'))
            cats.add('Marketing');
        return [...cats];
    }
}
