export class WorkspaceDeploymentService {
  async deploy(target: string, logs: string[], logger: { log(message: string): string }): Promise<boolean> {
    logs.push(logger.log(`Creating workspace in ${target}`));
    return true;
  }
}
