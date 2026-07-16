export class N8NDeploymentService {
  async deploy(target: string, logs: string[], logger: { log(message: string): string }): Promise<boolean> {
    logs.push(logger.log(`Deploying workflow package to ${target}`));
    return true;
  }
}
