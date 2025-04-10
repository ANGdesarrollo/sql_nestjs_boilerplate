import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtPayload } from '../Domain/Payloads/JwtPayload';
import { LoginUserPayload } from '../Domain/Payloads/LoginUserPayload';
import { HashService } from '../Domain/Services/HashService';
import { UserRepository } from '../Infrastructure/Repositories/UserRepository';
import { UserTenantRepository } from '../Infrastructure/Repositories/UserTenantRepository';
import { Logger } from '../../Shared/Presentation/Utils/Logger';

@Injectable()
export class LoginUserUseCase
{
  constructor(
    private readonly userRepository: UserRepository,
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

    const payload: JwtPayload = {
      userId: user.id,
      tenantId: defaultUserTenant.tenant.id
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
