import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

import { BaseTypeOrmRepositoryImpl } from '../../../Shared/Infrastructure/BaseTypeOrmRepositoryImpl';
import { UserDomain } from '../../Domain/Entities/UserDomain';

@Injectable()
export class UserRepository extends BaseTypeOrmRepositoryImpl<Partial<UserDomain>, UserDomain>
{
  constructor(
    @Inject('USER_REPOSITORY')
      userRepository: Repository<UserDomain>
  )
  {
    super(userRepository, 'UserEntity');
  }
}
