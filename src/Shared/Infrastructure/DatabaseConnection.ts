import { DataSource } from 'typeorm';

import { PasswordRecoveryTokenEntity } from '../../Auth/Infrastructure/Schemas/PasswordRecoveryTokenSchema';
import { PermissionEntity } from '../../Auth/Infrastructure/Schemas/PermissionSchema';
import { RoleEntity } from '../../Auth/Infrastructure/Schemas/RoleSchema';
import { TenantEntity } from '../../Auth/Infrastructure/Schemas/TenantSchema';
import { UserPermissionEntity } from '../../Auth/Infrastructure/Schemas/UserPermissionSchema';
import { UserRoleEntity } from '../../Auth/Infrastructure/Schemas/UserRoleSchema';
import { UserEntity } from '../../Auth/Infrastructure/Schemas/UserSchema';
import { UserTenantEntity } from '../../Auth/Infrastructure/Schemas/UserTenantSchema';
import { EnvService } from '../../Config/Env/EnvService';
import { FileEntity } from '../../File/Infrastructure/Schemas/FileSchema';

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
        schema: configService.database.schema,
        entities: [
          UserEntity,
          RoleEntity,
          PermissionEntity,
          UserRoleEntity,
          UserPermissionEntity,
          TenantEntity,
          UserTenantEntity,
          FileEntity,
          PasswordRecoveryTokenEntity
        ],
        synchronize: !configService.isProduction,
        logging: !configService.isProduction && !configService.isTest && !configService.isDevelopment
      });

      return dataSource.initialize();
    }
  }
];
