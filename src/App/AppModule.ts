import { Module, Logger } from '@nestjs/common';

import { AuthModule } from '../Auth/AuthModule';
import { ConfigModule } from '../Config/ConfigModule';
import { FileModule } from '../File/FileModule';
import { SharedModule } from '../Shared/SharedModule';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    FileModule,
    SharedModule
  ],
  providers: [Logger]
})
export class AppModule {}
