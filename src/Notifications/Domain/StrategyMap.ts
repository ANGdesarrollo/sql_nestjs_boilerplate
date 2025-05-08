import { NotificationType } from './NotificationType';
import { ExampleNotificationPayload } from './Payloads/ExampleNotificationPayload';

export type StrategyMap = {
  [NotificationType.EXAMPLE_NOTIFICATION]: ExampleNotificationPayload;
};
