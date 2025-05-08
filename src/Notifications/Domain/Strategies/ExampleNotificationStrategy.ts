import { Injectable } from '@nestjs/common';

import { NotificationStrategy } from '../NotificationStrategy';
import { ExampleNotificationPayload } from '../Payloads/ExampleNotificationPayload';

@Injectable()
export class ExampleNotificationStrategy
implements NotificationStrategy<ExampleNotificationPayload>
{
  buildSubject(data: ExampleNotificationPayload): string
  {
    return '📬 Notificación de ejemplo';
  }

  buildBody(data: ExampleNotificationPayload): string
  {
    return `Mensaje: ${data.message}`;
  }

  getRecipients(data: ExampleNotificationPayload): string[]
  {
    return [data.userEmail];
  }
}
