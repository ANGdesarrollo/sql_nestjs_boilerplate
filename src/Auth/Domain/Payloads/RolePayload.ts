import { PermissionDomain } from '../Entities/PermissionDomain';

export interface RolePayload
{
  name: string;
  description?: string;
  permissions: PermissionDomain[];
}
