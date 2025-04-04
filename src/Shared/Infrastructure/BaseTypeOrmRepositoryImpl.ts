// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { FindOptionsWhere, ObjectLiteral, Repository } from 'typeorm';

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

  async create(entity: Partial<D>): Promise<T>
  {
    try
    {
      const newEntity = this.repository.create(entity as any);
      return await this.repository.save(newEntity);
    }
    catch (error)
    {
      this.handleTypeOrmError(error, 'create');
    }
  }

  async createMany(entities: Partial<D>[]): Promise<T[]>
  {
    try
    {
      const newEntities = entities.map(entity =>
        this.repository.create(entity as any)
      );

      return await this.repository.save(newEntities);
    }
    catch (error)
    {
      this.handleTypeOrmError(error, 'createMany');
    }
  }

  async findOneBy<K extends keyof T>(fieldName: K, fieldValue: T[K]): Promise<T | null>
  {
    try
    {
      // Crear el objeto where dinámicamente y convertirlo para TypeORM
      const where = {} as any;
      where[fieldName] = fieldValue;

      return await this.repository.findOne({ where });
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
    try
    {
      await this.repository.update(id, data);

      const updated = await this.repository.findOne({ where: { id } as any });

      if (!updated)
      {
        throw new Error(`Entity with id ${id} not found after update`);
      }

      return updated;
    }
    catch (error)
    {
      this.handleTypeOrmError(error, 'update');
    }
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
}
