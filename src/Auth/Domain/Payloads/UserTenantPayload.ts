import { TenantDomain } from '../Entities/TenantDomain';
import { UserDomain } from '../Entities/UserDomain';

export interface UserTenantPayload {
  user: UserDomain;
  tenant: TenantDomain;
  isDefault?: boolean;
}
