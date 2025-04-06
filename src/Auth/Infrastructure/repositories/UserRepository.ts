import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

import { BaseTypeOrmRepositoryImpl } from '../../../Shared/Infrastructure/BaseTypeOrmRepositoryImpl';
import { UserDomain } from '../../Domain/Entities/UserDomain';
import { UserPayload } from '../../Domain/Payloads/UserPayload';

@Injectable()
export class UserRepository extends BaseTypeOrmRepositoryImpl<UserPayload, UserDomain>
{
  constructor(
    @Inject('USER_REPOSITORY')
      userRepository: Repository<UserDomain>
  )
  {
    super(userRepository, 'UserEntity');
  }
}
