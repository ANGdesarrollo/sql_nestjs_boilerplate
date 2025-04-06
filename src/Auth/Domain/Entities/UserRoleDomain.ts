import { BaseId } from 'src/Shared/Domain/Entities/BaseId';

import { BaseTimeStamp } from '../../../Shared/Domain/Entities/BaseTimeStamp';
import { UserRolePayload } from '../Payloads/UserRolePayload';

export interface UserRoleDomain extends UserRolePayload, BaseId, Pick<BaseTimeStamp, 'createdAt'> {}
