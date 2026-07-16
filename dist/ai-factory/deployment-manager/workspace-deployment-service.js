export class WorkspaceDeploymentService {
    async deploy(target, logs, logger) {
        logs.push(logger.log(`Creating workspace in ${target}`));
        return true;
    }
}
