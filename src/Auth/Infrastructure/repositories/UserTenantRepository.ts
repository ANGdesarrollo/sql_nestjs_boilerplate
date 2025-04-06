import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

import { BaseTypeOrmRepositoryImpl } from '../../../Shared/Infrastructure/BaseTypeOrmRepositoryImpl';
import { UserTenantDomain } from '../../Domain/Entities/UserTenantDomain';
import { UserTenantPayload } from '../../Domain/Payloads/UserTenantPayload';

@Injectable()
export class UserTenantRepository extends BaseTypeOrmRepositoryImpl<UserTenantPayload, UserTenantDomain>
{
  constructor(
    @Inject('USER_TENANT_REPOSITORY')
      userTenantRepository: Repository<UserTenantDomain>
  )
  {
    super(userTenantRepository, 'UserTenantEntity');
  }

  async findByUserAndTenant(userId: string, tenantId: string): Promise<UserTenantDomain | null>
  {
    try
    {
      return await this.repository.findOne({
        where: {
          user: { id: userId },
          tenant: { id: tenantId }
        }
      });
    }
    catch (error)
    {
      this.handleTypeOrmError(error, 'findByUserAndTenant');
    }
  }

  async findUserTenants(userId: string): Promise<UserTenantDomain[]>
  {
    try
    {
      return await this.repository.find({
        where: { user: { id: userId } },
        relations: ['tenant']
      });
    }
    catch (error)
    {
      this.handleTypeOrmError(error, 'findUserTenants');
    }
  }

  async getDefaultTenant(userId: string): Promise<UserTenantDomain | null>
  {
    try
    {
      return await this.repository.findOne({
        where: {
          user: { id: userId },
          isDefault: true
        },
        relations: ['tenant']
      });
    }
    catch (error)
    {
      this.handleTypeOrmError(error, 'getDefaultTenant');
    }
  }

  async setDefaultTenant(userId: string, tenantId: string): Promise<void>
  {
    try
    {
      // First, reset all default flags for this user
      await this.repository.update(
        { user: { id: userId } },
        { isDefault: false }
      );

      // Then set the new default
      await this.repository.update(
        {
          user: { id: userId },
          tenant: { id: tenantId }
        },
        { isDefault: true }
      );
    }
    catch (error)
    {
      this.handleTypeOrmError(error, 'setDefaultTenant');
    }
  }
}
