import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Validator } from '../../Shared/Presentation/Validations/Validator';
import { JwtPayload } from '../Domain/Payloads/JwtPayload';
import { LoginUserPayload } from '../Domain/Payloads/LoginUserPayload';
import { HashService } from '../Domain/Services/HashService';
import { UserRepository } from '../Infrastructure/Repositories/UserRepository';
import { UserTenantRepository } from '../Infrastructure/Repositories/UserTenantRepository';
import { LoginUserValidator } from '../Presentation/Validations/LoginUserValidator';


@Injectable()
export class LoginUserUseCase extends Validator<LoginUserPayload>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userTenantRepository: UserTenantRepository,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService
  )
  {
    super(LoginUserValidator);
  }

  async execute(body: LoginUserPayload)
  {
    const validatedBody = this.validate(body);

    const user = await this.findUser(validatedBody.username);
    await this.comparePassword(user.password, validatedBody.password);

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
    const user = await this.userRepository.findOneBy({ username });
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
