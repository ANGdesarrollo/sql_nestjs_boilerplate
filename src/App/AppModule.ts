import { Module } from '@nestjs/common';

import { AuthModule } from '../Auth/AuthModule';
import { ConfigModule } from '../Config/ConfigModule';
import { SharedModule } from '../Shared/SharedModule';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    SharedModule
  ]
})
export class AppModule {}
