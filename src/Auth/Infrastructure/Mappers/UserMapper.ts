import { UserDomain } from '../../Domain/Entities/UserDomain';

import { UserWithRelationsDto } from './Interfaces/UserWithRelationsDto';

export class UserMapper
{
  static toDomain(userEntity: UserWithRelationsDto): UserDomain
  {
    return {
      id: userEntity.id,
      username: userEntity.username,
      password: userEntity.password,
      createdAt: userEntity.createdAt,
      updatedAt: userEntity.updatedAt,
      roles: userEntity.roles?.map(ur => ur.role) || [],
      permissions: [
        ...(userEntity.permissions?.map(up => up.permission) || []),
        ...(userEntity.roles?.flatMap(ur => ur.role.permissions) || [])
      ],
      tenants: userEntity.tenants?.map(ut => ({
        ...ut.tenant,
        isDefault: ut.isDefault
      })) || []
    };
  }
}
