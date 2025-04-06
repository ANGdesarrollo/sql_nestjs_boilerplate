import { Permissions, getAllPermissions, getPermissionsByEntity } from './Permissions';

export const Roles = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest'
};

export const RolePermissions = {
  [Roles.SUPER_ADMIN]: getAllPermissions(),

  [Roles.ADMIN]: [
    ...getPermissionsByEntity('USER'),

    Permissions.ROLE.READ,
    Permissions.ROLE.LIST,
    Permissions.ROLE.ASSIGN,

    Permissions.PERMISSION.READ,
    Permissions.PERMISSION.LIST,

    ...getPermissionsByEntity('AUTH')
  ],

  [Roles.USER]: [
    Permissions.USER.READ,
    Permissions.USER.UPDATE,

    Permissions.AUTH.LOGIN,
    Permissions.AUTH.LOGOUT,
    Permissions.AUTH.CHANGE_PASSWORD
  ],

  [Roles.GUEST]: [
    Permissions.AUTH.LOGIN,
    Permissions.AUTH.REGISTER
  ]
};

export const getRolePermissions = (role: string): string[] =>
{
  return RolePermissions[role] || [];
};

export const getRoleDescriptions = (): Record<string, string> =>
{
  return {
    [Roles.SUPER_ADMIN]: 'Acceso completo a todas las funcionalidades del sistema',
    [Roles.ADMIN]: 'Administrador con acceso a la mayoría de funcionalidades excepto algunas críticas',
    [Roles.USER]: 'Usuario estándar con acceso limitado',
    [Roles.GUEST]: 'Usuario no autenticado con acceso mínimo'
  };
};

export const getDefaultRoles = () =>
{
  return Object.values(Roles).map(roleName => ({
    name: roleName,
    description: getRoleDescriptions()[roleName],
    permissions: getRolePermissions(roleName)
  }));
};
