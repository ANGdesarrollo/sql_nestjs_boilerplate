import { Injectable } from '@nestjs/common';

import { NotificationStrategy } from '../NotificationStrategy';
import { NotificationType } from '../NotificationType';
import { StrategyMap } from '../StrategyMap';

import { ExampleNotificationStrategy } from './ExampleNotificationStrategy';
import { PasswordRecoveryStrategy } from './PasswordRecoveryStrategy';

@Injectable()
export class NotificationStrategyFactory
{
  constructor(
    private readonly exampleNotificationStrategy: ExampleNotificationStrategy,
    private readonly passwordRecoveryStrategy: PasswordRecoveryStrategy
  ) {}

  getStrategy<K extends keyof StrategyMap>(
    type: K
  ): NotificationStrategy<StrategyMap[K]>
  {
    switch (type)
    {
      case NotificationType.EXAMPLE_NOTIFICATION:
        return this.exampleNotificationStrategy as NotificationStrategy<StrategyMap[K]>;
      case NotificationType.PASSWORD_RECOVERY:
        return this.passwordRecoveryStrategy as NotificationStrategy<StrategyMap[K]>;
      default:
        throw new Error(`No strategy for notification type: ${type}`);
    }
  }
}
