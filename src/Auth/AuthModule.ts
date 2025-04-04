// src/Auth/AuthModule.ts
import { Module } from '@nestjs/common';

import { LoginUserUseCase } from './Application/LoginUserUseCase';
import { RegisterUserUseCase } from './Application/RegisterUserUseCase';
import { UpdateUserUseCase } from './Application/UpdateUserUseCase';
import { UserRepository } from './Infrastructure/repositories/UserRepository';
import { AuthControllers } from './Presentation/Controllers';

@Module({
  imports: [],
  controllers: [...AuthControllers],
  providers: [
    UserRepository,
    RegisterUserUseCase,
    LoginUserUseCase,
    UpdateUserUseCase
  ],
  exports: [UserRepository]
})
export class AuthModule {}
