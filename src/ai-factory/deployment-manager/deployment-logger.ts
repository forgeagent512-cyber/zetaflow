export class DeploymentLogger {
  log(message: string): string {
    const entry = `[${new Date().toISOString()}] ${message}`;
    console.log(entry);
    return entry;
  }
}
