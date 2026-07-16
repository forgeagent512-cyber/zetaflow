import { createHash, randomUUID } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import type { WorkflowAnalyzerService } from './workflow-analyzer.service.js';
import type { WorkflowAnalyzerAnalysisDto } from './workflow-analyzer.dto.js';
import { extractWorkflowMetadata, slugify } from '../../services/automation-import/workflow-import.service.js';
import { InMemoryWorkflowAnalysisRepository } from './workflow-analyzer.repository.js';
import { EmbeddingService } from './embedding-service.js';

export interface TemplateIndexRecord {
  template_id: string;
  name: string;
  description: string;
  category: string;
  industry: string;
  department: string;
  business_goal: string;
  trigger: string;
  actions: string[];
  required_integrations: string[];
  required_credentials: string[];
  ai_provider: string[];
  tags: string[];
  keywords: string[];
  complexity: number;
  reusability_score: number;
  estimated_setup_time: number;
  estimated_business_value: string;
  source_file: string;
  embedding_vector: number[];
}

export interface AutomationTemplateRow {
  template_name: string;
  slug: string;
  description: string;
  category: string;
  industry: string;
  department: string;
  business_goal: string;
  trigger_type: string;
  actions: string[];
  required_integrations: string[];
  required_credentials: string[];
  ai_providers: string[];
  tags: string[];
  keywords: string[];
  complexity_score: number;
  reusability_score: number;
  estimated_setup_time_minutes: number;
  estimated_business_value: string;
  source_file: string;
  status: string;
  visibility: string;
}

export interface TemplateVersionRow {
  template_id: string;
  version: string;
  workflow_json: Record<string, unknown>;
  changelog: string;
}

export interface WorkflowAnalysisRow {
  template_id: string;
  analysis: WorkflowAnalyzerAnalysisDto;
  metadata: Record<string, unknown>;
}

export interface WorkflowEmbeddingRow {
  template_id: string;
  embedding_vector: number[];
  model: string;
}

export class TemplateIndexerService {
  private readonly templateLibraryRoot: string;
  private readonly embeddingService: EmbeddingService;
  private readonly repository: InMemoryWorkflowAnalysisRepository;

  constructor(
    private readonly analyzerService?: WorkflowAnalyzerService
  ) {
    this.templateLibraryRoot = path.resolve(process.cwd(), 'template-library', 'source');
    this.embeddingService = new EmbeddingService();
    this.repository = new InMemoryWorkflowAnalysisRepository();
  }

