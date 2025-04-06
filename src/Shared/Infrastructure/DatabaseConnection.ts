import { DataSource } from 'typeorm';

import { PermissionEntity } from '../../Auth/Infrastructure/schemas/PermissionSchema';
import { RoleEntity } from '../../Auth/Infrastructure/schemas/RoleSchema';
import { TenantEntity } from '../../Auth/Infrastructure/schemas/TenantSchema';
import { UserPermissionEntity } from '../../Auth/Infrastructure/schemas/UserPermissionSchema';
import { UserRoleEntity } from '../../Auth/Infrastructure/schemas/UserRoleSchema';
import { UserEntity } from '../../Auth/Infrastructure/schemas/UserSchema';
import { UserTenantEntity } from '../../Auth/Infrastructure/schemas/UserTenantSchema';
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
        entities: [
          UserEntity,
          RoleEntity,
          PermissionEntity,
          UserRoleEntity,
          UserPermissionEntity,
          TenantEntity,
          UserTenantEntity
        ],
        synchronize: !configService.isProduction,
        logging: !configService.isProduction
      });

      return dataSource.initialize();
    }
  }
];
