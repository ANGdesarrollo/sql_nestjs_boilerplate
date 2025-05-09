import { Global, Module } from '@nestjs/common';

import { events } from './Events';
import { DatabaseConnections } from './Infrastructure/DatabaseConnection';

@Global()
@Module({
  providers: [...DatabaseConnections, ...events],
  exports: [...DatabaseConnections]
})
export class SharedModule {}
