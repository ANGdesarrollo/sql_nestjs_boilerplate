import { Controller, Post, Body, HttpCode, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { EnvService } from '../../../Config/Env/EnvService';
import { Permissions } from '../../../Config/Permissions';
import { CreateTenantUseCase } from '../../Application/CreateTenantUseCase';
import { CreateUserUseCase } from '../../Application/CreateUserUseCase';
import { LoginUserUseCase } from '../../Application/LoginUserUseCase';
import { CreateUserPayload } from '../../Domain/Payloads/CreateUserPayload';
import { LoginUserPayload } from '../../Domain/Payloads/LoginUserPayload';
import { TenantPayload } from '../../Domain/Payloads/TenantPayload';
import { RequirePermissions } from '../Decorators/RequirePermissions';
import { AuthGuard } from '../Guards/AuthGuard';

@Controller('auth')
export class AuthPostController
{
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly createTenantUseCase: CreateTenantUseCase,
    private readonly configService: EnvService
  ) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() body: LoginUserPayload,
    @Res({ passthrough: true }) res: FastifyReply
  )
  {
    const token = await this.loginUserUseCase.execute(body);

    (res as any).setCookie('user_token', token, {
      httpOnly: true,
      path: '/',
      expires: new Date(Date.now() + this.configService.cookie.expiration),
      secure: this.configService.isProduction
    });
  }

  @Post('create')
  @UseGuards(AuthGuard)
  @RequirePermissions(Permissions.USER.CREATE)
  @HttpCode(201)
  async createUser(@Body() body: CreateUserPayload)
  {
    await this.createUserUseCase.execute(body);
    return { message: 'User created successfully' };
  }

  @Post('tenant')
  @UseGuards(AuthGuard)
  @RequirePermissions(Permissions.TENANT.CREATE)
  @HttpCode(201)
  async createTenant(@Body() body: TenantPayload)
  {
    return this.createTenantUseCase.execute(body);
  }
}
