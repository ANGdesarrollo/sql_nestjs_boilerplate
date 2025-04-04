import { Injectable, Logger } from '@nestjs/common';

import { BaseRepository } from '../Domain/Repositories/BaseRepository';

import { PrismaService } from './DatabaseService';

@Injectable()
export abstract class BasePrismaRepositoryImpl<D, T> implements BaseRepository<D, T>
{
  protected readonly entityName: string;
  protected repository: PrismaService;

  private readonly logger = new Logger(BasePrismaRepositoryImpl.name);

  protected constructor(repository: PrismaService, entityName: string)
  {
    this.repository = repository;
    this.entityName = entityName;
  }

  async create(entity: D): Promise<T>
  {
    try
    {
      return await this.repository[this.entityName].create({
        data: entity
      });
    }
    catch (error)
    {
      this.handlePrismaError(error, 'create');
    }
  }

  async createMany(entities: D[]): Promise<T[]>
  {
    try
    {
      return await this.repository[this.entityName].createMany({
        data: entities
      });
    }
    catch (error)
    {
      this.handlePrismaError(error, 'createMany');
    }
  }

  async findOneBy<K extends keyof T>(fieldName: K, fieldValue: T[K]): Promise<T>
  {
    try
    {
      return await this.repository[this.entityName].findUniqueOrThrow({
        where: {
          [fieldName]: fieldValue
        }
      });
    }
    catch (error)
    {
      this.handlePrismaError(error, 'findOneBy');
    }
  }

  async list(): Promise<T[]>
  {
    try
    {
      return await this.repository[this.entityName].findMany();
    }
    catch (error)
    {
      this.handlePrismaError(error, 'list');
    }
  }

  async update(id: string, data: Partial<T>): Promise<T>
  {
    try
    {
      return await this.repository[this.entityName].update({
        where: {
          id
        },
        data
      });
    }
    catch (error)
    {
      this.handlePrismaError(error, 'update');
    }
  }

  async delete(id: string)
  {
    return this.repository[this.entityName].delete({
      where: {
        id
      }
    });
  }

  protected handlePrismaError(error: any, operation: string): never
  {
    const message = `[${this.entityName}] Failed to execute ${operation}: ${error.message}`;
    this.logger.error(message);

    throw new Error(message);
  }
}
