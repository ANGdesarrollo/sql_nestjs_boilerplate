import { Injectable, NotFoundException } from '@nestjs/common';

import { BaseId } from '../../Shared/Domain/Entities/BaseId';
import { IdValidator } from '../../Shared/Presentation/Validations/IdValidator';
import { Validator } from '../../Shared/Presentation/Validations/Validator';
import { TenantDomain } from '../Domain/Entities/TenantDomain';
import { UserDomain } from '../Domain/Entities/UserDomain';
import { UserPermissionRepository } from '../Infrastructure/Repositories/UserPermissionRepository';
import { UserRepository } from '../Infrastructure/Repositories/UserRepository';
import { UserRoleRepository } from '../Infrastructure/Repositories/UserRoleRepository';
import { UserTenantRepository } from '../Infrastructure/Repositories/UserTenantRepository';

type TenantInfo = Pick<TenantDomain, 'id' | 'name' | 'slug'> & { isDefault: boolean };
type UserInfo = Pick<UserDomain, 'id' | 'username' | 'createdAt' | 'updatedAt'>;

@Injectable()
export class GetMeUseCase extends Validator<BaseId>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userRoleRepository: UserRoleRepository,
    private readonly userTenantRepository: UserTenantRepository,
    private readonly userPermissionRepository: UserPermissionRepository
  )
  {
    super(IdValidator);
  }

  async execute(id: number): Promise<{
    user: UserInfo;
    roles: string[];
    permissions: string[];
    tenants: TenantInfo[];
  }>
  {
    const user = await this.userRepository.findOneBy({  id });
    if (!user)
    {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const userRoles = await this.userRoleRepository.getUserRoles(id);
    const roles = userRoles.map(ur => ur.role.name);

    const permissionsSet = new Set<string>();

    userRoles.forEach(userRole =>
    {
      userRole.role.permissions.forEach(permission =>
      {
        permissionsSet.add(permission.name);
      });
    });

    const directPermissions = await this.userPermissionRepository.getUserPermissions(id);
    directPermissions.forEach(up =>
    {
      permissionsSet.add(up.permission.name);
    });

    const userTenants = await this.userTenantRepository.findUserTenants(id);

    const tenants: TenantInfo[] = userTenants.map(ut => ({
      id: ut.tenant.id,
      name: ut.tenant.name,
      slug: ut.tenant.slug,
      isDefault: ut.isDefault
    }));

    return {
      user: { id: user.id, username: user.username, createdAt: user.createdAt, updatedAt: user.updatedAt },
      roles,
      permissions: Array.from(permissionsSet),
      tenants
    };
  }
}
