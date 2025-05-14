import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';

import { Permissions } from '../../../Config/Permissions';
import { Criteria } from '../../../Shared/Presentation/Decorators/Criteria';
import { GetMeUseCase } from '../../Application/GetMeUseCase';
import { GetUserUseCase } from '../../Application/GetUserUseCase';
import { ListTenantsUseCase } from '../../Application/ListTenantsUseCase';
import { ListUsersUseCase } from '../../Application/ListUsersUseCase';
import { RequestWithUserPayload } from '../../Domain/Payloads/RequestWithUserPayload';
import { UserRoleRepository } from '../../Infrastructure/Repositories/UserRoleRepository';
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
    private readonly repository: UserRoleRepository,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly listTenantsUseCase: ListTenantsUseCase
  ) {}

  @Get('users')
  @RequirePermissions(Permissions.USER.LIST)
  async listUsers(@Criteria(UserCriteria) criteria: UserCriteria)
  {
    return this.listUsersUseCase.execute(criteria);
  }

  @Get('users/:userId')
  @RequirePermissions(Permissions.USER.READ)
  async getUser(@Param('userId') userId: string)
  {
    return this.getUserUseCase.execute(userId);
  }

  @Get('tenants')
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

  @Get('test')
  @UseGuards(AuthGuard)
  async test(@Req() request: RequestWithUserPayload)
  {
    return this.repository.getUserRoles(request.user.userId);
  }
}
