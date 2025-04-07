import { Controller, Body, Param, Put, UseGuards } from '@nestjs/common';

import { Permissions } from '../../../Config/Permissions';
import { UpdateTenantUseCase } from '../../Application/UpdateTenantUseCase';
import { TenantPayload } from '../../Domain/Payloads/TenantPayload';
import { RequirePermissions } from '../Decorators/RequirePermissions';
import { AuthGuard } from '../Guards/AuthGuard';

@Controller('auth')
export class AuthUpdateController
{
  constructor(
    private readonly updateTenantUseCase: UpdateTenantUseCase
  ) {}

  @Put('tenant/:id')
  @UseGuards(AuthGuard)
  @RequirePermissions(Permissions.TENANT.UPDATE)
  async updateTenant(
    @Param('id') id: string,
    @Body() body: Partial<TenantPayload>
  )
  {
    return this.updateTenantUseCase.execute({ id, data: body });
  }
}
