import { Controller, Post, Body, HttpCode, Res } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { LoginUserUseCase } from '../../Application/LoginUserUseCase';
import { RegisterUserUseCase } from '../../Application/RegisterUserUseCase';
import { LoginUserPayload } from '../../Domain/Payloads/LoginUserPayload';
import { RegisterUserPayload } from '../../Domain/Payloads/RegisterUserPayload';
import { JwtGuard } from '../Guards/JwtGuard';
import { UserTransformer } from '../Transformers/UserTransformer';


@Controller('auth')
export class AuthPostController
{
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase
  ) {}

  @UseGuards(JwtGuard)
  @Post('register')
  @HttpCode(201)
  async register(@Body() body: RegisterUserPayload)
  {
    return new UserTransformer(await this.registerUserUseCase.execute(body));
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: LoginUserPayload, @Res({ passthrough: true }) res: FastifyReply)
  {
    const data = await this.loginUserUseCase.execute(body);
    res.setCookie('user_token', data, {
      httpOnly: true,
      path: '/',
      expires: new Date(Date.now() + 3600000)
      // opcional: secure: true en producción
    });
    return { message: 'Logged in successfully' };
  }
}
