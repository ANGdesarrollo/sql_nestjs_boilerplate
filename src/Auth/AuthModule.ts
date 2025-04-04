// src/Auth/AuthModule.ts
import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { AuthUseCases } from './Application';
import { UserRepository } from './Infrastructure/repositories/UserRepository';
import { UserEntity } from './Infrastructure/schemas/UserSchema';
import { AuthControllers } from './Presentation/Controllers';

@Module({
  imports: [],
  controllers: [...AuthControllers],
  providers: [
    ...AuthUseCases,
    UserRepository,
    {
      provide: 'USER_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(UserEntity),
      inject: ['DATA_SOURCE']
    }
  ]
})
export class AuthModule {}
