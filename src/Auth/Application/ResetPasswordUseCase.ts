import { Injectable, BadRequestException } from '@nestjs/common';
import { isBefore } from 'date-fns';

import { HashService } from '../Domain/Services/HashService';
import { PasswordRecoveryTokenRepository } from '../Infrastructure/Repositories/PasswordRecoveryTokenRepository';
import { UserRepository } from '../Infrastructure/Repositories/UserRepository';

interface ResetPasswordParams {
  token: string;
  password: string;
}

@Injectable()
export class ResetPasswordUseCase
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: PasswordRecoveryTokenRepository,
    private readonly hashService: HashService
  ) {}

  async execute({ token, password }: ResetPasswordParams): Promise<void>
  {
    // Find the token
    const recoveryToken = await this.tokenRepository.findByToken(token);

    if (!recoveryToken)
    {
      throw new BadRequestException('Invalid or expired token');
    }

    if (recoveryToken.isUsed)
    {
      throw new BadRequestException('Token has already been used');
    }

    if (isBefore(recoveryToken.expiresAt, new Date()))
    {
      throw new BadRequestException('Token has expired');
    }

    const hashedPassword = await this.hashService.hash(password);

    await this.userRepository.update(recoveryToken.userId, {
      password: hashedPassword
    });

    await this.tokenRepository.markAsUsed(recoveryToken.id);
  }
}
