import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { addHours } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

import { PasswordRecoveryEvent } from '../../Shared/Events/Auth/PasswordRecovery/PasswordRecoveryEvent';
import { Logger } from '../../Shared/Presentation/Utils/Logger';
import { PasswordRecoveryTokenRepository } from '../Infrastructure/Repositories/PasswordRecoveryTokenRepository';
import { UserRepository } from '../Infrastructure/Repositories/UserRepository';

@Injectable()
export class RequestPasswordRecoveryUseCase
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: PasswordRecoveryTokenRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(email: string): Promise<void>
  {
    const user = await this.userRepository.findOneBy('username', email);

    if (!user)
    {
      throw new NotFoundException('User not found');
    }

    await this.tokenRepository.invalidateUserTokens(user.id);

    const token = uuidv4();
    const expiresAt = addHours(new Date(), 24); // Token valid for 24 hours

    await this.tokenRepository.create({
      token,
      userId: user.id,
      expiresAt,
      isUsed: false
    });

    this.eventEmitter.emit(
      'auth.password.recovery.requested',
      new PasswordRecoveryEvent(user.username, token, expiresAt)
    );
  }
}
