import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { LoginUserPayload } from '../Domain/Payloads/LoginUserPayload';
import { HashService } from '../Domain/Services/HashService';
import { UserRepository } from '../Infrastructure/repositories/UserRepository';
import { UserRoleRepository } from '../Infrastructure/repositories/UserRoleRepository';
import { UserTenantRepository } from '../Infrastructure/repositories/UserTenantRepository';

interface JwtPayload {
  username: string;
  userId: string;
  tenantId: string;
  permissions: string[];
}

@Injectable()
export class LoginUserUseCase
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userRoleRepository: UserRoleRepository,
    private readonly userTenantRepository: UserTenantRepository,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService
  ) {}

  async execute(body: LoginUserPayload)
  {
    const user = await this.findUser(body.username);
    await this.comparePassword(user.password, body.password);

    const defaultUserTenant = await this.userTenantRepository.getDefaultTenant(user.id);
    if (!defaultUserTenant)
    {
      throw new UnauthorizedException('User does not have a default tenant');
    }

    const userRoles = await this.userRoleRepository.getUserRoles(user.id);
    const permissions = new Set<string>();

    userRoles.forEach(userRole =>
    {
      userRole.role.permissions.forEach(permission =>
      {
        permissions.add(permission.name);
      });
    });

    const payload: JwtPayload = {
      username: user.username,
      userId: user.id,
      tenantId: defaultUserTenant.tenant.id,
      permissions: Array.from(permissions)
    };

    return this.jwtService.sign(payload);
  }

  private async findUser(username: string)
  {
    const user = await this.userRepository.findOneBy('username', username);
    if (!user)
    {
      throw new UnauthorizedException('User or password incorrect');
    }

    return user;
  }

  private async comparePassword(passwordStored: string, password: string)
  {
    const isPasswordCorrect = await this.hashService.compare(password, passwordStored);

    if (!isPasswordCorrect)
    {
      throw new UnauthorizedException('User or password incorrect');
    }

    return isPasswordCorrect;
  }
}
