export class DeploymentLogger {
    log(message) {
        const entry = `[${new Date().toISOString()}] ${message}`;
        console.log(entry);
        return entry;
    }
}
