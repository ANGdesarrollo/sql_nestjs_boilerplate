import { Injectable, NotFoundException } from '@nestjs/common';

import { UserRepository } from '../Infrastructure/repositories/UserRepository';
import { UserRoleRepository } from '../Infrastructure/repositories/UserRoleRepository';
import { UserTenantRepository } from '../Infrastructure/repositories/UserTenantRepository';
import { UserTransformer } from '../Presentation/Transformers/UserTransformer';

@Injectable()
export class GetUserUseCase
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userRoleRepository: UserRoleRepository,
    private readonly userTenantRepository: UserTenantRepository
  ) {}

  async execute(userId: string): Promise<{
    user: UserTransformer;
    roles: string[];
    defaultTenant: {
      id: string;
      name: string;
    } | null;
  }>
  {
    const user = await this.userRepository.findOneBy('id', userId);
    if (!user)
    {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const userRoles = await this.userRoleRepository.getUserRoles(userId);
    const roles = userRoles.map(ur => ur.role.name);

    const defaultUserTenant = await this.userTenantRepository.getDefaultTenant(userId);

    const defaultTenant = defaultUserTenant
      ? {
          id: defaultUserTenant.tenant.id,
          name: defaultUserTenant.tenant.name
        }
      : null;

    return {
      user: new UserTransformer(user),
      roles,
      defaultTenant
    };
  }
}
