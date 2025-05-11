import { Injectable, Inject, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import 'fastify';

import { Validator } from '../../Shared/Presentation/Validations/Validator';
import { UserDomain } from '../Domain/Entities/UserDomain';
import { UpdateUserPayload } from '../Domain/Payloads/UpdateUserPayload';
import { HashService } from '../Domain/Services/HashService';
import { TenantRepository } from '../Infrastructure/Repositories/TenantRepository';
import { UserRepository } from '../Infrastructure/Repositories/UserRepository';
import { UserTenantRepository } from '../Infrastructure/Repositories/UserTenantRepository';
import { UpdateUserPayloadSchema } from '../Presentation/Validations/UpdateUserSchema';

@Injectable()
export class UpdateUserUseCase extends Validator<UpdateUserPayload>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tenantRepository: TenantRepository,
    private readonly userTenantRepository: UserTenantRepository,
    private readonly hashService: HashService,
    @Inject('DATA_SOURCE') private readonly dataSource: DataSource
  )
  {
    super(UpdateUserPayloadSchema);
  }

  async execute(payload: UpdateUserPayload): Promise<UserDomain>
  {
    const data = this.validate(payload);
    const { id, username, password, tenantChanges } = data;

    const existingUser = await this.userRepository.findOneBy({ id });

    if (!existingUser)
    {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (username && username !== existingUser.username)
    {
      const userWithUsername = await this.userRepository.findOneBy({ username });
      if (userWithUsername && userWithUsername.id !== id)
      {
        throw new ConflictException(`User with username '${username}' already exists`);
      }
    }

    if (tenantChanges)
    {
      await this._validateTenantChanges(tenantChanges, id);
    }

    return this.dataSource.transaction(async(manager) =>
    {
      const transactionalRepos = this._getTransactionalRepositories(manager);

      // Update user basic info
      const updateData: Partial<UserDomain> = {};

      if (username)
      {
        updateData.username = username;
      }

      if (password)
      {
        updateData.password = await this.hashService.hash(password);
      }

      let updatedUser = existingUser;

      if (Object.keys(updateData).length > 0)
      {
        // @ts-ignore
        // TODO: Fix this TYPE ERROR
        updatedUser = await transactionalRepos.userRepo.update(existingUser.id, updateData);
      }

      if (tenantChanges)
      {
        await this._processTenantChanges(
          transactionalRepos.userTenantRepo,
          id,
          tenantChanges
        );
      }

      return updatedUser;
    });
  }

  private _getTransactionalRepositories(manager: EntityManager)
  {
    return {
      userRepo: this.userRepository.withTransaction(manager),
      userTenantRepo: this.userTenantRepository.withTransaction(manager),
      tenantRepo: this.tenantRepository.withTransaction(manager)
    };
  }

  private async _validateTenantChanges(
    tenantChanges: {
      addTenantIds?: string[];
      removeTenantIds?: string[];
      defaultTenantId?: string;
    },
    userId: string
  ): Promise<void>
  {
    const { addTenantIds, removeTenantIds, defaultTenantId } = tenantChanges;

    if (addTenantIds && addTenantIds.length > 0)
    {
      const tenantsToAdd = await this.tenantRepository.findByIds(addTenantIds);
      if (tenantsToAdd.length !== addTenantIds.length)
      {
        const foundIds = tenantsToAdd.map(t => t.id);
        const missingIds = addTenantIds.filter(id => !foundIds.includes(id));
        throw new BadRequestException(`Tenants with IDs ${missingIds.join(', ')} not found`);
      }

      for (const tenantId of addTenantIds)
      {
        const existingRelation = await this.userTenantRepository.findByUserAndTenant(userId, tenantId);
        if (existingRelation)
        {
          throw new ConflictException(`User is already assigned to tenant with ID ${tenantId}`);
        }
      }
    }

    if (removeTenantIds && removeTenantIds.length > 0)
    {
      for (const tenantId of removeTenantIds)
      {
        const existingRelation = await this.userTenantRepository.findByUserAndTenant(userId, tenantId);
        if (!existingRelation)
        {
          throw new BadRequestException(`User is not assigned to tenant with ID ${tenantId}`);
        }
      }
    }

    if (defaultTenantId)
    {
      const hasDefaultTenant = await this.userTenantRepository.findByUserAndTenant(userId, defaultTenantId);
      const willHaveDefaultTenant = addTenantIds && addTenantIds.includes(defaultTenantId);

      if (!hasDefaultTenant && !willHaveDefaultTenant)
      {
        throw new BadRequestException(`Cannot set default tenant to ${defaultTenantId} as user does not have access to this tenant`);
      }
    }

    if (removeTenantIds && removeTenantIds.length > 0)
    {
      const userTenants = await this.userTenantRepository.findUserTenants(userId);
      const remainingTenantsCount = userTenants.length - removeTenantIds.length + (addTenantIds?.length || 0);

      if (remainingTenantsCount <= 0)
      {
        throw new BadRequestException('User must have at least one tenant');
      }
    }
  }

  private async _processTenantChanges(
    userTenantRepo: UserTenantRepository,
    userId: string,
    tenantChanges: {
      addTenantIds?: string[];
      removeTenantIds?: string[];
      defaultTenantId?: string;
    }
  ): Promise<void>
  {
    const { addTenantIds, removeTenantIds, defaultTenantId } = tenantChanges;

    // Add tenant relationships
    if (addTenantIds && addTenantIds.length > 0)
    {
      await userTenantRepo.createMany(
        addTenantIds.map(tenantId => ({
          userId,
          tenantId,
          isDefault: tenantId === defaultTenantId
        }))
      );
    }

    if (removeTenantIds && removeTenantIds.length > 0)
    {
      for (const tenantId of removeTenantIds)
      {
        const relation = await userTenantRepo.findByUserAndTenant(userId, tenantId);
        if (relation)
        {
          await userTenantRepo.deleteUserTenant(userId, tenantId);
        }
      }
    }

    if (defaultTenantId)
    {
      await userTenantRepo.setDefaultTenant(userId, defaultTenantId);
    }
  }
}
