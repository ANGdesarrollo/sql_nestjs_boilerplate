import { Injectable, Inject } from '@nestjs/common';
import { In, Repository } from 'typeorm';

import { BaseTypeOrmRepositoryImpl } from '../../../Shared/Infrastructure/BaseTypeOrmRepositoryImpl';
import { TenantDomain } from '../../Domain/Entities/TenantDomain';
import { TenantPayload } from '../../Domain/Payloads/TenantPayload';

@Injectable()
export class TenantRepository extends BaseTypeOrmRepositoryImpl<TenantPayload, TenantDomain>
{
  constructor(
    @Inject('TENANT_REPOSITORY')
      tenantRepository: Repository<TenantDomain>
  )
  {
    super(tenantRepository, 'TenantEntity');
  }

  async findBySlug(slug: string): Promise<TenantDomain | null>
  {
    try
    {
      return await this.repository.findOne({ where: { slug } });
    }
    catch (error)
    {
      this.handleTypeOrmError(error, 'findBySlug');
    }
  }

  async findByIds(ids: number[]): Promise<TenantDomain[]>
  {
    try
    {
      return await this.repository.find({
        where: { id: In(ids) }
      });
    }
    catch (error)
    {
      this.handleTypeOrmError(error, 'findByIds');
    }
  }
}
