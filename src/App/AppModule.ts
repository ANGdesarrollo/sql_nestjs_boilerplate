import { Module, Logger } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AuthModule } from '../Auth/AuthModule';
import { ConfigModule } from '../Config/ConfigModule';
import { FileModule } from '../File/FileModule';
import { SharedModule } from '../Shared/SharedModule';
import { NotificationsModule } from '../Notifications/NotificationModule';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.'
    }),
    ConfigModule,
    AuthModule,
    FileModule,
    SharedModule,
    NotificationsModule
  ],
  providers: [Logger]
})
export class AppModule {}
