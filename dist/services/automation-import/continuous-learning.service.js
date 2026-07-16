import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { TemplateIndexerService } from '../../ai-factory/workflow-analyzer/template-indexer.service.js';
import { TemplateSearchService } from '../../ai-factory/workflow-generator/template-search.service.js';
import { WorkflowAnalyzerService } from '../../ai-factory/workflow-analyzer/workflow-analyzer.service.js';
import { InMemoryWorkflowAnalysisRepository } from '../../ai-factory/workflow-analyzer/workflow-analyzer.repository.js';
import { InMemoryWorkflowGeneratorRepository } from '../../ai-factory/workflow-generator/workflow-generator.repository.js';
export class ContinuousLearningService {
    templateLibraryRoot;
    knownFiles = new Map();
    indexer;
    templateSearch;
    analyzerService;
    constructor(templateLibraryRoot = path.resolve(process.cwd(), 'template-library', 'source')) {
        this.templateLibraryRoot = templateLibraryRoot;
        this.analyzerService = new WorkflowAnalyzerService(new InMemoryWorkflowAnalysisRepository());
        this.indexer = new TemplateIndexerService(this.analyzerService);
        this.templateSearch = new TemplateSearchService(new InMemoryWorkflowGeneratorRepository(), this.analyzerService);
    }
    async scanForChanges() {
        const startedAt = Date.now();
        const errors = [];
        let newFiles = 0;
        let updatedFiles = 0;
        try {
            await stat(this.templateLibraryRoot);
        }
        catch {
            return {
                filesScanned: 0,
                newFiles: 0,
                updatedFiles: 0,
                errors: ['Template library root does not exist'],
                indexedRecords: 0,
                duration: 0,
            };
        }
        const currentFiles = await this.findAllJsonFiles(this.templateLibraryRoot);
        const currentHashes = new Map();
        for (const filePath of currentFiles) {
            try {
                const content = await readFile(filePath, 'utf8');
                const hash = createHash('sha256').update(content).digest('hex');
                currentHashes.set(filePath, hash);
                const knownHash = this.knownFiles.get(filePath);
                if (!knownHash) {
                    newFiles++;
                }
                else if (knownHash !== hash) {
                    updatedFiles++;
                }
            }
            catch (error) {
                errors.push(`Error reading ${filePath}: ${error instanceof Error ? error.message : 'Unknown'}`);
            }
        }
        for (const [filePath, hash] of currentHashes) {
            this.knownFiles.set(filePath, hash);
        }
        for (const [filePath] of this.knownFiles) {
            if (!currentHashes.has(filePath)) {
                this.knownFiles.delete(filePath);
            }
        }
        let indexedRecords = 0;
        if (newFiles > 0 || updatedFiles > 0) {
            try {
                const records = await this.indexer.scanAndIndexAll();
                indexedRecords = records.length;
                await this.templateSearch.refreshIndex();
            }
            catch (error) {
                errors.push(`Indexing failed: ${error instanceof Error ? error.message : 'Unknown'}`);
            }
        }
        return {
            filesScanned: currentFiles.length,
            newFiles,
            updatedFiles,
            errors,
            indexedRecords,
            duration: Date.now() - startedAt,
        };
    }
    async detectNewFiles() {
        const events = [];
        const timestamp = new Date().toISOString();
        try {
            await stat(this.templateLibraryRoot);
        }
        catch {
            return events;
        }
        const currentFiles = await this.findAllJsonFiles(this.templateLibraryRoot);
        const currentPaths = new Set(currentFiles);
        for (const filePath of currentPaths) {
            if (!this.knownFiles.has(filePath)) {
                events.push({
                    filePath,
                    fileName: path.basename(filePath),
                    action: 'added',
                    timestamp,
                });
            }
        }
        for (const [filePath] of this.knownFiles) {
            if (!currentPaths.has(filePath)) {
                events.push({
                    filePath,
                    fileName: path.basename(filePath),
                    action: 'removed',
                    timestamp,
                });
            }
        }
        if (events.length > 0) {
            await this.scanForChanges();
        }
        return events;
    }
    async analyzeSingleTemplate(filePath) {
        try {
            const content = await readFile(filePath, 'utf8');
            const workflow = JSON.parse(content);
            const analysis = await this.analyzerService.analyze({
                workflow_json: workflow,
                workflow_id: path.basename(filePath, '.json'),
            });
            return {
                workflow,
                analysis: analysis.analysis,
                embedding: analysis.embedding,
                metadata: {
                    source_file: filePath,
                    analyzed_at: new Date().toISOString(),
                },
            };
        }
        catch (error) {
            return null;
        }
    }
    getStats() {
        return {
            totalTracked: this.knownFiles.size,
            lastScan: new Date().toISOString(),
        };
    }
    async findAllJsonFiles(root) {
        const results = [];
        async function walk(dir) {
            const entries = await readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    await walk(fullPath);
                }
                else if (entry.isFile() && entry.name.endsWith('.json')) {
                    results.push(fullPath);
                }
            }
        }
        await walk(root);
        return results.sort();
    }
}
export async function createContinuousLearningService() {
    return new ContinuousLearningService();
}
