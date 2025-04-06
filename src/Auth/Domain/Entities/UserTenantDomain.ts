import { BaseId } from 'src/Shared/Domain/Entities/BaseId';
import { BaseTimeStamp } from '../../../Shared/Domain/Entities/BaseTimeStamp';
import { UserTenantPayload } from '../Payloads/UserTenantPayload';

export interface UserTenantDomain extends UserTenantPayload, BaseId, Pick<BaseTimeStamp, 'createdAt'> {
  isDefault: boolean;
}
