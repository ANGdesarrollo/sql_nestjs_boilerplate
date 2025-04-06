import { BaseId } from 'src/Shared/Domain/Entities/BaseId';

import { PermissionDomain } from './PermissionDomain';
import { UserDomain } from './UserDomain';

export interface UserPermissionDomain extends BaseId {
  user: UserDomain;
  permission: PermissionDomain;
  createdAt: Date;
}
