import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { AiRouter } from '../ai-provider/ai-router.js';
import type { SupabaseTemplateRecord } from '../../ai-factory/workflow-generator/template-search.service.js';
import { WorkflowAnalyzerService } from '../../ai-factory/workflow-analyzer/workflow-analyzer.service.js';
import { InMemoryWorkflowAnalysisRepository } from '../../ai-factory/workflow-analyzer/workflow-analyzer.repository.js';

export interface EnrichedTemplateMetadata {
  templateId: string;
  industry: string;
  category: string;
  department: string;
  businessGoal: string;
  tags: string[];
  keywords: string[];
  complexityScore: number;
  reusabilityScore: number;
  aiScore: number;
  requiredIntegrations: string[];
  requiredCredentials: string[];
  aiProviders: string[];
  embedding: number[];
  summary: string;
}

export class TemplateEnricherService {
  private router = new AiRouter();
  private analyzer: WorkflowAnalyzerService;

  constructor() {
    this.analyzer = new WorkflowAnalyzerService(new InMemoryWorkflowAnalysisRepository());
  }

  async enrichTemplate(filePath: string): Promise<EnrichedTemplateMetadata | null> {
    try {
      const content = await readFile(filePath, 'utf8');
      const workflow = JSON.parse(content) as Record<string, unknown>;
      const fileName = path.basename(filePath, '.json');

      const analysis = await this.analyzer.analyze({
        workflow_json: workflow,
        workflow_id: fileName,
      });

      const workflowName = analysis.analysis.workflow_name;
      const nodesText = (Array.isArray(workflow.nodes) ? workflow.nodes : [])
        .map((n: Record<string, unknown>) => `${n.name ?? ''} ${n.type ?? ''}`).join(' ');

      const combinedText = `${workflowName} ${analysis.analysis.business_purpose} ${analysis.analysis.human_readable_description} ${nodesText}`;

      const industry = await this.detectIndustry(combinedText, analysis.analysis.industry);
      const category = await this.detectCategory(combinedText, analysis.analysis.category);
      const { tags, keywords } = this.extractTagsAndKeywords(combinedText, analysis.analysis.search_tags, analysis.analysis.keywords);

      return {
        templateId: fileName,
        industry,
        category,
        department: analysis.analysis.trigger_type === 'webhook' ? 'Operations' : 'General',
        businessGoal: analysis.analysis.business_purpose,
        tags,
        keywords,
        complexityScore: analysis.analysis.complexity_score / 100,
        reusabilityScore: analysis.analysis.reusability_score / 100,
        aiScore: analysis.analysis.automation_score / 100,
        requiredIntegrations: analysis.analysis.required_integrations,
        requiredCredentials: analysis.analysis.credentials_required,
        aiProviders: analysis.analysis.ai_providers_used,
        embedding: analysis.embedding,
        summary: analysis.analysis.human_readable_description,
      };
    } catch {
      return null;
    }
  }

  private async detectIndustry(text: string, fallback: string): Promise<string> {
    const industries = ['Real Estate', 'Healthcare', 'Legal', 'Restaurant', 'Construction', 'Accounting', 'Finance', 'Education', 'Travel', 'Insurance', 'Logistics', 'Manufacturing', 'E-commerce', 'Marketing', 'HR', 'General Business'];

    for (const ind of industries) {
      if (text.toLowerCase().includes(ind.toLowerCase())) return ind;
    }

    if (/(property|house|apartment|rent|lease|mortgage|realtor|listing)/i.test(text)) return 'Real Estate';
    if (/(patient|clinic|doctor|hospital|medical|health)/i.test(text)) return 'Healthcare';
    if (/(lawyer|court|legal|attorney|lawsuit)/i.test(text)) return 'Legal';
    if (/(restaurant|menu|order|food|kitchen|dining)/i.test(text)) return 'Restaurant';
    if (/(course|student|teacher|classroom|school|education|learning)/i.test(text)) return 'Education';
    if (/(invoice|accounting|bookkeep|tax|audit|finance)/i.test(text)) return 'Accounting';
    if (/(ship|delivery|warehouse|inventory|logistics|transport)/i.test(text)) return 'Logistics';
    if (/(shop|product|cart|checkout|store|ecommerce|e-commerce)/i.test(text)) return 'E-commerce';

    return fallback || 'General Business';
  }

  private async detectCategory(text: string, fallback: string): Promise<string> {
    if (/(lead|qualify|score|capture)/i.test(text)) return 'Lead Qualification';
    if (/(support|ticket|help|faq|question)/i.test(text)) return 'Customer Support';
    if (/(booking|appointment|schedule|calendar)/i.test(text)) return 'Appointment Booking';
    if (/(email|mail|newsletter|campaign)/i.test(text)) return 'Email Automation';
    if (/(crm|pipeline|deal|contact|account)/i.test(text)) return 'CRM';
    if (/(invoice|payment|billing|receipt|refund)/i.test(text)) return 'Finance';
    if (/(social|post|content|blog|media)/i.test(text)) return 'Marketing';
    if (/(chat|conversation|messag|whatsapp|telegram)/i.test(text)) return 'Messaging';
    if (/(hr|employee|hiring|onboard|payroll)/i.test(text)) return 'HR';
    if (/(ai|intelligent|gpt|llm|model|predict)/i.test(text)) return 'AI Automation';

    return fallback || 'Operations';
  }

  private extractTagsAndKeywords(text: string, existingTags: string[], existingKeywords: string[]): { tags: string[]; keywords: string[] } {
    const all = [...existingTags, ...existingKeywords];

    const integrations = ['webhook', 'http', 'email', 'sms', 'whatsapp', 'telegram', 'slack', 'discord', 'crm',
      'hubspot', 'salesforce', 'stripe', 'payment', 'calendar', 'google', 'openai', 'gemini', 'claude',
    ];

    const foundTags = new Set<string>();
    for (const integration of integrations) {
      if (text.toLowerCase().includes(integration)) {
        foundTags.add(integration);
      }
    }

    const tags = [...new Set([...all.filter(t => t.length > 2), ...foundTags])].slice(0, 10);
    const keywords = [...new Set([...all, ...text.toLowerCase().split(/\s+/).filter(w => w.length > 4)])].slice(0, 20);

    return { tags, keywords };
  }
}
