import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

import { BaseTypeOrmRepositoryImpl } from '../../../Shared/Infrastructure/BaseTypeOrmRepositoryImpl';
import { PermissionDomain } from '../../Domain/Entities/PermissionDomain';
import { PermissionPayload } from '../../Domain/Payloads/PermissionPayload';

@Injectable()
export class PermissionRepository extends BaseTypeOrmRepositoryImpl<PermissionPayload, PermissionDomain>
{
  constructor(
    @Inject('PERMISSION_REPOSITORY')
      permissionRepository: Repository<PermissionDomain>
  )
  {
    super(permissionRepository, 'PermissionEntity');
  }
}
