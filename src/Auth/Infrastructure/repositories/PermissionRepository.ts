import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

import { BaseTypeOrmRepositoryImpl } from '../../../Shared/Infrastructure/BaseTypeOrmRepositoryImpl';
import { PermissionDomain } from '../../Domain/Entities/PermissionDomain';

@Injectable()
export class PermissionRepository extends BaseTypeOrmRepositoryImpl<Partial<PermissionDomain>, PermissionDomain>
{
  constructor(
    @Inject('PERMISSION_REPOSITORY')
      permissionRepository: Repository<PermissionDomain>
  )
  {
    super(permissionRepository, 'PermissionEntity');
  }
}
