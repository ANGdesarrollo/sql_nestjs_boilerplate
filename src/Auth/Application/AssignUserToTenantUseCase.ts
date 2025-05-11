import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';

import { UserTenantDomain } from '../Domain/Entities/UserTenantDomain';
import { TenantRepository } from '../Infrastructure/Repositories/TenantRepository';
import { UserRepository } from '../Infrastructure/Repositories/UserRepository';
import { UserTenantRepository } from '../Infrastructure/Repositories/UserTenantRepository';

interface AssignUserToTenantParams {
  userId: string;
  tenantId: string;
  setAsDefault?: boolean;
}

@Injectable()
export class AssignUserToTenantUseCase
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tenantRepository: TenantRepository,
    private readonly userTenantRepository: UserTenantRepository
  ) {}

  async execute(params: AssignUserToTenantParams): Promise<UserTenantDomain>
  {
    const { userId, tenantId, setAsDefault = false } = params;

    const user = await this.userRepository.findOneBy({ id : userId });
    if (!user)
    {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const tenant = await this.tenantRepository.findOneBy({ id : tenantId });
    if (!tenant)
    {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }

    const existingRelation = await this.userTenantRepository.findByUserAndTenant(userId, tenantId);
    if (existingRelation)
    {
      throw new ConflictException('User is already assigned to this tenant');
    }

    const userTenant = await this.userTenantRepository.create({
      userId: user.id,
      tenantId: tenant.id,
      isDefault: setAsDefault
    });

    if (setAsDefault)
    {
      await this.userTenantRepository.setDefaultTenant(userId, tenantId);
    }
    else
    {
      // const userTenants = await this.userTenantRepository.findUserTenants(userId);
      // if (userTenants.length === 1)
      // {
      //   await this.userTenantRepository.setDefaultTenant(userId, tenantId);
      // }
    }

    return userTenant;
  }
}
