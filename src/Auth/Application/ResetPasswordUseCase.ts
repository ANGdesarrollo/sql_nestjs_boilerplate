import { BadRequestException, Injectable } from '@nestjs/common';
import { isBefore } from 'date-fns';

import { Validator } from '../../Shared/Presentation/Validations/Validator';
import { ResetPasswordPayload } from '../Domain/Payloads/ResetPasswordPayload';
import { HashService } from '../Domain/Services/HashService';
import { PasswordRecoveryTokenRepository } from '../Infrastructure/Repositories/PasswordRecoveryTokenRepository';
import { UserRepository } from '../Infrastructure/Repositories/UserRepository';
import { ResetPasswordValidator } from '../Presentation/Validations/ResetPasswordValidator';


@Injectable()
export class ResetPasswordUseCase extends Validator<ResetPasswordPayload>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: PasswordRecoveryTokenRepository,
    private readonly hashService: HashService
  )
  {
    super(ResetPasswordValidator);
  }

  async execute(params: ResetPasswordPayload): Promise<void>
  {
    const { token, password } = this.validate(params);

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
