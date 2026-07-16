import { InMemoryRepository } from '../shared/repositories.js';
import { randomUUID } from 'node:crypto';
export class InMemorySolutionArchitectureRepository extends InMemoryRepository {
    async findByBusinessAnalysisId(businessAnalysisId) {
        return [];
    }
}
export class SolutionArchitectService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async design(request) {
        const now = new Date().toISOString();
        const modules = this.designModules(request);
        const integrationPoints = this.designIntegrations(request);
        const recommendedEmployees = this.recommendEmployees(request);
        const recommendedAgents = this.recommendAgents(request);
        const recommendedWorkflows = this.recommendWorkflows(request);
        const dataFlowDiagram = this.buildDataFlow(request);
        const securityZones = this.buildSecurityZones(request);
        const architecture = {
            id: randomUUID(),
            organizationId: request.organizationId,
            businessAnalysisId: request.businessAnalysisId,
            architectureSummary: this.buildSummary(request, modules, integrationPoints),
            modules,
            integrationPoints,
            recommendedEmployees,
            recommendedAgents,
            recommendedWorkflows,
            dataFlowDiagram,
            securityZones,
            createdAt: now,
            updatedAt: now,
            createdBy: request.requestedBy,
        };
        await this.repository.save(architecture);
        return {
            id: architecture.id,
            status: 'completed',
            createdAt: now,
            updatedAt: now,
            architecture,
        };
    }
    buildSummary(request, modules, integrations) {
        const industry = request.industry ?? 'General Business';
        const type = request.automationType ?? 'Operations';
        return `Solution architecture for ${industry} ${type} automation. ` +
            `Includes ${modules.length} modules with ${integrations.length} integration points. ` +
            `Designed for ${request.businessType ?? 'standard'} deployment model.`;
    }
    designModules(request) {
        const modules = [];
        const type = request.automationType ?? 'Operations';
        const reqs = request.requirements;
        switch (type.toLowerCase()) {
            case 'sales':
                modules.push('Lead Capture & Qualification', 'CRM Integration', 'Follow-up Automation', 'Pipeline Management');
                break;
            case 'support':
                modules.push('Ticket Intake', 'Knowledge Base Search', 'Escalation Management', 'SLA Tracking');
                break;
            case 'marketing':
                modules.push('Campaign Management', 'Email Automation', 'Social Media Scheduling', 'Analytics & Reporting');
                break;
            default:
                modules.push('Workflow Automation', 'Notification Service', 'Data Sync', 'Reporting Dashboard');
        }
        if (reqs.some(r => r.toLowerCase().includes('ai') || r.toLowerCase().includes('intelligent'))) {
            modules.push('AI Agent Integration', 'Smart Routing');
        }
        if (reqs.some(r => r.toLowerCase().includes('chat') || r.toLowerCase().includes('conversation'))) {
            modules.push('Chat Interface', 'Conversation Memory');
        }
        return modules;
    }
    designIntegrations(request) {
        const integrations = [];
        const reqs = request.requirements;
        const integrationMap = {
            crm: ['Salesforce API', 'HubSpot API', 'Pipedrive API'],
            email: ['SMTP Service', 'SendGrid API', 'Mailchimp API'],
            calendar: ['Google Calendar API', 'Calendly API'],
            payment: ['Stripe API', 'PayPal API'],
            messaging: ['Twilio API', 'Slack API', 'Telegram API'],
            storage: ['Supabase Storage', 'AWS S3'],
            ai: ['OpenAI API', 'Gemini API', 'OpenRouter API'],
        };
        for (const [key, apis] of Object.entries(integrationMap)) {
            if (reqs.some(r => r.toLowerCase().includes(key))) {
                integrations.push(...apis);
            }
        }
        if (integrations.length === 0) {
            integrations.push('REST API Gateway', 'Webhook Handler', 'Database Connector');
        }
        return [...new Set(integrations)];
    }
    recommendEmployees(request) {
        const type = request.automationType ?? 'Operations';
        switch (type.toLowerCase()) {
            case 'sales': return ['Sales Development Rep', 'Lead Qualification Specialist', 'Account Executive'];
            case 'support': return ['Support Agent', 'Knowledge Base Manager', 'Escalation Specialist'];
            case 'marketing': return ['Marketing Coordinator', 'Campaign Manager', 'Content Strategist'];
            default: return ['Operations Manager', 'Automation Specialist'];
        }
    }
    recommendAgents(request) {
        const type = request.automationType ?? 'Operations';
        switch (type.toLowerCase()) {
            case 'sales': return ['Lead Qualifier', 'Follow-up Agent', 'Calendar Booker'];
            case 'support': return ['Ticket Router', 'Knowledge Retriever', 'SLA Monitor'];
            case 'marketing': return ['Content Publisher', 'Analytics Reporter', 'Campaign Optimizer'];
            default: return ['Workflow Executor', 'Notification Agent'];
        }
    }
    recommendWorkflows(request) {
        const type = request.automationType ?? 'Operations';
        switch (type.toLowerCase()) {
            case 'sales': return ['Lead Capture Workflow', 'Lead Scoring Workflow', 'Follow-up Sequence', 'Deal Pipeline Sync'];
            case 'support': return ['Ticket Intake Workflow', 'Auto-Reply Workflow', 'Escalation Workflow'];
            case 'marketing': return ['Campaign Launch Workflow', 'Lead Nurture Sequence', 'Analytics Report'];
            default: return ['Notification Workflow', 'Data Sync Workflow'];
        }
    }
    buildDataFlow(request) {
        const flows = [];
        flows.push('External Trigger -> n8n Webhook -> Workflow Engine');
        flows.push('Workflow Engine -> AI Provider -> Decision Logic');
        flows.push('Decision Logic -> Integration Layer -> External Services');
        flows.push('All Layers -> Logging & Monitoring -> Audit Trail');
        if (request.requirements.some(r => r.toLowerCase().includes('realtime') || r.toLowerCase().includes('stream'))) {
            flows.push('WebSocket -> Event Stream -> Real-time Processing');
        }
        return flows;
    }
    buildSecurityZones(request) {
        const zones = [
            'Zone 1: Public (Webhooks, User-facing APIs)',
            'Zone 2: Application (Workflow Engine, AI Services)',
            'Zone 3: Data (Databases, File Storage)',
        ];
        if (request.requirements.some(r => r.toLowerCase().includes('payment') || r.toLowerCase().includes('pii'))) {
            zones.push('Zone 4: Sensitive (Payment Processing, PII Storage)');
        }
        return zones;
    }
}
