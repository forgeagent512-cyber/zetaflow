export class InMemoryKnowledgeRepository {
    records = [];
    async save(record) {
        this.records.push(record);
        return record;
    }
    async findByOrganizationId(organizationId) {
        return this.records.filter((record) => record.organizationId === organizationId);
    }
}
