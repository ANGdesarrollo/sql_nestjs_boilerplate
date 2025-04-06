import { PermissionRepository } from './PermissionRepository';
import { RoleRepository } from './RoleRepository';
import { UserPermissionRepository } from './UserPermissionRepository';
import { UserRepository } from './UserRepository';
import { UserRoleRepository } from './UserRoleRepository';

export const AuthRepositories = [
  UserRepository,
  RoleRepository,
  PermissionRepository,
  UserRoleRepository,
  UserPermissionRepository
];
