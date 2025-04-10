import { ConflictException } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { CreateSuperUserUseCase } from '../../src/Auth/Application/CreateSuperUserUseCase';
import { CreateTenantUseCase } from '../../src/Auth/Application/CreateTenantUseCase';
import { SyncRolesUseCase } from '../../src/Auth/Application/SyncRolesUseCase';
import { TenantRepository } from '../../src/Auth/Infrastructure/Repositories/TenantRepository';
import { slugify } from '../../src/Shared/Presentation/Utils/Slugify';

import { CreateSuperUserFixture, SuperUserFixture } from './Fixtures/CreateSuperUserFixture';
import { createTenantFixture } from './Fixtures/CreateTenantFixture';

describe('CreateTenantUseCase - Integration Test', () =>
{
  let app: NestFastifyApplication;
  let createTenantUseCase: CreateTenantUseCase;
  let syncRolesUseCase: SyncRolesUseCase;
  let createSuperUserUseCase: CreateSuperUserUseCase;
  let tenantRepository: TenantRepository;
  let superUser: SuperUserFixture;

  beforeAll(async() =>
  {
    const testEnv = await global.getTestEnv();
    app = testEnv.app;

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
  });

  describe('execute', () =>
  {
    it('should create a new tenant successfully', async() =>
    {
      const payload = createTenantFixture();

      await createTenantUseCase.execute(payload);

      const expectedSlug = slugify(payload.name);
      const createdTenant = await tenantRepository.findBySlug(expectedSlug);

      expect(createdTenant).toBeDefined();
      expect(createdTenant?.name).toBe(payload.name);
      expect(createdTenant?.description).toBe(payload.description);
      expect(createdTenant?.slug).toBe(expectedSlug);
    });

    it('should throw ConflictException when tenant with same name already exists', async() =>
    {
      const payload = createTenantFixture();

      await createTenantUseCase.execute(payload);

      const duplicateNamePayload = {
        ...createTenantFixture(),
        name: payload.name
      };

      await expect(createTenantUseCase.execute(duplicateNamePayload))
        .rejects.toThrow(ConflictException);

      try
      {
        await createTenantUseCase.execute(duplicateNamePayload);
        fail('Expected ConflictException to be thrown');
      }
      catch (error)
      {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toBe(`Tenant with name '${payload.name}' already exists`);
      }
    });

    it('should validate tenant payload according to schema', async() =>
    {
      const invalidNamePayload = {
        ...createTenantFixture(),
        name: 'ab'
      };

      await expect(createTenantUseCase.execute(invalidNamePayload))
        .rejects.toThrow('Validation failed');
    });
  });
});
