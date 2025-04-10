import { Controller, Body, Param, Put, UseGuards } from '@nestjs/common';

import { Permissions } from '../../../Config/Permissions';
import { UpdateTenantUseCase } from '../../Application/UpdateTenantUseCase';
import { TenantPayload } from '../../Domain/Payloads/TenantPayload';
import { RequirePermissions } from '../Decorators/RequirePermissions';
import { AuthGuard } from '../Guards/AuthGuard';
import { UpdateTenantPayload } from '../../Domain/Payloads/UpdateTenantPayload';

@Controller('auth')
export class AuthUpdateController
{
  constructor(
    private readonly updateTenantUseCase: UpdateTenantUseCase
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
}
