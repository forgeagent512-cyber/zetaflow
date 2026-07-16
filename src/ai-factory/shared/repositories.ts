import type { Identifiable } from './contracts.js';

export interface Repository<T extends Identifiable, TId = string> {
  findById(id: TId): Promise<T | null>;
  save(entity: T): Promise<T>;
  delete(id: TId): Promise<void>;
}

export abstract class InMemoryRepository<T extends Identifiable, TId = string> implements Repository<T, TId> {
  private readonly store = new Map<string, T>();

  async findById(id: TId): Promise<T | null> {
    return this.store.get(String(id)) ?? null;
  }

  async save(entity: T): Promise<T> {
    this.store.set(entity.id, entity);
    return entity;
  }

  async delete(id: TId): Promise<void> {
    this.store.delete(String(id));
  }
}
