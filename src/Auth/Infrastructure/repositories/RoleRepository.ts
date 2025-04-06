import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

import { BaseTypeOrmRepositoryImpl } from '../../../Shared/Infrastructure/BaseTypeOrmRepositoryImpl';
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
}
