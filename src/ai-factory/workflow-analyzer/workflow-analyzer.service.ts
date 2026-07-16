import { randomUUID } from 'node:crypto';
import { validateWorkflowAnalyzerInput } from './workflow-analyzer.validation.js';
import type { WorkflowAnalyzerInputDto, WorkflowAnalyzerAnalysisDto, WorkflowAnalyzerResponseDto } from './workflow-analyzer.dto.js';
import type { WorkflowAnalysisRepository } from './workflow-analyzer.types.js';
import { EmbeddingService } from './embedding-service.js';

export class WorkflowAnalyzerService {
  constructor(
    private readonly repository: WorkflowAnalysisRepository,
    private readonly embeddingService: EmbeddingService = new EmbeddingService()
  ) {}

  async analyze(input: WorkflowAnalyzerInputDto): Promise<WorkflowAnalyzerResponseDto> {
    const validated = validateWorkflowAnalyzerInput(input);
    const workflowJson = validated.workflow_json;
    const workflowName = this.extractString(workflowJson.name) ?? 'Untitled Workflow';
    const nodes = Array.isArray(workflowJson.nodes) ? workflowJson.nodes : [];
    const nodeList = nodes.filter((node): node is Record<string, unknown> => !!node && typeof node === 'object');

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

    const analysis: WorkflowAnalyzerAnalysisDto = {
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

    const embedding = await this.embeddingService.generate(analysis as unknown as Record<string, unknown>);
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

  private extractString(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
  }

  private isTriggerNode(node: Record<string, unknown>): boolean {
    const type = this.extractString(node.type) ?? '';
    return /trigger|webhook/i.test(type);
  }

  private isAiNode(node: Record<string, unknown>): boolean {
    const type = this.extractString(node.type) ?? '';
    const name = this.extractString(node.name) ?? '';
    return /openai|ai|gpt|gemini|claude|llm|chat/i.test(`${type} ${name}`);
  }

  private collectStrings(nodes: Record<string, unknown>[], field: string): string[] {
    const values = new Set<string>();
    for (const node of nodes) {
      const fieldValue = node[field];
      if (fieldValue && typeof fieldValue === 'object' && !Array.isArray(fieldValue)) {
        for (const [key] of Object.entries(fieldValue as Record<string, unknown>)) {
          values.add(key);
        }
      }
    }
    return [...values];
  }

  private collectIntegrations(nodes: Record<string, unknown>[], workflowJson: Record<string, unknown>): string[] {
    const detected = new Set<string>();

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
        for (const [key] of Object.entries(credentials as Record<string, unknown>)) {
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

  private collectRequiredIntegrations(
    nodes: Record<string, unknown>[],
    workflowJson: Record<string, unknown>,
    credentialsRequired: string[],
    aiProvidersUsed: string[],
    integrationsUsed: string[]
  ): string[] {
    const required = new Set<string>(integrationsUsed);

    for (const node of nodes) {
      const credentials = node.credentials;
      if (credentials && typeof credentials === 'object' && !Array.isArray(credentials)) {
        for (const [key] of Object.entries(credentials as Record<string, unknown>)) {
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

  private normalizeIntegrationTokens(value: string): string[] {
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

  private collectExternalApis(nodes: Record<string, unknown>[]): string[] {
    return [...new Set(nodes.flatMap((node) => {
      const text = `${this.extractString(node.type) ?? ''} ${this.extractString(node.name) ?? ''}`.toLowerCase();
      return /api|http|webhook/i.test(text) ? ['HTTP API'] : [];
    }))];
  }

  private collectSaasProducts(nodes: Record<string, unknown>[]): string[] {
    const products = new Set<string>();
    for (const node of nodes) {
      const text = `${this.extractString(node.type) ?? ''} ${this.extractString(node.name) ?? ''}`.toLowerCase();
      if (text.includes('hubspot')) products.add('HubSpot');
      if (text.includes('salesforce')) products.add('Salesforce');
      if (text.includes('slack')) products.add('Slack');
      if (text.includes('notion')) products.add('Notion');
    }
    return [...products];
  }

  private collectAiProviders(nodes: Record<string, unknown>[]): string[] {
    const providers = new Set<string>();
    for (const node of nodes) {
      const text = `${this.extractString(node.type) ?? ''} ${this.extractString(node.name) ?? ''}`.toLowerCase();
      if (text.includes('openai')) providers.add('OpenAI');
      if (text.includes('gemini')) providers.add('Gemini');
      if (text.includes('claude')) providers.add('Claude');
    }
    return [...providers];
  }

  private scoreComplexity(nodeCount: number, aiNodeCount: number, integrationCount: number): number {
    return Math.min(100, 20 + nodeCount * 8 + aiNodeCount * 10 + integrationCount * 5);
  }

  private scoreAutomation(nodeCount: number, aiNodeCount: number): number {
    return Math.min(100, 40 + nodeCount * 6 + aiNodeCount * 4);
  }

  private scoreReusability(integrationCount: number, aiNodeCount: number): number {
    return Math.min(100, 50 + integrationCount * 4 + aiNodeCount * 2);
  }

  private inferBusinessPurpose(workflowName: string, integrationsUsed: string[], aiProvidersUsed: string[]): string {
    const providerText = aiProvidersUsed.length ? ` with ${aiProvidersUsed.join(', ')}` : '';
    return `${workflowName} automates operational work${providerText}.`;
  }

  private inferIndustry(workflowName: string, integrationsUsed: string[]): string {
    if (workflowName.toLowerCase().includes('real estate')) return 'Real Estate';
    if (integrationsUsed.some((item) => item.includes('crm'))) return 'Sales';
    return 'General Business';
  }

  private inferCategory(triggerNodes: string[], aiNodes: string[]): string {
    if (aiNodes.length > 0) return 'AI Automation';
    if (triggerNodes.length > 0) return 'Workflow Automation';
    return 'Operations';
  }

  private inferUseCase(workflowName: string): string {
    if (workflowName.toLowerCase().includes('lead')) return 'Lead Management';
    if (workflowName.toLowerCase().includes('support')) return 'Customer Support';
    return 'Business Automation';
  }

  private suggestIndustries(integrationsUsed: string[], aiProvidersUsed: string[]): string[] {
    const industries = ['Real Estate', 'Sales', 'Operations'];
    if (aiProvidersUsed.length > 0) industries.push('Professional Services');
    if (integrationsUsed.some((item) => item.includes('crm'))) industries.push('B2B SaaS');
    return industries;
  }

  private extractEnvironmentVariables(integrationsUsed: string[], aiProvidersUsed: string[]): string[] {
    const vars = new Set<string>();
    for (const integration of integrationsUsed) {
      vars.add(`${integration.toUpperCase()}_API_URL`);
    }
    if (aiProvidersUsed.length > 0) vars.add('OPENAI_API_KEY');
    return [...vars];
  }

  private extractSecrets(credentialsRequired: string[]): string[] {
    return credentialsRequired.map((credential) => `${credential.toUpperCase().replace(/\s+/g, '_')}_KEY`);
  }

  private buildTags(workflowName: string, integrationsUsed: string[], aiProvidersUsed: string[]): string[] {
    return [...new Set([workflowName.toLowerCase(), ...integrationsUsed, ...aiProvidersUsed, 'automation', 'workflow'])];
  }

  private buildKeywords(workflowName: string, integrationsUsed: string[], aiProvidersUsed: string[]): string[] {
    return [...new Set([workflowName, ...integrationsUsed, ...aiProvidersUsed, 'automation', 'n8n'])];
  }

  private collectNodeTypes(nodes: Record<string, unknown>[]): string[] {
    const types = new Set<string>();
    for (const node of nodes) {
      const nodeType = this.extractString(node.type);
      if (nodeType) {
        types.add(nodeType);
      }
    }
    return [...types];
  }

  private collectRequiredConnections(nodes: Record<string, unknown>[], workflowJson: Record<string, unknown>): string[] {
    const connections = workflowJson.connections;
    const result = new Set<string>();
    if (connections && typeof connections === 'object' && !Array.isArray(connections)) {
      for (const [sourceNode, targets] of Object.entries(connections as Record<string, unknown>)) {
        if (Array.isArray(targets)) {
          for (const targetGroup of targets) {
            if (Array.isArray(targetGroup)) {
              for (const target of targetGroup) {
                if (target && typeof target === 'object') {
                  const targetNode = this.extractString((target as Record<string, unknown>).node);
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

  private estimateCost(nodeCount: number, aiNodeCount: number): number {
    return nodeCount * 5 + aiNodeCount * 20;
  }

  private inferCategories(integrationsUsed: string[], category: string, workflowName: string): string[] {
    const cats = new Set<string>();
    cats.add(category);
    if (integrationsUsed.some((item) => /crm|lead|sales|hubspot|salesforce/i.test(item))) cats.add('Sales');
    if (integrationsUsed.some((item) => /market|email|campaign|mailchimp|sendgrid/i.test(item))) cats.add('Marketing');
    if (integrationsUsed.some((item) => /support|ticket|zendesk|freshdesk|servicedesk|helpdesk/i.test(item))) cats.add('Customer Support');
    if (integrationsUsed.some((item) => /hr|hris|bamboo|workday|personio/i.test(item))) cats.add('HR');
    if (integrationsUsed.some((item) => /finance|account|invoice|quickbooks|xero|stripe|payment/i.test(item))) cats.add('Finance');
    if (integrationsUsed.some((item) => /ops|operation|it|devops|pagerduty|datadog|sentry/i.test(item))) cats.add('Operations');
    if (workflowName.toLowerCase().includes('lead') || workflowName.toLowerCase().includes('deal')) cats.add('Sales');
    if (workflowName.toLowerCase().includes('support') || workflowName.toLowerCase().includes('ticket')) cats.add('Customer Support');
    if (workflowName.toLowerCase().includes('market') || workflowName.toLowerCase().includes('campaign')) cats.add('Marketing');
    return [...cats];
  }
}
