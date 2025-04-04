import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

import { BaseTypeOrmRepositoryImpl } from '../../../Shared/Infrastructure/BaseTypeOrmRepositoryImpl';
import { RegisterUserPayload } from '../../Domain/Payloads/RegisterUserPayload';
import { UserEntity } from '../schemas/UserSchema';

@Injectable()
export class UserRepository extends BaseTypeOrmRepositoryImpl<RegisterUserPayload, UserEntity>
{
  constructor(
    @Inject('USER_REPOSITORY')
      userRepository: Repository<UserEntity>
  )
  {
    super(userRepository, 'UserEntity');
  }
}
