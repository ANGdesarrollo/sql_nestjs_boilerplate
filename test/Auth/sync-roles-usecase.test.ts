import { Logger } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DataSource } from 'typeorm';

import { SyncRolesUseCase } from '../../src/Auth/Application/SyncRolesUseCase';
import { PermissionRepository } from '../../src/Auth/Infrastructure/Repositories/PermissionRepository';
import { RoleRepository } from '../../src/Auth/Infrastructure/Repositories/RoleRepository';
import { getAllPermissions } from '../../src/Config/Permissions';
import { getDefaultRoles } from '../../src/Config/Roles';

describe('SyncRolesUseCase - Integration Test', () =>
{
  let app: NestFastifyApplication;
  let syncRolesUseCase: SyncRolesUseCase;
  let permissionRepository: PermissionRepository;
  let roleRepository: RoleRepository;
  let dataSource: DataSource;

  beforeAll(async() =>
  {
    const testEnv = await global.getTestEnv();
    app = testEnv.app;
    dataSource = testEnv.dataSource;

    syncRolesUseCase = app.get(SyncRolesUseCase);
    permissionRepository = app.get(PermissionRepository);
    roleRepository = app.get(RoleRepository);
  });

  beforeEach(async() =>
  {
    // Clear permissions and roles tables manually to test the creation path
    if ('schema' in dataSource.options) {
      await dataSource.query(`TRUNCATE TABLE "${dataSource.options.schema}"."role_permissions" CASCADE`);
    }
    if ('schema' in dataSource.options) {
      await dataSource.query(`TRUNCATE TABLE "${dataSource.options.schema}"."permissions" CASCADE`);
    }
    if ('schema' in dataSource.options) {
      await dataSource.query(`TRUNCATE TABLE "${dataSource.options.schema}"."roles" CASCADE`);
    }
  });

  describe('execute', () =>
  {
    it('should create permissions when they do not exist', async() =>
    {
      // Act
      await syncRolesUseCase.execute();

      // Assert
      const permissions = await permissionRepository.list();
      const expectedPermissions = getAllPermissions();

      expect(permissions.length).toBe(expectedPermissions.length);

      // Check all required permissions are created
      for (const permName of expectedPermissions)
      {
        const foundPerm = permissions.find(p => p.name === permName);
        expect(foundPerm).toBeDefined();
        expect(foundPerm?.description).toContain(`Permission for ${permName}`);
      }
    });

    it('should not duplicate permissions that already exist', async() =>
    {
      // Arrange - Create some permissions first
      const permissionNames = getAllPermissions();
      const existingPermName = permissionNames[0];

      const perm = await permissionRepository.create({
        name: existingPermName,
        description: 'Pre-existing permission'
      });

      // Act - Run sync which should preserve existing permission
      await syncRolesUseCase.execute();

      // Assert
      const permissions = await permissionRepository.list();
      const expectedPermissions = getAllPermissions();

      expect(permissions.length).toBe(expectedPermissions.length);

      // The pre-existing permission should still exist with same ID
      const foundPerm = permissions.find(p => p.name === existingPermName);
      expect(foundPerm).toBeDefined();
      expect(foundPerm?.id).toBe(perm.id);
    });

    it('should create roles with correct permissions when roles do not exist', async() =>
    {
      // Act
      await syncRolesUseCase.execute();

      // Assert
      const roles = await roleRepository.list();
      const defaultRoles = getDefaultRoles();

      expect(roles.length).toBe(defaultRoles.length);

      // Check each role
      for (const roleData of defaultRoles)
      {
        const role = roles.find(r => r.name === roleData.name);
        expect(role).toBeDefined();
        expect(role?.description).toBe(roleData.description);

        // Fetch role with relations to check permissions
        if ('schema' in dataSource.options)
        {
          const rolesWithPermissions = await dataSource.query(`
          SELECT r.id, r.name, COUNT(rp.permission_id) as perm_count 
          FROM "${dataSource.options.schema}"."roles" r
          LEFT JOIN "${dataSource.options.schema}"."role_permissions" rp ON r.id = rp.role_id
          WHERE r.name = $1
          GROUP BY r.id, r.name
        `, [roleData.name]);

          // Verify permissions count
          if (rolesWithPermissions.length > 0)
          {
            expect(parseInt(rolesWithPermissions[0].perm_count, 10)).toBe(roleData.permissions.length);
          }
        }
      }
    });

    it('should update existing roles with new permissions', async() =>
    {
      // Arrange - First sync to create roles
      await syncRolesUseCase.execute();

      // Get the super admin role
      const superAdminRole = await roleRepository.findOneBy('name', 'super_admin');
      expect(superAdminRole).toBeDefined();

      // Modify role description
      await roleRepository.update(superAdminRole!.id, {
        description: 'Modified description'
      });

      // Remove all permissions
      if ('schema' in dataSource.options)
      {
        await dataSource.query(`DELETE FROM "${dataSource.options.schema}"."role_permissions" 
                             WHERE "role_id" = '${superAdminRole!.id}'`);
      }

      // Act - Run sync again which should restore permissions
      await syncRolesUseCase.execute();

      // Assert - Role description should be updated back to default
      const updatedRole = await roleRepository.findOneBy('id', superAdminRole!.id);
      expect(updatedRole?.description).not.toBe('Modified description');

      // Check permissions count directly with query
      if ('schema' in dataSource.options)
      {
        const permissionCount = await dataSource.query(`
        SELECT COUNT(*) as count 
        FROM "${dataSource.options.schema}"."role_permissions" 
        WHERE "role_id" = $1
      `, [superAdminRole!.id]);


        const defaultRoles = getDefaultRoles();
        const superAdminConfig = defaultRoles.find(r => r.name === 'super_admin');
        expect(parseInt(permissionCount[0].count, 10)).toBe(superAdminConfig?.permissions.length);
      }
    });

    it('should handle errors while processing roles', async() =>
    {
      // Arrange - Create invalid role repository to force an error
      const originalUpdateRolePermissions = roleRepository.updateRolePermissions;

      jest.spyOn(roleRepository, 'updateRolePermissions').mockImplementationOnce(async() =>
      {
        throw new Error('Simulated error updating role permissions');
      });

      // Act & Assert - Should not throw error upward
      await expect(syncRolesUseCase.execute()).resolves.not.toThrow();

      // Restore original method
      roleRepository.updateRolePermissions = originalUpdateRolePermissions;
    });

    it('should log errors and throw if sync completely fails', async() =>
    {
      // Arrange - Make permission repository fail
      const originalFindOneBy = permissionRepository.findOneBy;

      jest.spyOn(permissionRepository, 'findOneBy').mockImplementationOnce(async() =>
      {
        throw new Error('Database connection error');
      });

      // Spy on logger
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      // Act & Assert
      await expect(syncRolesUseCase.execute()).rejects.toThrow('Failed to synchronize');
      expect(loggerSpy).toHaveBeenCalled();

      // Restore original method
      permissionRepository.findOneBy = originalFindOneBy;
    });
  });
});
