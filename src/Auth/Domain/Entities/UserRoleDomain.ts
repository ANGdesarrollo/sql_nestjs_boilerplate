import { BaseId } from 'src/Shared/Domain/Entities/BaseId';

import { BaseTimeStamp } from '../../../Shared/Domain/Entities/BaseTimeStamp';

import { RoleDomain } from './RoleDomain';
import { UserDomain } from './UserDomain';

export interface UserRoleDomain extends BaseId, Pick<BaseTimeStamp, 'createdAt'> {
  user: UserDomain;
  role: RoleDomain;
}
