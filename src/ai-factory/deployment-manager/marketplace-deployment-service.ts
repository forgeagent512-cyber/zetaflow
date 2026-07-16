export class MarketplaceDeploymentService {
  async deploy(target: string, logs: string[], logger: { log(message: string): string }): Promise<boolean> {
    logs.push(logger.log(`Publishing package to ${target}`));
    return true;
  }
}
