import { Controller, Get, Param } from '@nestjs/common';

import { Permissions } from '../../../Config/Permissions';
import { GetUserUseCase } from '../../Application/GetUserUseCase';
import { RequirePermissions } from '../Decorators/RequirePermissions';

@Controller('auth')
export class AuthGetController
{
  constructor(
    private readonly getUserUseCase: GetUserUseCase
  ) {}
  @Get('users/:userId')
  @RequirePermissions(Permissions.USER.READ)
  async getUser(@Param('userId') userId: string)
  {
    return this.getUserUseCase.execute(userId);
  }
}
