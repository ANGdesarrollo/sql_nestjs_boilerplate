import { DataSource } from 'typeorm';

import { PermissionEntity } from '../src/Auth/Infrastructure/schemas/PermissionSchema';
import { RoleEntity } from '../src/Auth/Infrastructure/schemas/RoleSchema';
import { TenantEntity } from '../src/Auth/Infrastructure/schemas/TenantSchema';
import { UserPermissionEntity } from '../src/Auth/Infrastructure/schemas/UserPermissionSchema';
import { UserRoleEntity } from '../src/Auth/Infrastructure/schemas/UserRoleSchema';
import { UserEntity } from '../src/Auth/Infrastructure/schemas/UserSchema';
import { UserTenantEntity } from '../src/Auth/Infrastructure/schemas/UserTenantSchema';

import { testConfig } from './TestConfig';

export async function createTestDatabaseConnection(): Promise<DataSource>
{
  const dataSource = new DataSource({
    type: 'postgres',
    host: testConfig.database.host,
    port: testConfig.database.port,
    username: testConfig.database.username,
    password: testConfig.database.password,
    database: testConfig.database.name,
    entities: [
      UserEntity,
      TenantEntity,
      UserTenantEntity,
      RoleEntity,
      PermissionEntity,
      UserRoleEntity,
      UserPermissionEntity
    ],
    synchronize: true,
    logging: false
  });

  await dataSource.initialize();
  return dataSource;
}
