import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';

import { Permissions } from '../../../Config/Permissions';
import { GetMeUseCase } from '../../Application/GetMeUseCase';
import { GetUserUseCase } from '../../Application/GetUserUseCase';
import { RequestWithUserPayload } from '../../Domain/Payloads/RequestWithUserPayload';
import { RequirePermissions } from '../Decorators/RequirePermissions';
import { AuthGuard } from '../Guards/AuthGuard';

@Controller('auth')
export class AuthGetController
{
  constructor(
    private readonly getUserUseCase: GetUserUseCase,
    private readonly getMeUseCase: GetMeUseCase
  ) {}
  @Get('users/:userId')
  @RequirePermissions(Permissions.USER.READ)
  async getUser(@Param('userId') userId: string)
  {
    return this.getUserUseCase.execute(userId);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@Req() request: RequestWithUserPayload)
  {
    return this.getMeUseCase.execute(request.user.userId);
  }
}
