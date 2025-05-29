import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { SendNotificationUseCase } from '../../../../Notifications/Application/SendNotificationUseCase';
import { NotificationType } from '../../../../Notifications/Domain/NotificationType';
import { Logger } from '../../../Presentation/Utils/Logger';
import { Event } from '../../Event';

import { PasswordRecoveryEvent } from './PasswordRecoveryEvent';

@Injectable()
export class PasswordRecoveryEventListener
{
  constructor(private readonly sendNotificationUseCase: SendNotificationUseCase) {}

  @OnEvent(Event.AUTH_PASSWORD_RECOVERY_REQUESTED)
  async handlePasswordRecoveryEvent(event: PasswordRecoveryEvent): Promise<void>
  {
    Logger.log(`Password recovery requested for user ${  event.email}`);
    await this.sendNotificationUseCase.execute(NotificationType.PASSWORD_RECOVERY, {
      userEmail: event.email,
      recoveryToken: event.token,
      expiresAt: event.expiresAt
    });
  }
}
