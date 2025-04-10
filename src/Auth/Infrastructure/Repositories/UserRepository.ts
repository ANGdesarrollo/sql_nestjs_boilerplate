import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

import { BaseTypeOrmRepositoryImpl } from '../../../Shared/Infrastructure/BaseTypeOrmRepositoryImpl';
import { UserDomain } from '../../Domain/Entities/UserDomain';
import { UserPayload } from '../../Domain/Payloads/UserPayload';
import { UserMapper } from '../Mappers/UserMapper';
import { UserEntity } from '../Schemas/UserSchema';

type UserTable = UserEntity & UserDomain;

@Injectable()
export class UserRepository extends BaseTypeOrmRepositoryImpl<UserPayload, UserTable>
{
  constructor(
    @Inject('USER_REPOSITORY')
      userRepository: Repository<UserTable>
  )
  {
    super(userRepository, 'UserEntity');
  }

  async findUserWithRelations(userId: string): Promise<UserDomain>
  {
    const userWithRelations = await this.repository.findOne({
      where: { id: userId },
      relations: [
        'roles',
        'roles.role',
        'roles.role.permissions',
        'permissions',
        'permissions.permission',
        'tenants',
        'tenants.tenant'
      ]
    });

    if (!userWithRelations)
    {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return UserMapper.toDomain(userWithRelations);
  }
}
