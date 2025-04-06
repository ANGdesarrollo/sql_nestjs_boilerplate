import { BaseId } from 'src/Shared/Domain/Entities/BaseId';

import { BaseTimeStamp } from '../../../Shared/Domain/Entities/BaseTimeStamp';

import { TenantDomain } from './TenantDomain';
import { UserDomain } from './UserDomain';

export interface UserTenantDomain extends BaseId, Pick<BaseTimeStamp, 'createdAt'> {
  user: UserDomain;
  tenant: TenantDomain;
  isDefault: boolean;
}
