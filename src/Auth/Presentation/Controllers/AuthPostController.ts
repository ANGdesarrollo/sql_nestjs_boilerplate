import { Controller, Post, Body, HttpCode } from '@nestjs/common';

import { LoginUserUseCase } from '../../Application/LoginUserUseCase';
import { RegisterUserUseCase } from '../../Application/RegisterUserUseCase';
import { RegisterUserPayload } from '../../Domain/Payloads/RegisterUserPayload';

@Controller('auth')
export class AuthPostController
{
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase
  ) {}

  @Post('register')
  @HttpCode(201)
  async register(@Body() body: RegisterUserPayload)
  {
    return await this.registerUserUseCase.execute(body);
  }

  // @Post('login')
  // @HttpCode(200)
  // async login(@Body() body: unknown) {
  //   return await this.loginUserUseCase.execute(body);
  // }
}
