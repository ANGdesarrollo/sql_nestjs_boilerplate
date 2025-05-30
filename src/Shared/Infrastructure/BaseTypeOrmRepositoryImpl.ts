import { Injectable, Logger } from '@nestjs/common';
import { DeepPartial, EntityManager, FindOneOptions, ObjectLiteral, Repository } from 'typeorm';

import { BaseCriteria  } from '../Domain/Criteria/BaseCriteria';
import { CriteriaResponse } from '../Domain/Criteria/CriteriaResponse';
import { BaseRepository } from '../Domain/Repositories/BaseRepository';

type QueryParamsCriteria = Pick<BaseCriteria, 'offset' | 'limit' | 'sortBy' | 'orderBy' | 'filters'>;

function buildQueryParams(criteria: QueryParamsCriteria): string
{
  const params = new URLSearchParams();

  params.append('offset', criteria.offset.toString());
  params.append('limit', criteria.limit.toString());

  if (criteria.sortBy)
  {
    params.append('sortBy', criteria.sortBy);
  }
  if (criteria.orderBy)
  {
    params.append('orderBy', criteria.orderBy);
  }

  Object.keys(criteria.filters).forEach((key) =>
  {
    criteria.filters[key].forEach((value) =>
    {
      params.append(key, value);
    });
  });

  return params.toString();
}


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


  async findOneBy(
    conditions: Partial<T>,
    relations?: string[]
  ): Promise<T | null>
  {
    try
    {
      const options: FindOneOptions<T> = { where: conditions };
      if (relations && relations.length > 0)
      {
        options.relations = relations;
      }
      return this.repository.findOne(options);
    }
    catch (error)
    {
      this.handleTypeOrmError(error, 'findOneBy');
    }
  }

  async list(relations?: string[]): Promise<T[]>
  {
    try
    {
      return this.repository.find({
        relations
      });
    }
    catch (error)
    {
      this.handleTypeOrmError(error, 'list');
    }
  }

  async listByCriteria(
    criteria: BaseCriteria,
    relations?: string[]
  ): Promise<CriteriaResponse<T>>
  {
    try
    {
      const baseUrl = process.env.BASE_URL;
      const queryBuilder = this.repository.createQueryBuilder('entity');

      Object.keys(criteria.filters).forEach((key) =>
      {
        if (criteria.filters[key].length > 0)
        {
          queryBuilder.andWhere(`entity.${key} IN (:...${key})`, {
            [key]: criteria.filters[key]
          });
        }
      });

      if (criteria.sortBy && criteria.orderBy)
      {
        queryBuilder.orderBy(
          `entity.${criteria.sortBy}`,
          criteria.orderBy.toUpperCase() as 'ASC' | 'DESC'
        );
      }

      queryBuilder.skip(criteria.offset).take(criteria.limit);

      if (relations && relations.length > 0)
      {
        relations.forEach((relation) =>
        {
          const alias = `${relation}Alias`;
          queryBuilder.leftJoinAndSelect(`entity.${relation}`, alias);
        });
      }

      const data = await queryBuilder.getMany();

      const countQuery = this.repository.createQueryBuilder('entity');
      Object.keys(criteria.filters).forEach((key) =>
      {
        if (criteria.filters[key].length > 0)
        {
          countQuery.andWhere(`entity.${key} IN (:...${key})`, {
            [key]: criteria.filters[key]
          });
        }
      });
      const totalRecords = await countQuery.getCount();
      const totalPages = Math.ceil(totalRecords / criteria.limit);

      const nextOffset =
        criteria.offset + criteria.limit < totalRecords
          ? criteria.offset + criteria.limit
          : null;
      const prevOffset = criteria.offset > 0 ? criteria.offset - criteria.limit : null;

      const nextParams = nextOffset !== null ? buildQueryParams({ ...criteria, offset: nextOffset }) : null;
      const prevParams = prevOffset !== null ? buildQueryParams({ ...criteria, offset: prevOffset }) : null;

      const nextPage = nextParams ? `${baseUrl}?${nextParams}` : null;
      const prevPage = prevParams ? `${baseUrl}?${prevParams}` : null;

      return {
        data,
        totalPages,
        nextPage,
        prevPage
      };
    }
    catch (error)
    {
      this.logger.error(`Error executing listByCriteria: ${error.message}`);
      throw new Error(`Failed to list entities: ${error.message}`);
    }
  }

  async update(id: number, data: Partial<T>): Promise<T>
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


  async delete(id: number): Promise<void>
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
      return new repoClass(newRepository, this.entityName);
    }
    catch (error)
    {
      this.logger.error(`Error creating transactional repository: ${error.message}`);
      throw error;
    }
  }
}

