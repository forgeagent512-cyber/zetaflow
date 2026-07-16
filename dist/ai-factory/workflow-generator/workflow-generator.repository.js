export class InMemoryWorkflowGeneratorRepository {
    records = [];
    async findSimilarWorkflow(input, workflowName) {
        return this.records.find((record) => record.workflowName === workflowName) ?? null;
    }
    async save(record) {
        this.records.push(record);
        return record;
    }
}
