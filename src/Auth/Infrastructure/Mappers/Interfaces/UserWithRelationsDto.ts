import { UserPermissionEntity } from '../../Schemas/UserPermissionSchema';
import { UserRoleEntity } from '../../Schemas/UserRoleSchema';
import { UserTenantEntity } from '../../Schemas/UserTenantSchema';

export interface UserWithRelationsDto {
  id: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  roles: UserRoleEntity[];
  permissions: UserPermissionEntity[];
  tenants: UserTenantEntity[];
}
