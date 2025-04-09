import { BaseTimeStamp } from '../../../Shared/Domain/Entities/BaseTimeStamp';
import { UserRolePayload } from '../Payloads/UserRolePayload';

export interface UserRoleDomain extends UserRolePayload, Pick<BaseTimeStamp, 'createdAt'> {}
