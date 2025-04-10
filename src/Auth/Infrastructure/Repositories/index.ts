import { PermissionRepository } from './PermissionRepository';
import { RoleRepository } from './RoleRepository';
import { TenantRepository } from './TenantRepository';
import { UserPermissionRepository } from './UserPermissionRepository';
import { UserRepository } from './UserRepository';
import { UserRoleRepository } from './UserRoleRepository';
import { UserTenantRepository } from './UserTenantRepository';

export const AuthRepositories = [
  UserRepository,
  RoleRepository,
  PermissionRepository,
  UserRoleRepository,
  UserPermissionRepository,
  TenantRepository,
  UserTenantRepository
];
