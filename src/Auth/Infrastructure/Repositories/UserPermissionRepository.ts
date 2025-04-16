import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

import { BaseTypeOrmRepositoryImpl } from '../../../Shared/Infrastructure/BaseTypeOrmRepositoryImpl';
import { UserPermissionDomain } from '../../Domain/Entities/UserPermissionDomain';
import { UserPermissionPayload } from '../../Domain/Payloads/UserPermissionPayload';

@Injectable()
export class UserPermissionRepository extends BaseTypeOrmRepositoryImpl<UserPermissionPayload, UserPermissionDomain>
{
  constructor(
    @Inject('USER_PERMISSION_REPOSITORY')
      userPermissionRepository: Repository<UserPermissionDomain>
  )
  {
    super(userPermissionRepository, 'UserPermissionEntity');
  }

  async getUserPermissions(userId: string): Promise<UserPermissionDomain[]>
  {
    try
    {
      return await this.repository.find({
        where: { user: { id: userId } },
        relations: ['permission']
      });
    }
    catch (error)
    {
      this.handleTypeOrmError(error, 'getUserPermissions');
    }
  }
}
