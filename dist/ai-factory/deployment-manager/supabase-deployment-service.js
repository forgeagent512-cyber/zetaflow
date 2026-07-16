export class SupabaseDeploymentService {
    async deploy(target, logs, logger) {
        logs.push(logger.log(`Provisioning database resources in ${target}`));
        return true;
    }
}
