import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

import { BaseTypeOrmRepositoryImpl } from '../../../Shared/Infrastructure/BaseTypeOrmRepositoryImpl';
import { UserPermissionDomain } from '../../Domain/Entities/UserPermissionDomain';

@Injectable()
export class UserPermissionRepository extends BaseTypeOrmRepositoryImpl<Partial<UserPermissionDomain>, UserPermissionDomain>
{
  constructor(
    @Inject('USER_PERMISSION_REPOSITORY')
      userPermissionRepository: Repository<UserPermissionDomain>
  )
  {
    super(userPermissionRepository, 'UserPermissionEntity');
  }
}
