import { BaseId } from 'src/Shared/Domain/Entities/BaseId';
import { BaseTimeStamp } from '../../../Shared/Domain/Entities/BaseTimeStamp';
import { TenantPayload } from '../Payloads/TenantPayload';

export interface TenantDomain extends TenantPayload, BaseId, BaseTimeStamp {}
