import { Injectable, ConflictException, BadRequestException, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { EnvService } from '../../Config/Env/EnvService';
import { Roles } from '../../Config/Roles';
import { HashService } from '../Domain/Services/HashService';
import { RoleRepository } from '../Infrastructure/Repositories/RoleRepository';
import { TenantRepository } from '../Infrastructure/Repositories/TenantRepository';
import { UserRepository } from '../Infrastructure/Repositories/UserRepository';
import { UserRoleRepository } from '../Infrastructure/Repositories/UserRoleRepository';
import { UserTenantRepository } from '../Infrastructure/Repositories/UserTenantRepository';
import { Logger } from '../../Shared/Presentation/Utils/Logger';

interface SuperUserConfig {
  username: string;
  password: string;
  tenantName: string;
  tenantSlug: string;
}

@Injectable()
export class CreateSuperUserUseCase
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tenantRepository: TenantRepository,
    private readonly userTenantRepository: UserTenantRepository,
    private readonly roleRepository: RoleRepository,
    private readonly userRoleRepository: UserRoleRepository,
    private readonly hashService: HashService,
    @Inject('DATA_SOURCE') private readonly dataSource: DataSource
  ) {}

  async execute(config?: Partial<SuperUserConfig>): Promise<void>
  {
    const superUserConfig: SuperUserConfig = {
      username: config?.username || 'superadmin@node.com',
      password: config?.password || this._generateRandomPassword(),
      tenantName: config?.tenantName || 'System',
      tenantSlug: config?.tenantSlug || 'system'
    };

    return this.dataSource.transaction(async(manager) =>
    {
      const userRepo = this.userRepository.withTransaction(manager);
      const tenantRepo = this.tenantRepository.withTransaction(manager);
      const userTenantRepo = this.userTenantRepository.withTransaction(manager);
      const roleRepo = this.roleRepository.withTransaction(manager);
      const userRoleRepo = this.userRoleRepository.withTransaction(manager);

      const superAdminRole = await roleRepo.findOneBy('name', Roles.SUPER_ADMIN);
      if (!superAdminRole)
      {
        throw new BadRequestException('Super admin role not found. Make sure to run the sync:roles command first');
      }

      const existingTenant = await tenantRepo.findBySlug(superUserConfig.tenantSlug);
      const tenant = existingTenant || await tenantRepo.create({
        name: superUserConfig.tenantName,
        slug: superUserConfig.tenantSlug,
        description: 'System tenant for super administrators'
      });

      const existingUser = await userRepo.findOneBy('username', superUserConfig.username);
      if (existingUser)
      {
        console.log(`Super user '${superUserConfig.username}' already exists`);
        return;
      }

      const hashedPassword = await this.hashService.hash(superUserConfig.password);
      const user = await userRepo.create({
        username: superUserConfig.username,
        password: hashedPassword
      });

      await userTenantRepo.create({
        userId: user.id,
        tenantId: tenant.id,
        isDefault: true
      });

      await userRoleRepo.create({
        user: { id: user.id },
        role: { id: superAdminRole.id }
      });

      if (!config?.password)
      {
        Logger.log('======================================================');
        Logger.log('Super User Created with the following credentials:');
        Logger.log(`Username: ${superUserConfig.username}`);
        Logger.log(`Password: ${superUserConfig.password}`);
        Logger.log('======================================================');
        Logger.log('Please change this password after your first login');
      }
    });
  }

  private _generateRandomPassword(length = 12): string
  {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';

    for (let i = 0; i < length; i++)
    {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return password;
  }
}
