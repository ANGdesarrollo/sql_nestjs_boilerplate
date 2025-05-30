import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { addHours } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import { PasswordRecoveryEvent } from '../../Shared/Events/Auth/PasswordRecovery/PasswordRecoveryEvent';
import { Event } from '../../Shared/Events/Event';
import { Validator } from '../../Shared/Presentation/Validations/Validator';
import { RequestPasswordRecoveryPayload } from '../Domain/Payloads/RequestPasswordRecoveryPayload';
import { PasswordRecoveryTokenRepository } from '../Infrastructure/Repositories/PasswordRecoveryTokenRepository';
import { UserRepository } from '../Infrastructure/Repositories/UserRepository';
import { RequestPasswordRecoveryValidator } from '../Presentation/Validations/RequestPasswordRecoveryValidator';


@Injectable()
export class RequestPasswordRecoveryUseCase extends Validator<RequestPasswordRecoveryPayload>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: PasswordRecoveryTokenRepository,
    private readonly eventEmitter: EventEmitter2
  )
  {
    super(RequestPasswordRecoveryValidator);
  }

  async execute(email: string): Promise<void>
  {
    const { email: validatedEmail } = this.validate({ email });

    const user = await this.userRepository.findOneBy({ username : validatedEmail });

    if (!user)
    {
      throw new NotFoundException('User not found');
    }

    await this.tokenRepository.invalidateUserTokens(user.id);

    const token = uuidv4();
    const expiresAt = addHours(new Date(), 24);

    await this.tokenRepository.create({
      token,
      userId: user.id,
      expiresAt,
      isUsed: false
    });

    this.eventEmitter.emit(
      Event.AUTH_PASSWORD_RECOVERY_REQUESTED,
      new PasswordRecoveryEvent(user.username, token, expiresAt)
    );
  }
}
