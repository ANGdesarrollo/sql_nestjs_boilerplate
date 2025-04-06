import { BaseId } from 'src/Shared/Domain/Entities/BaseId';

import { BaseTimeStamp } from '../../../Shared/Domain/Entities/BaseTimeStamp';
import { UserPermissionPayload } from '../Payloads/UserPermissionPayload';

export interface UserPermissionDomain extends UserPermissionPayload, BaseId, Pick<BaseTimeStamp, 'createdAt'> {}
