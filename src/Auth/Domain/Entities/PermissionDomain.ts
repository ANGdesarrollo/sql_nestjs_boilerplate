import { BaseId } from 'src/Shared/Domain/Entities/BaseId';

import { BaseTimeStamp } from '../../../Shared/Domain/Entities/BaseTimeStamp';

export interface PermissionDomain extends BaseId, BaseTimeStamp {
  name: string;
  description?: string;
}
