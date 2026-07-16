import { randomUUID } from 'node:crypto';
import type { AiFactoryRequest, AiFactoryResponse, Auditable } from '../shared/contracts.js';
import type { Repository } from '../shared/repositories.js';
import { InMemoryRepository } from '../shared/repositories.js';

export interface QaCheckModel extends Auditable {
  targetId: string;
  targetType: string;
  status: 'passed' | 'failed' | 'pending';
  issues: string[];
  recommendations: string[];
}

export interface QaRequestDto extends AiFactoryRequest {
  targetId: string;
  targetType: string;
  workflowJson?: Record<string, unknown>;
  integrations?: Array<{ id: string; name: string; provider: string }>;
  employees?: Array<{ id: string; name: string; role?: string; department?: string }>;
  workflows?: Array<{ id: string; name: string; trigger?: string }>;
  prompts?: Array<{ id: string; content: string }>;
}

export interface QaResultDto extends AiFactoryResponse {
  qa: QaCheckModel;
}

export interface QaRepository extends Repository<QaCheckModel> {
  findByTarget(targetId: string, targetType: string): Promise<QaCheckModel[]>;
}

export class InMemoryQaRepository extends InMemoryRepository<QaCheckModel> implements QaRepository {
  async findByTarget(targetId: string, targetType: string): Promise<QaCheckModel[]> {
    return [];
  }
}

export interface IQaEngineService {
  evaluate(request: QaRequestDto): Promise<QaResultDto>;
}

export class QaEngineService implements IQaEngineService {
  constructor(private readonly repository: QaRepository) {}

  async evaluate(request: QaRequestDto): Promise<QaResultDto> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    const workflowChecks = request.workflowJson ? this.validateWorkflow(request.workflowJson) : [];
    issues.push(...workflowChecks);
    if (workflowChecks.length > 0) {
      recommendations.push('Review the workflow JSON structure for missing or malformed nodes/connections');
    }

    const n8nChecks = request.workflowJson ? this.validateN8nWorkflow(request.workflowJson) : [];
    issues.push(...n8nChecks);
    if (n8nChecks.length > 0) {
      recommendations.push('Fix n8n-specific workflow structure issues before deployment');
    }

    const credentialChecks = request.workflowJson ? this.validateCredentials(request.workflowJson) : [];
    issues.push(...credentialChecks);
    if (credentialChecks.length > 0) {
      recommendations.push(...credentialChecks.map(c =>
        `Ensure the credential "${c.replace('Missing credential: ', '')}" is configured before deployment`
      ));
      recommendations.push('Configure all credentials in n8n before activating the workflow');
    }

    if (request.workflowJson && request.integrations) {
      const integrationChecks = this.validateIntegrations(request.workflowJson, request.integrations);
      issues.push(...integrationChecks);
      if (integrationChecks.length > 0) {
        recommendations.push('Register missing integrations or remove references to non-existent ones');
      }
    }

    if (request.employees && request.workflows) {
      for (const emp of request.employees) {
        const dupEmp = this.checkDuplicate(request.employees.filter(e => e.id !== emp.id), emp);
        issues.push(...dupEmp);
      }
      if (issues.some(i => i.includes('Duplicate name') || i.includes('Duplicate role'))) {
        recommendations.push('Merge or rename duplicate employees to avoid role/name conflicts');
      }
    }

    if (request.workflows) {
      for (const wf of request.workflows) {
        const others = request.workflows.filter(w => w.id !== wf.id);
        issues.push(...this.checkDuplicate(others.map(w => ({ id: w.id, name: w.name, role: w.trigger })), {
          id: wf.id,
          name: wf.name,
          role: wf.trigger,
        }));
      }
      if (issues.some(i => i.includes('Duplicate'))) {
        recommendations.push('Merge or rename duplicate workflows to avoid name/trigger conflicts');
      }
    }

    if (request.prompts) {
      for (const p of request.prompts) {
        issues.push(...this.validatePrompt(p.content));
      }
      if (request.prompts.some(p => this.validatePrompt(p.content).length > 0)) {
        recommendations.push('Fix invalid prompts by filling empty content, resolving placeholders, and correcting formatting');
      }
    }

    const businessIssues = this.validateBusiness(request.employees, request.workflows, request.integrations);
    issues.push(...businessIssues);
    if (businessIssues.length > 0) {
      recommendations.push('Ensure business requirements are consistent across employees, workflows, and integrations');
    }

    if (issues.length > 0) {
      recommendations.push('Run QA checks again after fixes before proceeding to deployment');
    }

