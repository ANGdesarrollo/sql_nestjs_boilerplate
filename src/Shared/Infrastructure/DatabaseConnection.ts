// src/Shared/Infrastructure/DatabaseConnection.ts
import { DataSource } from 'typeorm';

export const DatabaseConnections = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async() =>
    {
      const dataSource = new DataSource({
        type: 'postgres',
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432', 10),
        username: process.env.DATABASE_USER || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'postgres',
        database: process.env.DATABASE_NAME || 'nest_auth',
        entities: [
          `${__dirname}/../**/*.entity{.ts,.js}`
        ],
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV !== 'production'
      });

      return dataSource.initialize();
    }
  }
];
