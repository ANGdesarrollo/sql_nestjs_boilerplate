export abstract class BaseRepository<D, T>
{
  abstract create(payload: Partial<D>): Promise<T>
  abstract createMany(payload: Partial<D>[]): Promise<T[]>
  abstract findOneBy<K extends keyof T>(fieldName: K, fieldValue: T[K]): Promise<T | null>;
  abstract update(id: string, data: Partial<T>): Promise<T>
  abstract list(): Promise<T[]>;
  abstract delete(id: string): Promise<void>;
}