    const now = new Date().toISOString();
    const qa: QaCheckModel = {
      id: randomUUID(),
      organizationId: request.organizationId,
      targetId: request.targetId,
      targetType: request.targetType,
      status: issues.length === 0 ? 'passed' : 'failed',
      issues,
      recommendations,
      createdAt: now,
      updatedAt: now,
      createdBy: request.requestedBy,
    };

    await this.repository.save(qa);

    return {
      id: randomUUID(),
      status: issues.length === 0 ? 'completed' : 'failed',
      createdAt: now,
      updatedAt: now,
      qa,
    };
  }

  validateN8nWorkflow(workflowJson: Record<string, unknown>): string[] {
    const issues: string[] = [];
    const nodes = Array.isArray(workflowJson.nodes) ? workflowJson.nodes as Array<Record<string, unknown>> : [];

    if (!workflowJson.name && !workflowJson.id) {
      issues.push('n8n workflow must have a name or id field');
    }

    if (!workflowJson.nodes) {
      issues.push('n8n workflow must have a nodes array');
      return issues;
    }

    for (const node of nodes) {
      if (!node || typeof node !== 'object') continue;
      const type = typeof node.type === 'string' ? node.type : '';
      const parameters = node.parameters as Record<string, unknown> | undefined;

      if (type.includes('httpRequest') && parameters) {
        if (!parameters.url && !parameters.method) {
          issues.push(`HTTP Request node "${node.id ?? 'unknown'}" is missing URL or method`);
        }
      }

      if (type.includes('n8n') && type.includes('webhook')) {
        const httpMethod = parameters?.httpMethod;
        const path = parameters?.path;
        if (!httpMethod) {
          issues.push(`Webhook node "${node.id ?? 'unknown'}" is missing httpMethod`);
        }
        if (!path) {
          issues.push(`Webhook node "${node.id ?? 'unknown'}" is missing path`);
        }
      }

      if (type.includes('scheduleTrigger') && parameters) {
        if (!parameters.rule) {
          issues.push(`Schedule Trigger node "${node.id ?? 'unknown'}" is missing cron rule`);
        }
      }

      const credentials = node.credentials as Record<string, unknown> | undefined;
      if (credentials) {
        for (const [credName, credValue] of Object.entries(credentials)) {
          if (credValue === null || credValue === undefined || credValue === '') {
            issues.push(`Node "${node.id ?? 'unknown'}" has empty credential value for "${credName}"`);
          }
        }
      }

      if (type.includes('set') && parameters && !parameters.values) {
        issues.push(`Set node "${node.id ?? 'unknown'}" has no values configured`);
      }
    }

    return issues;
  }

  validateWorkflow(workflowJson: Record<string, unknown>): string[] {
    const issues: string[] = [];
    const nodes = Array.isArray(workflowJson.nodes) ? workflowJson.nodes as Array<Record<string, unknown>> : [];
    const connections = workflowJson.connections && typeof workflowJson.connections === 'object'
      ? workflowJson.connections as Record<string, unknown>
      : {};

    if (nodes.length === 0) {
      issues.push('Workflow must contain at least one node');
      return issues;
    }

    const nodeIds = new Set<string>();
    for (const node of nodes) {
      if (!node || typeof node !== 'object') {
        issues.push('Workflow contains a non-object node entry');
        continue;
      }
      const id = typeof node.id === 'string' ? node.id : null;
      if (!id) {
        issues.push('Node is missing an id field');
        continue;
      }
      if (nodeIds.has(id)) {
        issues.push(`Duplicate node ID detected: ${id}`);
      }
      nodeIds.add(id);

      if (!node.name || typeof node.name !== 'string' || node.name.trim() === '') {
        issues.push(`Node "${id}" is missing a name`);
      }
      if (!node.type || typeof node.type !== 'string' || node.type.trim() === '') {
        issues.push(`Node "${id}" is missing a type`);
      }
    }

    const hasTrigger = nodes.some(n =>
      typeof n.type === 'string' &&
      (n.type.toLowerCase().includes('trigger') || n.type.toLowerCase().includes('webhook'))
    );
    if (!hasTrigger) {
      issues.push('Workflow must include a trigger or webhook node');
    }

    const validNodeIds = new Set(nodeIds);
    for (const [source, links] of Object.entries(connections)) {
      if (!validNodeIds.has(source)) {
        issues.push(`Connection references unknown source node: "${source}"`);
      }
      if (!Array.isArray(links)) {
        issues.push(`Connections for "${source}" must be an array`);
        continue;
      }
      for (const link of links) {
        if (!Array.isArray(link)) {
          issues.push(`Connection entry for "${source}" is not a valid array`);
          continue;
        }
        for (const edge of link) {
          if (!edge || typeof edge !== 'object') {
            issues.push(`Invalid edge object in connection for "${source}"`);
            continue;
          }
          const edgeRecord = edge as Record<string, unknown>;
          const to = typeof edgeRecord.to === 'string' ? edgeRecord.to : null;
          if (!to) {
            issues.push(`Connection from "${source}" is missing a valid target node`);
          } else if (!validNodeIds.has(to)) {
            issues.push(`Connection from "${source}" references non-existent target node: "${to}"`);
          }
        }
      }
    }

    const referencedFromConnections = new Set<string>();
    for (const [, links] of Object.entries(connections)) {
      if (!Array.isArray(links)) continue;
      for (const link of links) {
        if (!Array.isArray(link)) continue;
        for (const edge of link) {
          if (edge && typeof edge === 'object') {
            const to = (edge as Record<string, unknown>).to;
            if (typeof to === 'string') referencedFromConnections.add(to);
          }
        }
      }
    }
    for (const sid of nodeIds) {
      if (sid === '') continue;
      const hasOutgoing = Object.keys(connections).includes(sid);
      const hasIncoming = referencedFromConnections.has(sid);
      const node = nodes.find(n => n.id === sid) as Record<string, unknown> | undefined;
      const isTrigger = node && typeof node.type === 'string' &&
        (node.type.toLowerCase().includes('trigger') || node.type.toLowerCase().includes('webhook'));
      if (!isTrigger && !hasIncoming) {
        issues.push(`Node "${sid}" has no incoming connections (orphan node)`);
      }
    }

    try {
      JSON.parse(JSON.stringify(workflowJson));
    } catch {
      issues.push('Workflow JSON is not valid JSON');
    }

    return issues;
  }

  validateCredentials(workflowJson: Record<string, unknown>): string[] {
    const missing: string[] = [];
    const nodes = Array.isArray(workflowJson.nodes) ? workflowJson.nodes as Array<Record<string, unknown>> : [];

    for (const node of nodes) {
      if (!node || typeof node !== 'object') continue;
      const credentials = (node as Record<string, unknown>).credentials;
      if (!credentials || typeof credentials !== 'object') continue;
      for (const [key, value] of Object.entries(credentials as Record<string, unknown>)) {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          missing.push(`Missing credential: ${key} on node "${node.id ?? 'unknown'}"`);
        }
      }
    }

    return missing;
  }

  validateIntegrations(
    workflowJson: Record<string, unknown>,
    integrations: Array<{ id: string; name: string; provider: string }>,
  ): string[] {
    const issues: string[] = [];
    const nodes = Array.isArray(workflowJson.nodes) ? workflowJson.nodes as Array<Record<string, unknown>> : [];
    const providerSet = new Set(integrations.map(i => i.provider.toLowerCase()));

    const knownProviders = new Set([
      'n8n', 'slack', 'discord', 'telegram', 'whatsapp', 'email', 'smtp',
      'google', 'gmail', 'google sheets', 'google sheets', 'google calendar',
      'google drive', 'google cloud', 'openai', 'anthropic', 'gemini',
      'deepseek', 'mistral', 'cohere', 'huggingface', 'replicate',
      'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'notion',
      'asana', 'trello', 'monday', 'clickup', 'linear', 'hubspot',
      'salesforce', 'zoho', 'pipedrive', 'freshdesk', 'zendesk',
      'intercom', 'stripe', 'paypal', 'square', 'shopify', 'woocommerce',
      'magento', 'bigcommerce', 'sendgrid', 'mailchimp', 'sendinblue',
      'postmark', 'twilio', 'vonage', 'plivo', 'messagebird', 'ses',
      'sns', 'sqs', 's3', 'dynamodb', 'lambda', 'api gateway',
      'http request', 'webhook', 'trigger', 'schedule', 'cron',
      'mysql', 'postgres', 'mariadb', 'mssql', 'sqlite', 'mongodb',
      'redis', 'elasticsearch', 'supabase', 'firebase', 'appwrite',
      'cloudflare', 'vercel', 'netlify', 'railway', 'heroku',
      'digitalocean', 'aws', 'azure', 'gcp',
    ]);

    for (const node of nodes) {
      if (!node || typeof node !== 'object') continue;
      const nodeType = (typeof node.type === 'string' ? node.type : '').toLowerCase();
      const nodeName = (typeof node.name === 'string' ? node.name : '').toLowerCase();

      if (!nodeType && !nodeName) continue;

      const allWords = [...nodeType.split(/[\s_/-]+/), ...nodeName.split(/[\s_/-]+/)]
        .map(w => w.trim())
        .filter(Boolean);

      const matchedProviders = new Set<string>();
      for (const word of allWords) {
        for (const kp of knownProviders) {
          if (word.includes(kp) || kp.includes(word)) {
            matchedProviders.add(kp);
          }
        }
      }

      for (const mp of matchedProviders) {
        if (!providerSet.has(mp)) {
          issues.push(
            `Node "${node.id ?? 'unknown'}" (${nodeType}) references integration "${mp}" which is not in the registered integrations list`
          );
        }
      }
    }

    return issues;
  }

  validateBusiness(
    employees?: Array<{ id: string; name: string; role?: string; department?: string }>,
    workflows?: Array<{ id: string; name: string; trigger?: string }>,
    integrations?: Array<{ id: string; name: string; provider: string }>,
  ): string[] {
    const issues: string[] = [];

    if (!employees || !workflows || !integrations) return issues;

    if (employees.length > 0 && workflows.length === 0) {
      issues.push('Employees are defined but no workflows exist to support them');
    }

    if (integrations.length > 0 && workflows.length === 0) {
      issues.push('Integrations are configured but no workflows use them');
    }

    const employeeDepartments = new Set(employees.map(e => e.department?.toLowerCase()).filter(Boolean));
    if (employeeDepartments.size > 1 && workflows.length < 2) {
      issues.push(`Multiple departments (${[...employeeDepartments].join(', ')}) but only ${workflows.length} workflow(s) defined`);
    }

    return issues;
  }

  protected normalizeName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  }

  checkDuplicate(
    collection: Array<{ id: string; name?: string; role?: string }>,
    newItem: { id: string; name?: string; role?: string },
  ): string[] {
    const issues: string[] = [];

    for (const existing of collection) {
      if (existing.id === newItem.id) continue;

      const existingName = this.normalizeName(existing.name ?? '');
      const newName = this.normalizeName(newItem.name ?? '');
      const existingRole = this.normalizeName(existing.role ?? '');
      const newRole = this.normalizeName(newItem.role ?? '');

      if (existingName && newName && existingName === newName) {
        issues.push(`Duplicate name detected: "${newItem.name}" conflicts with existing item "${existing.name}" (${existing.id})`);
      }

      if (existingRole && newRole && existingRole === newRole) {
        issues.push(`Duplicate role/trigger detected: "${newItem.role}" on "${newItem.name}" conflicts with "${existing.name}" (${existing.id})`);
      }
    }

    return issues;
  }

  validatePrompt(prompt: string): string[] {
    const issues: string[] = [];

    if (!prompt || prompt.trim().length === 0) {
      issues.push('Prompt content is empty');
      return issues;
    }

    const placeholderPattern = /\{\{[^}]*\}\}/g;
    const placeholders = prompt.match(placeholderPattern) ?? [];
    for (const ph of placeholders) {
      const inner = ph.replace('{{', '').replace('}}', '').trim();
      if (!inner) {
        issues.push(`Prompt contains empty placeholder: ${ph}`);
      }
    }

    const unresolvedPattern = /\{\{[\w.]*\}\}/;
    if (unresolvedPattern.test(prompt)) {
      const found = prompt.match(unresolvedPattern);
      if (found) {
        issues.push(`Prompt may contain unresolved placeholders like "${found[0]}"`);
      }
    }

    const formattingIssues: string[] = [];
    const lines = prompt.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.length > 2000) {
        formattingIssues.push(`Prompt line ${i + 1} exceeds 2000 characters (${line.length})`);
      }
    }
    if (formattingIssues.length > 0) {
      issues.push(...formattingIssues);
    }

    const codeBlockPattern = /```[\s\S]*?```/g;
    const codeBlocks = prompt.match(codeBlockPattern) ?? [];
    for (const block of codeBlocks) {
      if (!block.includes('\n')) {
        issues.push('Prompt contains a code block with empty content');
        break;
      }
    }

    const invalidChars = /[\x00-\x08\x0B\x0C\x0E-\x1F]/;
    if (invalidChars.test(prompt)) {
      issues.push('Prompt contains invalid control characters');
    }

    if (lines.length > 500) {
      issues.push(`Prompt is very long (${lines.length} lines), consider splitting for readability`);
    }

    return issues;
  }
}
