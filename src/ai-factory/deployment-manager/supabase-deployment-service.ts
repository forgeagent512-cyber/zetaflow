export class SupabaseDeploymentService {
  async deploy(target: string, logs: string[], logger: { log(message: string): string }): Promise<boolean> {
    logs.push(logger.log(`Provisioning database resources in ${target}`));
    return true;
  }
}
