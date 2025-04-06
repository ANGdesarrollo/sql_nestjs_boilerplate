// src/Shared/Infrastructure/DatabaseConnection.ts
import { DataSource } from 'typeorm';

import { UserEntity } from '../../Auth/Infrastructure/schemas/UserSchema';
import { EnvService } from '../../Config/Env/EnvService';

export const DatabaseConnections = [
  {
    provide: 'DATA_SOURCE',
    inject: [EnvService],
    useFactory: async(configService: EnvService) =>
    {
      const dataSource = new DataSource({
        type: 'postgres',
        host: configService.database.host,
        port: configService.database.port,
        username: configService.database.username,
        password: configService.database.password,
        database: configService.database.name,
        entities: [UserEntity],
        synchronize: !configService.isProduction,
        logging: !configService.isProduction
      });

      return dataSource.initialize();
    }
  }
];
