export class N8NDeploymentService {
    async deploy(target, logs, logger) {
        logs.push(logger.log(`Deploying workflow package to ${target}`));
        return true;
    }
}
