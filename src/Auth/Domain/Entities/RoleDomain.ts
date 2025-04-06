import { BaseId } from 'src/Shared/Domain/Entities/BaseId';

import { BaseTimeStamp } from '../../../Shared/Domain/Entities/BaseTimeStamp';
import { RolePayload } from '../Payloads/RolePayload';

export interface RoleDomain extends RolePayload, BaseId, BaseTimeStamp {}
