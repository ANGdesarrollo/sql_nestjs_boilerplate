import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';

import { Validator } from '../../Shared/Presentation/Validations/Validator';
import { TenantDomain } from '../Domain/Entities/TenantDomain';
import { UserDomain } from '../Domain/Entities/UserDomain';
import { UserTenantDomain } from '../Domain/Entities/UserTenantDomain';
import { CreateUserPayload } from '../Domain/Payloads/CreateUserPayload';
import { UserPayload } from '../Domain/Payloads/UserPayload';
import { HashService } from '../Domain/Services/HashService';
import { TenantRepository } from '../Infrastructure/repositories/TenantRepository';
import { UserRepository } from '../Infrastructure/repositories/UserRepository';
import { UserTenantRepository } from '../Infrastructure/repositories/UserTenantRepository';
import { CreateUserPayloadSchema } from '../Presentation/Validations/CreateUserSchema';

interface CreateUserWithTenantsResult {
  user: UserDomain;
  userTenants: UserTenantDomain[];
}

@Injectable()
export class CreateUserUseCase extends Validator<CreateUserPayload>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tenantRepository: TenantRepository,
    private readonly userTenantRepository: UserTenantRepository,
    private readonly hashService: HashService
  )
  {
    super(CreateUserPayloadSchema);
  }

  /**
   * Creates a new user with tenant associations
   * @param payload The user creation payload
   * @returns The created user with their tenant associations
   */
  async execute(payload: CreateUserPayload): Promise<CreateUserWithTenantsResult>
  {
    // Validate input data
    const data = this.validate(payload);

    // Verify user doesn't already exist
    await this._verifyUserDoesNotExist(data.username);

    // Find and validate all requested tenants in a single operation
    await this._findAndValidateTenants(data.tenantIds, data.defaultTenantId);

    // Create the user with hashed password
    const newUser = await this._createUser(data);

    // Create all user-tenant relationships
    const userTenants = await this._assignUserToTenants(newUser.id, data.tenantIds, data.defaultTenantId);

    return { user: newUser, userTenants };
  }

  private async _verifyUserDoesNotExist(username: string): Promise<void>
  {
    const existingUser = await this.userRepository.findOneBy('username', username);
    if (existingUser)
    {
      throw new ConflictException(`User with username '${username}' already exists`);
    }
  }

  /**
   * Finds all requested tenants and validates that they exist
   * @param tenantIds Array of tenant IDs
   * @param defaultTenantId ID of the default tenant
   * @returns Array of tenant objects
   * @throws BadRequestException if any tenant is not found
   */
  private async _findAndValidateTenants(tenantIds: string[], defaultTenantId: string): Promise<TenantDomain[]>
  {
    // Using IN operator would be more efficient than multiple separate queries
    const tenants = await this.tenantRepository.findByIds(tenantIds);

    // Verify all tenants were found
    if (tenants.length !== tenantIds.length)
    {
      const foundIds = tenants.map(t => t.id);
      const missingIds = tenantIds.filter(id => !foundIds.includes(id));
      throw new BadRequestException(`Tenants with IDs ${missingIds.join(', ')} not found`);
    }

    // Verify default tenant is in the list
    if (!tenants.some(t => t.id === defaultTenantId))
    {
      throw new BadRequestException('Default tenant must be included in the tenant list');
    }

    return tenants;
  }

  private async _createUser(data: UserPayload): Promise<UserDomain>
  {
    const hashedPassword = await this.hashService.hash(data.password);
    return this.userRepository.create({
      username: data.username,
      password: hashedPassword
    });
  }

  private async _assignUserToTenants(
    userId: string,
    tenantIds: string[],
    defaultTenantId: string
  ): Promise<UserTenantDomain[]>
  {
    const userTenantPayloads = tenantIds.map(tenantId => ({
      userId,
      tenantId,
      isDefault: tenantId === defaultTenantId
    }));

    return this.userTenantRepository.createMany(userTenantPayloads);
  }
}
