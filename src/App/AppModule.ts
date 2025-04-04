import { Module } from '@nestjs/common';

import { AuthModule } from '../Auth/AuthModule';

@Module({
  imports: [
    AuthModule
  ]
})
export class AppModule {}
