export class RollbackService {
    async rollback(logs, logger) {
        logs.push(logger.log('Rolling back failed deployment actions'));
        return true;
    }
}
