import { Controller, Body, Put, UseGuards } from '@nestjs/common';

import { Permissions } from '../../../Config/Permissions';
import { UpdateTenantUseCase } from '../../Application/UpdateTenantUseCase';
import { UpdateUserUseCase } from '../../Application/UpdateUserUseCase';
import { UpdateTenantPayload } from '../../Domain/Payloads/UpdateTenantPayload';
import { UpdateUserPayload } from '../../Domain/Payloads/UpdateUserPayload';
import { RequirePermissions } from '../Decorators/RequirePermissions';
import { AuthGuard } from '../Guards/AuthGuard';

@Controller('auth')
export class AuthUpdateController
{
  constructor(
    private readonly updateTenantUseCase: UpdateTenantUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase
  ) {}

  @Put('tenant')
  @UseGuards(AuthGuard)
  @RequirePermissions(Permissions.TENANT.UPDATE)
  async updateTenant(
    @Body() body: UpdateTenantPayload
  )
  {
    return this.updateTenantUseCase.execute(body);
  }

  @Put('user')
  @UseGuards(AuthGuard)
  @RequirePermissions(Permissions.USER.UPDATE)
  async updateUser(
    @Body() body: UpdateUserPayload
  )
  {
    return this.updateUserUseCase.execute(body);
  }
}
