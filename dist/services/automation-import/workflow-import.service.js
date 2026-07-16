import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
export class WorkflowImportService {
    supabase;
    workflowsRoot;
    constructor(supabase, workflowsRoot = path.resolve(process.cwd(), 'workflows')) {
        this.supabase = supabase;
        this.workflowsRoot = workflowsRoot;
    }
    async importAll() {
        const summary = { imported: 0, updated: 0, skipped: 0, failed: 0 };
        const files = await this.findWorkflowFiles(this.workflowsRoot);
        for (const file of files) {
            const startedAt = Date.now();
            try {
                const result = await this.importFile(file);
                if (result.status === 'imported')
                    summary.imported += 1;
                if (result.status === 'updated')
                    summary.updated += 1;
                if (result.status === 'skipped')
                    summary.skipped += 1;
                if (result.status === 'failed')
                    summary.failed += 1;
                await this.logImport(file, result.status, result.error, Date.now() - startedAt);
            }
            catch (error) {
                summary.failed += 1;
                await this.logImport(file, 'failed', error instanceof Error ? error.message : 'Unknown error', Date.now() - startedAt);
            }
        }
        return summary;
    }
    async findWorkflowFiles(root) {
        const results = [];
        const entries = await readdir(root, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(root, entry.name);
            if (entry.isDirectory()) {
                results.push(...await this.findWorkflowFiles(fullPath));
            }
            else if (entry.isFile() && entry.name.endsWith('.json')) {
                results.push(fullPath);
            }
        }
        return results.sort();
    }
    async importFile(filePath) {
        const content = await readFile(filePath, 'utf8');
        let workflow;
        try {
            workflow = JSON.parse(content);
        }
        catch {
            return { status: 'skipped', error: 'Invalid JSON' };
        }
        const metadata = extractWorkflowMetadata(workflow, path.basename(filePath));
        const hash = createHash('sha256').update(content).digest('hex');
        const existing = await this.findExistingTemplate(metadata.slug);
        if (existing) {
            const latestVersion = await this.findLatestVersion(existing.id);
            const currentHash = latestVersion?.workflow_json?.hash;
            if (currentHash === hash) {
                return { status: 'skipped', error: 'Duplicate content' };
            }
            await this.upsertTemplate(existing.id, metadata, hash);
            await this.createTemplateVersion(existing.id, metadata, hash);
            return { status: 'updated' };
        }
        await this.insertTemplate(metadata, hash);
        return { status: 'imported' };
    }
    async findExistingTemplate(slug) {
        const { data, error } = await this.supabase
            .from('automation_templates')
            .select('id, slug')
            .eq('slug', slug)
            .maybeSingle();
        if (error)
            throw error;
        return data;
    }
    async findLatestVersion(templateId) {
        const { data, error } = await this.supabase
            .from('template_versions')
            .select('workflow_json, version')
            .eq('template_id', templateId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (error)
            throw error;
        return data;
    }
    async insertTemplate(metadata, hash) {
        const payload = {
            template_name: metadata.templateName,
            slug: metadata.slug,
            description: metadata.description,
            workflow_json: metadata.workflowJson,
            workflow_schema: metadata.workflowSchema,
            industry_module: this.inferIndustry(metadata),
            workflow_type: metadata.triggerType,
            version: metadata.version,
            status: 'active',
            visibility: 'marketplace',
            tags: metadata.tags,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            workflow_hash: hash
        };
        const { error } = await this.supabase.from('automation_templates').insert(payload);
        if (error)
            throw error;
        const { data: inserted } = await this.supabase
            .from('automation_templates')
            .select('id')
            .eq('slug', metadata.slug)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (!inserted?.id)
            throw new Error('Could not retrieve inserted template id');
        await this.createTemplateVersion(inserted.id, metadata, hash);
    }
    async upsertTemplate(templateId, metadata, hash) {
        const payload = {
            template_name: metadata.templateName,
            slug: metadata.slug,
            description: metadata.description,
            workflow_json: metadata.workflowJson,
            workflow_schema: metadata.workflowSchema,
            industry_module: this.inferIndustry(metadata),
            workflow_type: metadata.triggerType,
            version: metadata.version,
            status: 'active',
            visibility: 'marketplace',
            tags: metadata.tags,
            updated_at: new Date().toISOString(),
            workflow_hash: hash
        };
        const { error } = await this.supabase.from('automation_templates').update(payload).eq('id', templateId);
        if (error)
            throw error;
    }
    async createTemplateVersion(templateId, metadata, hash) {
        const payload = {
            template_id: templateId,
            version: metadata.version,
            workflow_json: {
                hash,
                workflow: metadata.workflowJson
            },
            changelog: 'Imported from workflow file',
            created_at: new Date().toISOString()
        };
        const { error } = await this.supabase.from('template_versions').insert(payload);
        if (error)
            throw error;
    }
    async logImport(filename, status, error, duration) {
        const payload = {
            filename,
            status,
            error,
            duration,
            created_at: new Date().toISOString()
        };
        const { error: logError } = await this.supabase.from('workflow_import_logs').insert(payload);
        if (logError) {
            // Non-blocking log failure
            console.warn('Workflow import log write failed', logError.message);
        }
    }
    inferIndustry(metadata) {
        const combined = `${metadata.templateName} ${metadata.description} ${metadata.tags.join(' ')}`.toLowerCase();
        if (combined.includes('lead') || combined.includes('sales') || combined.includes('crm'))
            return 'sales';
        if (combined.includes('support'))
            return 'customer-support';
        if (combined.includes('knowledge'))
            return 'knowledge-base';
        return 'operations';
    }
}
export function slugify(value) {
    return value
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}
export function inferTriggerType(nodes) {
    const triggerNode = nodes.find((node) => typeof node.type === 'string' && node.type.includes('webhook'));
    if (triggerNode)
        return 'webhook';
    const scheduleTrigger = nodes.find((node) => typeof node.type === 'string' && node.type.includes('scheduleTrigger'));
    if (scheduleTrigger)
        return 'schedule';
    return 'unknown';
}
export function extractWorkflowMetadata(workflow, sourceFile) {
    const name = typeof workflow.name === 'string' && workflow.name.trim() ? workflow.name : path.basename(sourceFile, '.json');
    const nodes = Array.isArray(workflow.nodes) ? workflow.nodes : [];
    const meta = workflow.meta ?? {};
    const description = typeof meta.description === 'string' ? meta.description : '';
    const tags = Array.isArray(meta.tags)
        ? meta.tags.filter((tag) => typeof tag === 'string')
        : [];
    return {
        templateName: name,
        slug: slugify(name),
        description,
        triggerType: inferTriggerType(nodes),
        nodeCount: nodes.length,
        tags,
        version: '1.0',
        workflowJson: workflow,
        workflowSchema: {
            sourceFile,
            nodes: nodes.length,
            triggerType: inferTriggerType(nodes)
        },
        sourceFile
    };
}
export function resolveWorkflowRoot() {
    const explicitPath = process.env.WORKFLOWS_ROOT;
    if (explicitPath)
        return path.resolve(explicitPath);
    return path.resolve(process.cwd(), 'workflows');
}
export async function createWorkflowImportService(supabase) {
    return new WorkflowImportService(supabase, resolveWorkflowRoot());
}
