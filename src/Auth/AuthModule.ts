// src/Auth/AuthModule.ts
import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { LoginUserUseCase } from './Application/LoginUserUseCase';
import { RegisterUserUseCase } from './Application/RegisterUserUseCase';
import { UpdateUserUseCase } from './Application/UpdateUserUseCase';
import { UserRepository } from './Infrastructure/repositories/UserRepository';
import { UserEntity } from './Infrastructure/schemas/UserSchema';
import { AuthControllers } from './Presentation/Controllers';

@Module({
  imports: [],
  controllers: [...AuthControllers],
  providers: [
    UserRepository,
    RegisterUserUseCase,
    LoginUserUseCase,
    UpdateUserUseCase,
    {
      provide: 'USER_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(UserEntity),
      inject: ['DATA_SOURCE']
    }
  ],
  exports: [UserRepository]
})
export class AuthModule {}
