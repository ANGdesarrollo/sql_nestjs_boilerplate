import { BaseId } from 'src/Shared/Domain/Entities/BaseId';

import { BaseTimeStamp } from '../../../Shared/Domain/Entities/BaseTimeStamp';

import { PermissionDomain } from './PermissionDomain';
import { RoleDomain } from './RoleDomain';
import { TenantDomain } from './TenantDomain';

export interface UserDomain extends BaseId, BaseTimeStamp {
  username: string;
  password: string;
  roles: RoleDomain[];
  permissions: PermissionDomain[];
  tenants: TenantDomain[];
}
