import { PasswordRecoveryPayload } from '../../Auth/Domain/Payloads/PasswordRecoveryPayload';

import { NotificationType } from './NotificationType';
import { ExampleNotificationPayload } from './Payloads/ExampleNotificationPayload';

export type StrategyMap = {
  [NotificationType.EXAMPLE_NOTIFICATION]: ExampleNotificationPayload;
  [NotificationType.PASSWORD_RECOVERY]: PasswordRecoveryPayload;
};
