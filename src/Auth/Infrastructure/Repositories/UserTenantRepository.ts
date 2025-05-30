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

  async findByUserAndTenant(userId: number, tenantId: number): Promise<UserTenantDomain | null>
  {
    try
    {
      return await this.repository.findOne({
        where: {
          user: { id: userId },
          tenant: { id: tenantId }
        },
        relations: ['tenant', 'user']
      });
    }
    catch (error)
    {
      this.handleTypeOrmError(error, 'findByUserAndTenant');
    }
  }

  async findUserTenants(userId: number): Promise<UserTenantDomain[]>
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

  async getDefaultTenant(userId: number): Promise<UserTenantDomain | null>
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

  async setDefaultTenant(userId: number, tenantId: number): Promise<void>
  {
    try
    {
      await this.repository.update(
        { user: { id: userId } },
        { isDefault: false }
      );

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

  async create(payload: UserTenantPayload): Promise<UserTenantDomain>
  {
    try
    {
      const entity = this.repository.create({
        user: { id: payload.userId },
        tenant: { id: payload.tenantId },
        isDefault: payload.isDefault || false
      });

      return await this.repository.save(entity);
    }
    catch (error)
    {
      this.handleTypeOrmError(error, 'create');
    }
  }

  // New method to delete a user-tenant relationship
  async deleteUserTenant(userId: number, tenantId: number): Promise<void>
  {
    try
    {
      await this.repository.createQueryBuilder()
        .delete()
        .where('userId = :userId AND tenantId = :tenantId', { userId, tenantId })
        .execute();
    }
    catch (error)
    {
      this.handleTypeOrmError(error, 'deleteUserTenant');
    }
  }
}
