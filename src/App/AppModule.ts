import { Module } from '@nestjs/common';

import { AuthModule } from '../Auth/AuthModule';
import { SharedModule } from '../Shared/SharedModule';

@Module({
  imports: [
    AuthModule,
    SharedModule
  ]
})
export class AppModule {}
