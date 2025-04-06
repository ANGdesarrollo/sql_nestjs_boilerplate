import { Controller, Post, Body, HttpCode, Res } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { EnvService } from '../../../Config/Env/EnvService';
import { LoginUserUseCase } from '../../Application/LoginUserUseCase';
import { CreateUserUseCase } from '../../Application/CreateUserUseCase';
import { LoginUserPayload } from '../../Domain/Payloads/LoginUserPayload';
import { RegisterUserPayload } from '../../Domain/Payloads/RegisterUserPayload';
import { JwtGuard } from '../Guards/JwtGuard';
import { UserTransformer } from '../Transformers/UserTransformer';

@Controller('auth')
export class AuthPostController
{
  constructor(
    private readonly registerUserUseCase: CreateUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly configService: EnvService
  ) {}

  @UseGuards(JwtGuard)
  @Post('register')
  @HttpCode(201)
  async register(@Body() body: RegisterUserPayload)
  {
    return new UserTransformer(await this.registerUserUseCase.execute(body));
  }

  // En AuthPostController.ts
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() body: LoginUserPayload,
    @Res({ passthrough: true }) res: FastifyReply
  )
  {
    const data = await this.loginUserUseCase.execute(body);

    (res as any).setCookie('user_token', data, {
      httpOnly: true,
      path: '/',
      expires: new Date(Date.now() + this.configService.cookie.expiration),
      secure: this.configService.isProduction
    });
    return { message: 'Logged in successfully' };
  }
}
