import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { LoginUserPayload } from '../Domain/Payloads/LoginUserPayload';
import { HashService } from '../Domain/Services/HashService';
import { UserRepository } from '../Infrastructure/repositories/UserRepository';

@Injectable ()
export class LoginUserUseCase
{
  constructor(
    private readonly repository: UserRepository,
    private readonly  jwtService: JwtService,
    private readonly hashService: HashService
  ) {}

  async execute(body: LoginUserPayload)
  {
    const user = await this.findUser(body.username);

    await this.comparePassword(user.password, body.password);

    return this.jwtService.sign(body);
  }

  private async findUser(username: string)
  {
    const user = await this.repository.findOneBy('username', username);
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
