import { Controller, Post, Body, HttpCode, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { EnvService } from '../../../Config/Env/EnvService';
import { Permissions } from '../../../Config/Permissions';
import { CreateUserUseCase } from '../../Application/CreateUserUseCase';
import { LoginUserUseCase } from '../../Application/LoginUserUseCase';
import { CreateUserPayload } from '../../Domain/Payloads/CreateUserPayload';
import { LoginUserPayload } from '../../Domain/Payloads/LoginUserPayload';
// Ahora importamos RequirePermissions desde el mismo archivo que AuthGuard
import { AuthGuard, RequirePermissions } from '../Guards/AuthGuard';

@Controller('auth')
export class AuthPostController
{
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly configService: EnvService
  ) {}

  @UseGuards(AuthGuard)
  @RequirePermissions(Permissions.USER.CREATE)
  @Post('create')
  @HttpCode(201)
  async createUser(@Body() body: CreateUserPayload)
  {
    return this.createUserUseCase.execute(body);
  }

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
