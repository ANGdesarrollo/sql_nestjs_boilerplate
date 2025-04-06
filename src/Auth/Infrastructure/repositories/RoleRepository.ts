import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

import { BaseTypeOrmRepositoryImpl } from '../../../Shared/Infrastructure/BaseTypeOrmRepositoryImpl';
import { PermissionDomain } from '../../Domain/Entities/PermissionDomain';
import { RoleDomain } from '../../Domain/Entities/RoleDomain';

@Injectable()
export class RoleRepository extends BaseTypeOrmRepositoryImpl<Partial<RoleDomain>, RoleDomain>
{
  constructor(
    @Inject('ROLE_REPOSITORY')
      roleRepository: Repository<RoleDomain>
  )
  {
    super(roleRepository, 'RoleEntity');
  }

  async updateRolePermissions(id: string, permissions: PermissionDomain[]): Promise<void>
  {
    const role = await this.repository.findOne({
      where: { id },
      relations: ['permissions']
    });

    if (role)
    {
      role.permissions = permissions;
      await this.repository.save(role);
    }
  }
}
