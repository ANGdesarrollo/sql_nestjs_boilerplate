import { BaseId } from 'src/Shared/Domain/Entities/BaseId';

import { BaseTimeStamp } from '../../../Shared/Domain/Entities/BaseTimeStamp';

import { PermissionDomain } from './PermissionDomain';

export interface RoleDomain extends BaseId, BaseTimeStamp {
  name: string;
  description?: string;
  permissions: PermissionDomain[];
}
