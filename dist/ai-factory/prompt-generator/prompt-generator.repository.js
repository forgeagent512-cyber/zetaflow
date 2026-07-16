export class InMemoryPromptRepository {
    records = [];
    async findByName(promptName) {
        return this.records.find((record) => record.promptName === promptName) ?? null;
    }
    async save(record) {
        this.records.push(record);
        return record;
    }
}
