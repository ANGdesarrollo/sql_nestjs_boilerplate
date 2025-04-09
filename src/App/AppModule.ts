import { Module, Logger } from '@nestjs/common';

import { AuthModule } from '../Auth/AuthModule';
import { ConfigModule } from '../Config/ConfigModule';
import { SharedModule } from '../Shared/SharedModule';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    SharedModule
  ],
  providers: [Logger]
})
export class AppModule {}
