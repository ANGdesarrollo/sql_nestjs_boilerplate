import { Module } from '@nestjs/common';

import { SendNotificationUseCase } from './Application/SendNotificationUseCase';
import { EmailService } from './Domain/Services/EmailService';
import { NodemailerEmailServiceImpl } from './Domain/Services/NodemailerEmailServiceImpl';
import { ExampleNotificationStrategy } from './Domain/Strategies/ExampleNotificationStrategy';
import { NotificationStrategyFactory } from './Domain/Strategies/NotificationStrategyFactory';
import { NotificationTestController } from './Presentation/Controllers/NotificationPostController';

@Module({
  controllers: [NotificationTestController],
  providers: [
    ExampleNotificationStrategy,
    NotificationStrategyFactory,
    SendNotificationUseCase,
    {
      provide: EmailService,
      useClass: NodemailerEmailServiceImpl
    }
  ],
  exports: []
})
export class NotificationsModule {}
