import { RoleDomain } from '../Entities/RoleDomain';
import { UserDomain } from '../Entities/UserDomain';

export interface UserRolePayload {
  user: UserDomain;
  role: RoleDomain;
}
