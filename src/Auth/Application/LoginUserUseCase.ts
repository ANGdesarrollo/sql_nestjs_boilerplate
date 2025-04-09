import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtPayload } from '../Domain/Payloads/JwtPayload';
import { LoginUserPayload } from '../Domain/Payloads/LoginUserPayload';
import { HashService } from '../Domain/Services/HashService';
import { UserRepository } from '../Infrastructure/repositories/UserRepository';
import { UserTenantRepository } from '../Infrastructure/repositories/UserTenantRepository';

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
    console.log("llegue", password, passwordStored);
    const isPasswordCorrect = await this.hashService.compare(password, passwordStored);

    if (!isPasswordCorrect)
    {
      console.log("entre al expception");
      throw new UnauthorizedException('User or password incorrect');
    }

    return isPasswordCorrect;
  }
}
