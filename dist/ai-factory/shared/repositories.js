export class InMemoryRepository {
    store = new Map();
    async findById(id) {
        return this.store.get(String(id)) ?? null;
    }
    async save(entity) {
        this.store.set(entity.id, entity);
        return entity;
    }
    async delete(id) {
        this.store.delete(String(id));
    }
}
