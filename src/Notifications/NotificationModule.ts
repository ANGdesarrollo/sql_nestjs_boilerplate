import { Global, Module } from '@nestjs/common';

import { SendNotificationUseCase } from './Application/SendNotificationUseCase';
import { EmailService } from './Domain/Services/EmailService';
import { NodemailerEmailServiceImpl } from './Domain/Services/NodemailerEmailServiceImpl';
import { ExampleNotificationStrategy } from './Domain/Strategies/ExampleNotificationStrategy';
import { NotificationStrategyFactory } from './Domain/Strategies/NotificationStrategyFactory';
import { PasswordRecoveryStrategy } from './Domain/Strategies/PasswordRecoveryStrategy';
import { NotificationTestController } from './Presentation/Controllers/NotificationPostController';

@Global()
@Module({
  controllers: [NotificationTestController],
  providers: [
    ExampleNotificationStrategy,
    NotificationStrategyFactory,
    SendNotificationUseCase,
    PasswordRecoveryStrategy,
    {
      provide: EmailService,
      useClass: NodemailerEmailServiceImpl
    }
  ],
  exports: []
})
export class NotificationsModule {}
