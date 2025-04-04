import { Global, Module } from '@nestjs/common';

import { DatabaseConnections } from './Infrastructure/DatabaseConnection';

@Global()
@Module({
  providers: [...DatabaseConnections],
  exports: [...DatabaseConnections]
})
export class SharedModule {}
