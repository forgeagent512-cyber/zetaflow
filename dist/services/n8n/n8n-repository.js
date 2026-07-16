export class InMemoryN8nRepository {
    records = new Map();
    async save(record) {
        this.records.set(record.id, record);
        return record;
    }
    async findById(id) {
        return this.records.get(id) ?? null;
    }
    async delete(id) {
        return this.records.delete(id);
    }
}
