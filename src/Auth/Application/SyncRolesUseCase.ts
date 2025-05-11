import { Injectable, Logger } from '@nestjs/common';

import { getAllPermissions } from '../../Config/Permissions';
import { getDefaultRoles } from '../../Config/Roles';
import { PermissionRepository } from '../Infrastructure/Repositories/PermissionRepository';
import { RoleRepository } from '../Infrastructure/Repositories/RoleRepository';

@Injectable()
export class SyncRolesUseCase
{
  private readonly logger = new Logger(SyncRolesUseCase.name);

  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository
  ) {}

  async execute(): Promise<void>
  {
    try
    {
      this.logger.log('Starting roles and permissions synchronization');

      await this.syncPermissions();

      await this.syncRoles();

      this.logger.log('Roles and permissions synchronized successfully');
    }
    catch (error)
    {
      this.logger.error(`Error during synchronization: ${error.message}`);
      throw new Error(`Failed to synchronize roles and permissions: ${error.message}`);
    }
  }

  private async syncPermissions(): Promise<void>
  {
    const permissionsList = getAllPermissions();
    this.logger.log(`Synchronizing ${permissionsList.length} permissions`);

    await Promise.all(permissionsList.map(async permissionName =>
    {
      const existingPermission = await this.permissionRepository.findOneBy({ name: permissionName });

      if (!existingPermission)
      {
        this.logger.log(`Creating permission: ${permissionName}`);
        await this.permissionRepository.create({
          name: permissionName,
          description: `Permission for ${permissionName}`
        });
      }
    }));
  }

  private async syncRoles(): Promise<void>
  {
    const defaultRoles = getDefaultRoles();
    this.logger.log(`Synchronizing ${defaultRoles.length} roles`);

    for (const roleData of defaultRoles)
    {
      try
      {
        const permissionPromises = roleData.permissions.map(permissionName =>
          this.permissionRepository.findOneBy({ name: permissionName })
        );

        const permissionResults = await Promise.all(permissionPromises);
        const permissionObjects = permissionResults.filter(p => p !== null);

        const existingRole = await this.roleRepository.findOneBy({ name :roleData.name });

        if (!existingRole)
        {
          this.logger.log(`Creating role: ${roleData.name} with ${permissionObjects.length} permissions`);
          await this.roleRepository.create({
            name: roleData.name,
            description: roleData.description,
            permissions: permissionObjects
          });
        }
        else
        {
          this.logger.log(`Updating role: ${roleData.name} with ${permissionObjects.length} permissions`);

          if (existingRole.description !== roleData.description)
          {
            await this.roleRepository.update(existingRole.id, {
              description: roleData.description
            });
          }

          await this.roleRepository.updateRolePermissions(existingRole.id, permissionObjects);
          this.logger.log(`Successfully updated permissions for role: ${roleData.name}`);
        }
      }
      catch (error)
      {
        this.logger.error(`Error processing role ${roleData.name}: ${error.message}`);
      }
    }
  }
}
