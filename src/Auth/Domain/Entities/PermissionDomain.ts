import { BaseId } from 'src/Shared/Domain/Entities/BaseId';

import { BaseTimeStamp } from '../../../Shared/Domain/Entities/BaseTimeStamp';
import { PermissionPayload } from '../Payloads/PermissionPayload';

export interface PermissionDomain extends PermissionPayload, BaseId, BaseTimeStamp {}
