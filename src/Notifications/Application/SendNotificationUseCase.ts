import { Injectable } from '@nestjs/common';

import { NotificationType } from '../Domain/NotificationType';
import { EmailService } from '../Domain/Services/EmailService';
import { NotificationStrategyFactory } from '../Domain/Strategies/NotificationStrategyFactory';
import { StrategyMap } from '../Domain/StrategyMap';

@Injectable()
export class SendNotificationUseCase
{
  constructor(
    private readonly strategyFactory: NotificationStrategyFactory,
    private readonly emailSender: EmailService
  ) {}

  async execute<K extends NotificationType>(
    type: K,
    data: StrategyMap[K]
  ): Promise<void>
  {
    const strategy = this.strategyFactory.getStrategy(type);
    await this.emailSender.send({
      to: strategy.getRecipients(data),
      subject: strategy.buildSubject(data),
      body: strategy.buildBody(data)
    });
  }
}
