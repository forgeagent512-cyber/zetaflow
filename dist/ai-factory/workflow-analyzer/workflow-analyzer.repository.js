export class InMemoryWorkflowAnalysisRepository {
    records = [];
    async save(record) {
        this.records.push(record);
        return record;
    }
    async findByWorkflowId(workflowId) {
        return this.records.find((record) => record.workflow_id === workflowId) ?? null;
    }
}
