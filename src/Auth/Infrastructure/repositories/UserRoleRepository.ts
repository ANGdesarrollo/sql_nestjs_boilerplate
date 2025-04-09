import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

import { BaseTypeOrmRepositoryImpl } from '../../../Shared/Infrastructure/BaseTypeOrmRepositoryImpl';
import { UserRoleDomain } from '../../Domain/Entities/UserRoleDomain';
import { CreateUserRolePayload } from '../../Domain/Payloads/CreateUserRolePayload';
import { UserRoleEntity } from '../schemas/UserRoleSchema';

@Injectable()
export class UserRoleRepository extends BaseTypeOrmRepositoryImpl<CreateUserRolePayload, UserRoleDomain>
{
  constructor(
    @Inject('USER_ROLE_REPOSITORY')
      userRoleRepository: Repository<UserRoleEntity>
  )
  {
    super(userRoleRepository, 'UserRoleEntity');
  }

  async getUserRoles(userId: string): Promise<UserRoleDomain[]>
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
