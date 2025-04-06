export const Permissions = {
  USER: {
    CREATE: 'user:create',
    READ: 'user:read',
    UPDATE: 'user:update',
    DELETE: 'user:delete',
    LIST: 'user:list'
  },

  ROLE: {
    CREATE: 'role:create',
    READ: 'role:read',
    UPDATE: 'role:update',
    DELETE: 'role:delete',
    LIST: 'role:list',
    ASSIGN: 'role:assign'
  },

  PERMISSION: {
    CREATE: 'permission:create',
    READ: 'permission:read',
    UPDATE: 'permission:update',
    DELETE: 'permission:delete',
    LIST: 'permission:list',
    ASSIGN: 'permission:assign'
  },

  AUTH: {
    LOGIN: 'auth:login',
    REGISTER: 'auth:register',
    LOGOUT: 'auth:logout',
    CHANGE_PASSWORD: 'auth:change-password'
  }
};

export const getAllPermissions = (): string[] =>
{
  const permissionsList: string[] = [];

  Object.values(Permissions).forEach((entityPermissions) =>
  {
    Object.values(entityPermissions).forEach((permission) =>
    {
      permissionsList.push(permission);
    });
  });

  return permissionsList;
};

// Función para obtener los permisos por entidad
export const getPermissionsByEntity = (entity: keyof typeof Permissions): string[] =>
{
  return Object.values(Permissions[entity]);
};
