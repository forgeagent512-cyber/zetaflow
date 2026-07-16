import { randomUUID } from 'node:crypto';
import { DeploymentLogger } from './deployment-logger.js';
import { DeploymentValidator } from './deployment-validator.js';
import { N8NDeploymentService } from './n8n-deployment-service.js';
import { SupabaseDeploymentService } from './supabase-deployment-service.js';
import { WorkspaceDeploymentService } from './workspace-deployment-service.js';
import { MarketplaceDeploymentService } from './marketplace-deployment-service.js';
import { RollbackService } from './rollback-service.js';
import { validateDeploymentManagerInput } from './deployment-manager.validation.js';
export class DeploymentManagerService {
    repository;
    logger;
    validator;
    n8NDeploymentService;
    supabaseDeploymentService;
    workspaceDeploymentService;
    marketplaceDeploymentService;
    rollbackService;
    constructor(repository, logger = new DeploymentLogger(), validator = new DeploymentValidator(), n8NDeploymentService = new N8NDeploymentService(), supabaseDeploymentService = new SupabaseDeploymentService(), workspaceDeploymentService = new WorkspaceDeploymentService(), marketplaceDeploymentService = new MarketplaceDeploymentService(), rollbackService = new RollbackService()) {
        this.repository = repository;
        this.logger = logger;
        this.validator = validator;
        this.n8NDeploymentService = n8NDeploymentService;
        this.supabaseDeploymentService = supabaseDeploymentService;
        this.workspaceDeploymentService = workspaceDeploymentService;
        this.marketplaceDeploymentService = marketplaceDeploymentService;
        this.rollbackService = rollbackService;
    }
    async deploy(input) {
        const validated = validateDeploymentManagerInput({ organizationId: input.organizationId, strategy: input.strategy, target: input.target });
        this.validator.validate({ organizationId: validated.organizationId, target: validated.target, strategy: validated.strategy });
        const logs = [];
        const deploymentId = randomUUID();
        const deploymentUrl = `https://deploy.example.com/${validated.organizationId}`;
        logs.push(this.logger.log(`Starting deployment ${deploymentId} for ${validated.organizationId}`));
        logs.push(this.logger.log(`Strategy: ${validated.strategy}, Target: ${validated.target}`));
        try {
            const n8nOk = await this.n8NDeploymentService.deploy(validated.target, logs, this.logger);
            const supabaseOk = await this.supabaseDeploymentService.deploy('supabase', logs, this.logger);
            const workspaceOk = await this.workspaceDeploymentService.deploy('client_workspace', logs, this.logger);
            const marketplaceOk = await this.marketplaceDeploymentService.deploy('marketplace', logs, this.logger);
            if (!n8nOk || !supabaseOk || !workspaceOk || !marketplaceOk) {
                throw new Error('One or more deployment steps failed');
            }
            const report = {
                deployment_id: deploymentId,
                status: 'success',
                employee_deployed: true,
                agents_deployed: true,
                workflow_deployed: true,
                knowledge_installed: true,
                marketplace_published: true,
                client_workspace_created: true,
                deployment_url: deploymentUrl,
                logs
            };
            await this.repository.save({
                id: deploymentId,
                organizationId: validated.organizationId,
                status: 'success',
                report,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            return report;
        }
        catch (error) {
            logs.push(this.logger.log(`Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
            const rollbackOk = await this.rollbackService.rollback(logs, this.logger);
            const report = {
                deployment_id: deploymentId,
                status: rollbackOk ? 'rolled_back' : 'failed',
                employee_deployed: false,
                agents_deployed: false,
                workflow_deployed: false,
                knowledge_installed: false,
                marketplace_published: false,
                client_workspace_created: false,
                deployment_url: deploymentUrl,
                logs
            };
            await this.repository.save({
                id: deploymentId,
                organizationId: validated.organizationId,
                status: report.status,
                report,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            return report;
        }
    }
}
