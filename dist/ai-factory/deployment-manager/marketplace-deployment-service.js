export class MarketplaceDeploymentService {
    async deploy(target, logs, logger) {
        logs.push(logger.log(`Publishing package to ${target}`));
        return true;
    }
}