  async scanAndIndexAll(): Promise<TemplateIndexRecord[]> {
    const files = await this.findTemplateFiles(this.templateLibraryRoot);
    const records: TemplateIndexRecord[] = [];

    for (const file of files) {
      try {
        const record = await this.indexTemplate(file);
        records.push(record);
      } catch (error) {
        console.warn(`[TemplateIndexer] Skipping ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return records;
  }

  async indexTemplate(filePath: string): Promise<TemplateIndexRecord> {
    const content = await readFile(filePath, 'utf8');
    const workflow = JSON.parse(content) as Record<string, unknown>;
    const sourceFileName = path.basename(filePath);

    const metadata = extractWorkflowMetadata(workflow, sourceFileName);

    const analysis = await this.analyzeWorkflow(workflow, metadata.slug);

    const embedding = await this.embeddingService.generate(workflow);

    const templateId = randomUUID();

    return {
      template_id: templateId,
      name: metadata.templateName,
      description: metadata.description,
      category: analysis.category,
      industry: this.inferIndustry(metadata, analysis),
      department: this.inferDepartment(analysis.industry, analysis.category),
      business_goal: analysis.business_purpose,
      trigger: analysis.trigger_type,
      actions: analysis.action_nodes,
      required_integrations: analysis.required_integrations,
      required_credentials: analysis.credentials_required,
      ai_provider: analysis.ai_providers_used,
      tags: analysis.search_tags,
      keywords: analysis.keywords,
      complexity: analysis.complexity_score,
      reusability_score: analysis.reusability_score,
      estimated_setup_time: this.estimateSetupTime(analysis.complexity_score),
      estimated_business_value: this.estimateBusinessValue(analysis.automation_score),
      source_file: sourceFileName,
      embedding_vector: embedding
    };
  }

  async searchSimilar(businessPurpose: string, industry: string, topK: number = 5): Promise<TemplateIndexRecord[]> {
    const allRecords = await this.scanAndIndexAll();

    const purposeTokens = businessPurpose
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 2);

    if (purposeTokens.length === 0) {
      return allRecords.slice(0, topK);
    }

    const scored = allRecords
      .filter((record) => {
        if (!industry) return true;
        return record.industry.toLowerCase() === industry.toLowerCase();
      })
      .map((record) => {
        const recordText = [
          record.name,
          record.description,
          record.business_goal,
          ...record.tags,
          ...record.keywords,
          ...record.actions
        ].join(' ').toLowerCase();

        const matchScore = purposeTokens.reduce((score, token) => {
          return score + (recordText.includes(token) ? 1 : 0);
        }, 0);

        return { record, score: matchScore / purposeTokens.length };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return scored.map((s) => s.record);
  }

  toAutomationTemplateRow(record: TemplateIndexRecord): AutomationTemplateRow {
    return {
      template_name: record.name,
      slug: slugify(record.name),
      description: record.description,
      category: record.category,
      industry: record.industry,
      department: record.department,
      business_goal: record.business_goal,
      trigger_type: record.trigger,
      actions: record.actions,
      required_integrations: record.required_integrations,
      required_credentials: record.required_credentials,
      ai_providers: record.ai_provider,
      tags: record.tags,
      keywords: record.keywords,
      complexity_score: record.complexity,
      reusability_score: record.reusability_score,
      estimated_setup_time_minutes: record.estimated_setup_time,
      estimated_business_value: record.estimated_business_value,
      source_file: record.source_file,
      status: 'active',
      visibility: 'marketplace'
    };
  }

  toTemplateVersionRow(templateId: string, workflowJson: Record<string, unknown>): TemplateVersionRow {
    return {
      template_id: templateId,
      version: '1.0',
      workflow_json: workflowJson,
      changelog: 'Indexed from template library source'
    };
  }

  toWorkflowAnalysisRow(templateId: string, analysis: WorkflowAnalyzerAnalysisDto): WorkflowAnalysisRow {
    return {
      template_id: templateId,
      analysis,
      metadata: {
        source: 'template-library',
        indexed_at: new Date().toISOString()
      }
    };
  }

  toWorkflowEmbeddingRow(templateId: string, embeddingVector: number[]): WorkflowEmbeddingRow {
    return {
      template_id: templateId,
      embedding_vector: embeddingVector,
      model: 'hash-16d-v1'
    };
  }

  private async findTemplateFiles(root: string): Promise<string[]> {
    const results: string[] = [];
    const entries = await readdir(root, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(root, entry.name);
      if (entry.isDirectory()) {
        results.push(...await this.findTemplateFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        results.push(fullPath);
      }
    }

    return results.sort();
  }

  private async analyzeWorkflow(
    workflow: Record<string, unknown>,
    workflowId: string
  ): Promise<WorkflowAnalyzerAnalysisDto> {
    if (this.analyzerService) {
      const result = await this.analyzerService.analyze({
        workflow_json: workflow,
        workflow_id: workflowId
      });
      return result.analysis;
    }

    return this.fallbackAnalysis(workflow, workflowId);
  }

  private fallbackAnalysis(
    workflow: Record<string, unknown>,
    workflowId: string
  ): WorkflowAnalyzerAnalysisDto {
    const nodes = Array.isArray(workflow.nodes) ? workflow.nodes as Record<string, unknown>[] : [];
    const name = typeof workflow.name === 'string' && workflow.name.trim() ? workflow.name.trim() : workflowId;

    const triggerNodes = nodes
      .filter((n) => /trigger|webhook/i.test(typeof n.type === 'string' ? n.type : ''))
      .map((n) => typeof n.name === 'string' ? n.name : 'Unnamed Trigger');

    const aiNodes = nodes
      .filter((n) => /openai|ai|gpt|gemini|claude|llm|chat/i.test(`${n.type ?? ''} ${n.name ?? ''}`))
      .map((n) => typeof n.name === 'string' ? n.name : 'Unnamed AI Node');

    const actionNodes = nodes
      .filter((n) => {
        const type = typeof n.type === 'string' ? n.type : '';
        const text = `${type} ${n.name ?? ''}`;
        return !/trigger|webhook/i.test(type) && !/openai|ai|gpt|gemini|claude|llm|chat/i.test(text);
      })
      .map((n) => typeof n.name === 'string' ? n.name : 'Unnamed Action');

    const integrationTokens = new Set<string>();
    const nodeTypes = new Set<string>();

    for (const node of nodes) {
      const type = typeof node.type === 'string' ? node.type : '';
      nodeTypes.add(type);

      const text = `${type} ${node.name ?? ''}`.toLowerCase();
      for (const token of text.split(/[^a-z0-9]+/)) {
        if (token.length > 2 && !/^(n8n|node|webhook|trigger|http|api|json|auto|action|name|type|id|main|data)$/i.test(token)) {
          integrationTokens.add(token);
        }
      }
    }

    const category = aiNodes.length > 0 ? 'AI Automation' : triggerNodes.length > 0 ? 'Workflow Automation' : 'Operations';
    const useCase = name.toLowerCase().includes('lead') ? 'Lead Management' : name.toLowerCase().includes('support') ? 'Customer Support' : 'Business Automation';
    const industry = name.toLowerCase().includes('real estate') ? 'Real Estate' : name.toLowerCase().includes('crm') || name.toLowerCase().includes('sales') ? 'Sales' : 'General Business';
    const triggerType = triggerNodes.length > 0 ? 'webhook' : 'manual';

    return {
      workflow_name: name,
      business_purpose: `${name} automates operational work.`,
      business_summary: `Automates ${name.toLowerCase()} using ${[...integrationTokens].join(', ') || 'standard automation'}.`,
      industry,
      category,
      use_case: useCase,
      trigger_type: triggerType,
      trigger_nodes: triggerNodes,
      action_nodes: actionNodes,
      ai_nodes: aiNodes,
      total_node_count: nodes.length,
      credentials_required: [],
      required_integrations: [...integrationTokens],
      integrations_used: [...integrationTokens],
      external_apis: /http|api|webhook/i.test(JSON.stringify(nodes)) ? ['HTTP API'] : [],
      saas_products_used: [],
      ai_providers_used: [],
      required_connections: [],
      node_types: [...nodeTypes],
      categories: [category, useCase],
      estimated_cost: nodes.length * 5 + aiNodes.length * 20,
      complexity_score: Math.min(100, 20 + nodes.length * 8 + aiNodes.length * 10),
      automation_score: Math.min(100, 40 + nodes.length * 6 + aiNodes.length * 4),
      reusability_score: Math.min(100, 50 + integrationTokens.size * 4 + aiNodes.length * 2),
      suitable_industries: [industry, 'General Business'],
      required_environment_variables: [],
      required_secrets: [],
      human_readable_description: `${name} orchestrates ${triggerNodes.length > 0 ? 'event-driven' : 'manual'} automation with ${aiNodes.length > 0 ? 'AI assistance' : 'rule-based processing'}.`,
      search_tags: [name.toLowerCase(), ...integrationTokens, 'automation', 'workflow'],
      keywords: [name, ...integrationTokens, 'automation', 'n8n']
    };
  }

  private inferIndustry(
    metadata: { templateName: string; description: string; tags: string[] },
    analysis: WorkflowAnalyzerAnalysisDto
  ): string {
    if (analysis.industry && analysis.industry !== 'General Business') {
      return analysis.industry;
    }

    const combined = `${metadata.templateName} ${metadata.description} ${metadata.tags.join(' ')}`.toLowerCase();
    if (combined.includes('real estate')) return 'Real Estate';
    if (combined.includes('lead') || combined.includes('crm') || combined.includes('sales')) return 'Sales';
    if (combined.includes('support')) return 'Customer Support';
    if (combined.includes('finance') || combined.includes('account')) return 'Finance';
    if (combined.includes('hr') || combined.includes('recruit')) return 'HR';

    return 'Operations';
  }

  private inferDepartment(industry: string, category: string): string {
    const deptMap: Record<string, string> = {
      'Real Estate': 'Real Estate',
      'Sales': 'Sales',
      'Marketing': 'Marketing',
      'Customer Support': 'Support',
      'Finance': 'Finance',
      'HR': 'HR',
      'Operations': 'Operations',
      'AI Automation': 'Engineering'
    };

    return deptMap[industry] ?? deptMap[category] ?? 'Operations';
  }

  private estimateSetupTime(complexity: number): number {
    if (complexity < 30) return 15;
    if (complexity < 50) return 30;
    if (complexity < 70) return 60;
    return 120;
  }

  private estimateBusinessValue(automationScore: number): string {
    if (automationScore >= 80) return 'High';
    if (automationScore >= 50) return 'Medium';
    return 'Low';
  }
}
