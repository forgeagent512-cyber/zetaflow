import { createHash } from 'node:crypto';
import { WorkflowAnalyzerService } from '../workflow-analyzer/workflow-analyzer.service.js';
import { InMemoryWorkflowAnalysisRepository } from '../workflow-analyzer/workflow-analyzer.repository.js';
import { SemanticSearchService } from '../shared/semantic-search.js';
import { TemplateIndexerService } from '../workflow-analyzer/template-indexer.service.js';
export class TemplateSearchService {
    repository;
    analyzerService;
    semanticSearch;
    indexerService;
    templateIndex = [];
    constructor(repository, analyzerService = new WorkflowAnalyzerService(new InMemoryWorkflowAnalysisRepository()), semanticSearch = new SemanticSearchService({ embed: async (text) => this.hashEmbed(text) }), indexerService = new TemplateIndexerService()) {
        this.repository = repository;
        this.analyzerService = analyzerService;
        this.semanticSearch = semanticSearch;
        this.indexerService = indexerService;
    }
    async search(input) {
        const templates = await this.loadTemplates();
        const scored = await this.scoreTemplates(input, templates);
        const matches = scored.map(s => ({
            template_id: s.template.id,
            template_name: s.template.template_name,
            similarity_score: s.score,
            decision: s.score >= 0.85 ? 'reuse' : s.score >= 0.6 ? 'merge' : 'generate',
            workflow_json: s.template.workflow_json,
            metadata: {
                business_purpose: s.template.business_goal,
                industry: s.template.industry,
                category: s.template.category,
                department: s.template.department,
                integrations: s.template.required_integrations,
                credentials: s.template.required_credentials,
                ai_providers: s.template.ai_providers,
                complexity: s.template.complexity_score,
                reusability: s.template.reusability_score,
                tags: s.template.tags,
            }
        }));
        return this.buildResponse(matches, input);
    }
    async loadTemplates() {
        if (this.templateIndex.length > 0)
            return this.templateIndex;
        try {
            const indexed = await this.indexerService.scanAndIndexAll();
            this.templateIndex = indexed.map(record => ({
                id: record.template_id,
                template_name: record.name,
                slug: createHash('md5').update(record.name).digest('hex').slice(0, 12),
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
                workflow_json: {},
                workflow_schema: {},
                embedding: record.embedding_vector,
                source: 'template-library'
            }));
        }
        catch {
            this.templateIndex = [];
        }
        return this.templateIndex;
    }
    async refreshIndex() {
        this.templateIndex = [];
        await this.loadTemplates();
    }
    async scoreTemplates(input, templates) {
        const queryText = [
            input.business_purpose,
            input.industry,
            input.category,
            ...(input.integrations ?? []),
            ...(input.tags ?? []),
            input.ai_provider,
        ].filter(Boolean).join(' ');
        const queryTokens = queryText.toLowerCase().split(/\s+/).filter(t => t.length > 2);
        return templates
            .map(template => {
            const templateText = [
                template.template_name,
                template.description,
                template.business_goal,
                ...template.tags,
                ...template.keywords,
                ...template.required_integrations,
                template.industry,
                template.category,
                template.department,
            ].filter(Boolean).join(' ').toLowerCase();
            let semanticScore = 0;
            if (queryTokens.length > 0) {
                const matches = queryTokens.filter(token => templateText.includes(token));
                semanticScore = matches.length / Math.max(queryTokens.length, 1);
            }
            const categoryBonus = input.category && template.category?.toLowerCase() === input.category.toLowerCase() ? 0.15 : 0;
            const industryBonus = input.industry && template.industry?.toLowerCase() === input.industry.toLowerCase() ? 0.15 : 0;
            const integrationBonus = input.integrations && input.integrations.length > 0
                ? input.integrations.filter(i => template.required_integrations.some(ti => ti.toLowerCase().includes(i.toLowerCase()))).length * 0.05
                : 0;
            const tagBonus = input.tags && input.tags.length > 0
                ? input.tags.filter(t => template.tags.some(tt => tt.toLowerCase().includes(t.toLowerCase()))).length * 0.05
                : 0;
            const score = Math.min(1, semanticScore * 0.5 + categoryBonus + industryBonus + integrationBonus + tagBonus);
            return { template, score };
        })
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
    }
    buildResponse(matches, input) {
        const topScore = matches.length > 0 ? matches[0].similarity_score : 0;
        const decision = topScore >= 0.85 ? 'reuse' : topScore >= 0.6 ? 'merge' : 'generate';
        let reason;
        if (decision === 'reuse') {
            reason = `Found high-similarity template "${matches[0].template_name}" (${(topScore * 100).toFixed(0)}% match). Reusing existing template is recommended.`;
        }
        else if (decision === 'merge') {
            const mergeNames = matches.filter(m => m.similarity_score >= 0.6).map(m => m.template_name).join(', ');
            reason = `Found ${matches.length} templates with moderate similarity. Merging "${mergeNames}" is recommended.`;
        }
        else {
            reason = `No template matches above threshold. Best match: ${(topScore * 100).toFixed(0)}%. Generating new workflow is recommended.`;
        }
        return { decision, matches, reason };
    }
    hashEmbed(text) {
        const hash = createHash('sha256').update(text).digest();
        const dimensions = 16;
        return Array.from({ length: dimensions }, (_, i) => {
            return (hash[i % hash.length] / 256) * 2 - 1;
        });
    }
}
