import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

import { BaseTypeOrmRepositoryImpl } from '../../../Shared/Infrastructure/BaseTypeOrmRepositoryImpl';
import { PermissionDomain } from '../../Domain/Entities/PermissionDomain';
import { RoleDomain } from '../../Domain/Entities/RoleDomain';
import { RolePayload } from '../../Domain/Payloads/RolePayload';

@Injectable()
export class RoleRepository extends BaseTypeOrmRepositoryImpl<RolePayload, RoleDomain>
{
  constructor(
    @Inject('ROLE_REPOSITORY')
      repository: Repository<RoleDomain>
  )
  {
    super(repository, 'RoleEntity');
  }

  async updateRolePermissions(id: number, permissions: PermissionDomain[]): Promise<void>
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
