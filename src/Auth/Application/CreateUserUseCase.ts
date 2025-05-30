import { Injectable, ConflictException, BadRequestException, Inject } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

import { Roles } from '../../Config/Roles';
import { Validator } from '../../Shared/Presentation/Validations/Validator';
import { TenantDomain } from '../Domain/Entities/TenantDomain';
import { UserDomain } from '../Domain/Entities/UserDomain';
import { CreateUserPayload } from '../Domain/Payloads/CreateUserPayload';
import { HashService } from '../Domain/Services/HashService';
import { RoleRepository } from '../Infrastructure/Repositories/RoleRepository';
import { TenantRepository } from '../Infrastructure/Repositories/TenantRepository';
import { UserRepository } from '../Infrastructure/Repositories/UserRepository';
import { UserRoleRepository } from '../Infrastructure/Repositories/UserRoleRepository';
import { UserTenantRepository } from '../Infrastructure/Repositories/UserTenantRepository';
import { CreateUserPayloadValidator } from '../Presentation/Validations/CreateUserValidator';

@Injectable()
export class CreateUserUseCase extends Validator<CreateUserPayload>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tenantRepository: TenantRepository,
    private readonly userTenantRepository: UserTenantRepository,
    private readonly roleRepository: RoleRepository,
    private readonly userRoleRepository: UserRoleRepository,
    private readonly hashService: HashService,
    @Inject('DATA_SOURCE') private readonly dataSource: DataSource
  )
  {
    super(CreateUserPayloadValidator);
  }

  async execute(payload: CreateUserPayload): Promise<void>
  {
    const data = this.validate(payload);

    await this._verifyUserDoesNotExist(data.username);
    await this._findAndValidateTenants(data.tenantIds);

    await this.dataSource.transaction(async(manager) =>
    {
      const transactionalRepos = this._getTransactionalRepositories(manager);

      const newUser = await this._createUserInTransaction(
        transactionalRepos.userRepo,
        data.username,
        data.password
      );

      await this._assignTenantsInTransaction(
        transactionalRepos.userTenantRepo,
        newUser.id,
        data.tenantIds,
        data.defaultTenantId
      );

      await this._assignDefaultRoleInTransaction(
        transactionalRepos.roleRepo,
        transactionalRepos.userRoleRepo,
        newUser
      );
    });
  }

  private _getTransactionalRepositories(manager: EntityManager)
  {
    return {
      userRepo: this.userRepository.withTransaction(manager),
      userTenantRepo: this.userTenantRepository.withTransaction(manager),
      userRoleRepo: this.userRoleRepository.withTransaction(manager),
      roleRepo: this.roleRepository.withTransaction(manager)
    };
  }

  private async _createUserInTransaction(
    userRepo: UserRepository,
    username: string,
    password: string
  ): Promise<UserDomain>
  {
    const hashedPassword = await this.hashService.hash(password);
    return userRepo.create({
      username,
      password: hashedPassword
    });
  }

  private async _assignTenantsInTransaction(
    userTenantRepo: UserTenantRepository,
    userId: number,
    tenantIds: number[],
    defaultTenantId: number
  ): Promise<void>
  {
    await userTenantRepo.createMany(
      tenantIds.map(tenantId => ({
        userId,
        tenantId,
        isDefault: tenantId === defaultTenantId
      }))
    );
  }

  private async _assignDefaultRoleInTransaction(
    roleRepo: RoleRepository,
    userRoleRepo: UserRoleRepository,
    user: UserDomain
  ): Promise<void>
  {
    const defaultRole = await roleRepo.findOneBy({ name :  Roles.USER });
    if (!defaultRole)
    {
      throw new BadRequestException('Default user role not found. Make sure to run the sync:roles command');
    }

    await userRoleRepo.create({
      user: { id: user.id },
      role: { id: defaultRole.id }
    });
  }

  private async _verifyUserDoesNotExist(username: string): Promise<void>
  {
    const existingUser = await this.userRepository.findOneBy({ username });
    if (existingUser)
    {
      throw new ConflictException(`User with username '${username}' already exists`);
    }
  }

  private async _findAndValidateTenants(tenantIds: number[]): Promise<TenantDomain[]>
  {
    const tenants = await this.tenantRepository.findByIds(tenantIds);

    if (tenants.length !== tenantIds.length)
    {
      const foundIds = tenants.map(t => t.id);
      const missingIds = tenantIds.filter(id => !foundIds.includes(id));
      throw new BadRequestException(`Tenants with IDs ${missingIds.join(', ')} not found`);
    }

    return tenants;
  }
}
