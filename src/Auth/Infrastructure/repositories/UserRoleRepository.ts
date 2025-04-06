import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

import { BaseTypeOrmRepositoryImpl } from '../../../Shared/Infrastructure/BaseTypeOrmRepositoryImpl';
import { UserRoleDomain } from '../../Domain/Entities/UserRoleDomain';

@Injectable()
export class UserRoleRepository extends BaseTypeOrmRepositoryImpl<Partial<UserRoleDomain>, UserRoleDomain>
{
  constructor(
    @Inject('USER_ROLE_REPOSITORY')
      userRoleRepository: Repository<UserRoleDomain>
  )
  {
    super(userRoleRepository, 'UserRoleEntity');
  }
}
