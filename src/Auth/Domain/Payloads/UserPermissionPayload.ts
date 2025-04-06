import { PermissionDomain } from '../Entities/PermissionDomain';
import { UserDomain } from '../Entities/UserDomain';

export interface UserPermissionPayload {
  user: UserDomain;
  permission: PermissionDomain;
}
