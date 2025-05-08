import { Body, Controller, Post } from '@nestjs/common';

import { SendNotificationUseCase } from '../../Application/SendNotificationUseCase';
import { NotificationType } from '../../Domain/NotificationType';


@Controller('notifications')
export class NotificationTestController
{
  constructor(private readonly sendNotificationUseCase: SendNotificationUseCase) {}

  @Post('send-email')
  async sendTestEmail(@Body() body: any = {})
  {
    await this.sendNotificationUseCase.execute(NotificationType.EXAMPLE_NOTIFICATION, {
      userEmail: body.email || 'test@test.com',
      message: body.message || 'Mensaje por defecto'
    });

    return { success: true, message: 'Email enviado' };
  }
}
