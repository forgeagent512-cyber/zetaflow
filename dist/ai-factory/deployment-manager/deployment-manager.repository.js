export class InMemoryDeploymentRepository {
    records = [];
    async save(record) {
        this.records.push(record);
        return record;
    }
    async findById(id) {
        return this.records.find((record) => record.id === id) ?? null;
    }
}
