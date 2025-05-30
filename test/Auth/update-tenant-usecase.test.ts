import { faker } from '@faker-js/faker';
import { NotFoundException } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { CreateSuperUserUseCase } from '../../src/Auth/Application/CreateSuperUserUseCase';
import { CreateTenantUseCase } from '../../src/Auth/Application/CreateTenantUseCase';
import { SyncRolesUseCase } from '../../src/Auth/Application/SyncRolesUseCase';
import { UpdateTenantUseCase } from '../../src/Auth/Application/UpdateTenantUseCase';
import { TenantDomain } from '../../src/Auth/Domain/Entities/TenantDomain';
import { UpdateTenantPayload } from '../../src/Auth/Domain/Payloads/UpdateTenantPayload';
import { TenantRepository } from '../../src/Auth/Infrastructure/Repositories/TenantRepository';
import { slugify } from '../../src/Shared/Presentation/Utils/Slugify';

import { CreateSuperUserFixture } from './Fixtures/CreateSuperUserFixture';
import { createTenantFixture } from './Fixtures/CreateTenantFixture';

describe('UpdateTenantUseCase - Integration Test', () =>
{
  let app: NestFastifyApplication;
  let updateTenantUseCase: UpdateTenantUseCase;
  let createTenantUseCase: CreateTenantUseCase;
  let syncRolesUseCase: SyncRolesUseCase;
  let createSuperUserUseCase: CreateSuperUserUseCase;
  let tenantRepository: TenantRepository;
  let superUser;
  let existingTenant: TenantDomain;

  beforeAll(async() =>
  {
    const testEnv = await global.getTestEnv();
    app = testEnv.app;

    updateTenantUseCase = app.get(UpdateTenantUseCase);
    createTenantUseCase = app.get(CreateTenantUseCase);
    syncRolesUseCase = app.get(SyncRolesUseCase);
    createSuperUserUseCase = app.get(CreateSuperUserUseCase);
    tenantRepository = app.get(TenantRepository);
  });


  beforeEach(async() =>
  {
    await syncRolesUseCase.execute();

    superUser = CreateSuperUserFixture();
    await createSuperUserUseCase.execute(superUser);

    const tenantPayload = createTenantFixture();
    await createTenantUseCase.execute(tenantPayload);

    const tenants = await tenantRepository.list();
    existingTenant = tenants.find(t => t.name === tenantPayload.name) as TenantDomain;

    if (!existingTenant)
    {
      throw new Error('Test tenant not found in database');
    }
  });

  describe('execute', () =>
  {
    it('should update a tenant successfully', async() =>
    {
      const updateData: UpdateTenantPayload = {
        id: existingTenant.id,
        name: faker.company.name(),
        description: faker.company.catchPhrase()
      };

      const updatedTenant = await updateTenantUseCase.execute(updateData);

      expect(updatedTenant).toBeDefined();
      expect(updatedTenant.id).toBe(existingTenant.id);
      expect(updatedTenant.name).toBe(updateData.name);
      expect(updatedTenant.description).toBe(updateData.description);
      expect(updatedTenant.slug).toBe(slugify(updateData.name));
    });

    it('should throw NotFoundException when tenant does not exist', async() =>
    {
      const nonExistentId = faker.number.int({
        min: 10000,
        max: 20000
      });

      const updateData: UpdateTenantPayload = {
        id: nonExistentId,
        name: faker.company.name()
      };

      await expect(updateTenantUseCase.execute(updateData)).rejects.toThrow(NotFoundException);
    });


    it('should throw ConflictException when updating to a name that already exists', async() =>
    {
      const anotherTenantPayload = createTenantFixture();
      await createTenantUseCase.execute(anotherTenantPayload);

      const tenants = await tenantRepository.list();
      const anotherTenant = tenants.find(t => t.name === anotherTenantPayload.name);

      if (!anotherTenant)
      {
        throw new Error('Test setup failed: another tenant not found');
      }

      const updateData: UpdateTenantPayload = {
        id: existingTenant.id,
        name: anotherTenant.name
      };

      await expect(updateTenantUseCase.execute(updateData))
        .rejects.toThrow(`Tenant with name '${anotherTenant.name}' already exists`);
    });

    it('should validate tenant payload according to schema', async() =>
    {
      const updateData: UpdateTenantPayload = {
        id: existingTenant.id,
        name: 'ab'
      };

      await expect(updateTenantUseCase.execute(updateData)).rejects.toThrow('Validation failed');
    });

    it('should not throw error when updating to the same name', async() =>
    {
      const updateData: UpdateTenantPayload = {
        id: existingTenant.id,
        name: existingTenant.name
      };

      const updatedTenant = await updateTenantUseCase.execute(updateData);
      expect(updatedTenant).toBeDefined();
      expect(updatedTenant.name).toBe(existingTenant.name);
    });

    it('should update all fields at once', async() =>
    {
      const newName = faker.company.name();

      const updateData: UpdateTenantPayload = {
        id: existingTenant.id,
        name: newName,
        description: faker.company.catchPhrase()
      };

      const updatedTenant = await updateTenantUseCase.execute(updateData);

      expect(updatedTenant.name).toBe(newName);
      expect(updatedTenant.slug).toBe(slugify(newName));
    });
  });
});
