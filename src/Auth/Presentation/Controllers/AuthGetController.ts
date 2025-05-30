import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';

import { Permissions } from '../../../Config/Permissions';
import { Criteria } from '../../../Shared/Presentation/Decorators/Criteria';
import { GetMeUseCase } from '../../Application/GetMeUseCase';
import { GetUserUseCase } from '../../Application/GetUserUseCase';
import { ListRolesUseCase } from '../../Application/ListRolesUseCase';
import { ListTenantsUseCase } from '../../Application/ListTenantsUseCase';
import { ListUsersUseCase } from '../../Application/ListUsersUseCase';
import { RequestWithUserPayload } from '../../Domain/Payloads/RequestWithUserPayload';
import { TenantCriteria } from '../Criteria/TenantCriteria';
import { UserCriteria } from '../Criteria/UserCriteria';
import { RequirePermissions } from '../Decorators/RequirePermissions';
import { AuthGuard } from '../Guards/AuthGuard';

@Controller('auth')
export class AuthGetController
{
  constructor(
    private readonly getUserUseCase: GetUserUseCase,
    private readonly getMeUseCase: GetMeUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly listTenantsUseCase: ListTenantsUseCase,
    private readonly listRolesUseCase: ListRolesUseCase
  ) {}

  @Get('users')
  @UseGuards(AuthGuard)
  @RequirePermissions(Permissions.USER.LIST)
  async listUsers(@Criteria(UserCriteria) criteria: UserCriteria)
  {
    return this.listUsersUseCase.execute(criteria);
  }

  @Get('users/:userId')
  @UseGuards(AuthGuard)
  @RequirePermissions(Permissions.USER.READ)
  async getUser(@Param('userId') userId: number)
  {
    return this.getUserUseCase.execute(userId);
  }

  @Get('tenants')
  @UseGuards(AuthGuard)
  @RequirePermissions(Permissions.TENANT.LIST)
  async listTenants(@Criteria(TenantCriteria) criteria: TenantCriteria)
  {
    return this.listTenantsUseCase.execute(criteria);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@Req() request: RequestWithUserPayload)
  {
    return this.getMeUseCase.execute(request.user.userId);
  }

  @Get('roles')
  @UseGuards(AuthGuard)
  @RequirePermissions(Permissions.ROLE.LIST)
  async listRoles()
  {
    return this.listRolesUseCase.execute();
  }
}
