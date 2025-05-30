import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

import { BaseTypeOrmRepositoryImpl } from '../../../Shared/Infrastructure/BaseTypeOrmRepositoryImpl';
import { UserRoleDomain } from '../../Domain/Entities/UserRoleDomain';
import { CreateUserRolePayload } from '../../Domain/Payloads/CreateUserRolePayload';

@Injectable()
export class UserRoleRepository extends BaseTypeOrmRepositoryImpl<CreateUserRolePayload, UserRoleDomain>
{
  constructor(
    @Inject('USER_ROLE_REPOSITORY')
      userRoleRepository: Repository<UserRoleDomain>
  )
  {
    super(userRoleRepository, 'UserRoleEntity');
  }

  async getUserRoles(userId: number): Promise<UserRoleDomain[]>
  {
    try
    {
      return await this.repository.find({
        where: { user: { id: userId } },
        relations: ['role', 'role.permissions']
      });
    }
    catch (error)
    {
      this.handleTypeOrmError(error, 'getUserRoles');
    }
  }
}
