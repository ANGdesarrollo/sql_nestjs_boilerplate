export abstract class BaseRepository<D, T>
{
  abstract create(payload: Partial<D>): Promise<T>
  abstract createMany(payload: Partial<D>[]): Promise<T[]>
  abstract findOneBy(conditions: Partial<T>, relations?: string[]): Promise<T | null>;
  abstract update(id: number, data: Partial<T>): Promise<T>
  abstract list(): Promise<T[]>;
  abstract delete(id: number): Promise<void>;
}
