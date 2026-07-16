export class RollbackService {
  async rollback(logs: string[], logger: { log(message: string): string }): Promise<boolean> {
    logs.push(logger.log('Rolling back failed deployment actions'));
    return true;
  }
}
