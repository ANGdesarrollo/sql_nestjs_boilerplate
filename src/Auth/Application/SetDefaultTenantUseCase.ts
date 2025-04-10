import { Injectable, NotFoundException } from '@nestjs/common';

import { UserTenantRepository } from '../Infrastructure/Repositories/UserTenantRepository';

interface SetDefaultTenantParams {
  userId: string;
  tenantId: string;
}

@Injectable()
export class SetDefaultTenantUseCase
{
  constructor(
    private readonly userTenantRepository: UserTenantRepository
  ) {}

  async execute(params: SetDefaultTenantParams): Promise<void>
  {
    const { userId, tenantId } = params;

    const relation = await this.userTenantRepository.findByUserAndTenant(userId, tenantId);
    if (!relation)
    {
      throw new NotFoundException('User is not assigned to this tenant');
    }

    await this.userTenantRepository.setDefaultTenant(userId, tenantId);
  }
}
