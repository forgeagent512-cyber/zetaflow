export interface BaseRepository<TRecord, TCreate, TUpdate> {
  findById(id: string): Promise<TRecord | null>;
  findAll(): Promise<TRecord[]>;
  create(input: TCreate): Promise<TRecord>;
  update(id: string, input: TUpdate): Promise<TRecord | null>;
  delete(id: string): Promise<boolean>;
}
