import { BaseId } from 'src/Shared/Domain/Entities/BaseId';

import { BaseTimeStamp } from '../../../Shared/Domain/Entities/BaseTimeStamp';

export interface UserDomain extends BaseId, BaseTimeStamp {
  username: string;
  password: string;
}
