import { Injectable, Logger } from '@nestjs/common';
import { DeepPartial, EntityManager, FindOneOptions, ObjectLiteral, Repository } from 'typeorm';

import { BaseRepository } from '../Domain/Repositories/BaseRepository';

@Injectable()
export abstract class BaseTypeOrmRepositoryImpl<D, T extends ObjectLiteral> implements BaseRepository<D, T>
{
  protected readonly logger = new Logger(BaseTypeOrmRepositoryImpl.name);
  protected readonly repository: Repository<T>;
  protected readonly entityName: string;

  protected constructor(repository: Repository<T>, entityName: string)
  {
    this.repository = repository;
    this.entityName = entityName;
  }

  async create(entity: D): Promise<T>
  {
    try
    {
      const newEntity = this.repository.create(entity as DeepPartial<T>);
      return await this.repository.save(newEntity);
    }
    catch (error)
    {
      this.handleTypeOrmError(error, 'create');
    }
  }

  async createMany(entities: D[]): Promise<T[]>
  {
    try
    {
      const newEntities: T[] = this.repository.create(entities as DeepPartial<T>[]);
      return await this.repository.save(newEntities);
    }
    catch (error)
    {
      this.handleTypeOrmError(error, 'createMany');
    }
  }


  async findOneBy<K extends keyof T>(
    fieldName: K,
    fieldValue: T[K],
    relations?: string[]
  ): Promise<T | null>
  {
    try
    {
      const where = {} as any;
      where[fieldName] = fieldValue;

      const options: FindOneOptions<T> = { where };
      if (relations && relations.length > 0)
      {
        options.relations = relations;
      }

      return await this.repository.findOne(options);
    }
    catch (error)
    {
      this.handleTypeOrmError(error, 'findOneBy');
    }
  }

  async list(): Promise<T[]>
  {
    try
    {
      return await this.repository.find();
    }
    catch (error)
    {
      this.handleTypeOrmError(error, 'list');
    }
  }

  async update(id: string, data: Partial<T>): Promise<T>
  {
    const result = await this.repository
      .createQueryBuilder()
      .update()
      .set(data)
      .where('id = :id', { id })
      .returning('*')
      .execute();

    if (!result.raw || result.raw.length === 0)
    {
      throw new Error(`Entity with id ${id} not found`);
    }

    return result.raw[0] as T;
  }


  async delete(id: string): Promise<void>
  {
    try
    {
      await this.repository.delete(id);
    }
    catch (error)
    {
      this.handleTypeOrmError(error, 'delete');
    }
  }

  protected handleTypeOrmError(error: any, operation: string): never
  {
    const message = `[${this.entityName}] Failed to execute ${operation}: ${error.message}`;
    this.logger.error(message);

    throw new Error(message);
  }

  withTransaction(manager: EntityManager): this
  {
    try
    {
      const newRepository = manager.getRepository<T>(this.repository.target);

      const repoClass = this.constructor as any;
      const newInstance = new repoClass(newRepository, this.entityName);

      return newInstance;
    }
    catch (error)
    {
      this.logger.error(`Error creating transactional repository: ${error.message}`);
      throw error;
    }
  }
}
