import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { ListTenantsUseCase } from '../../src/Auth/Application/ListTenantsUseCase';
import { SyncRolesUseCase } from '../../src/Auth/Application/SyncRolesUseCase';
import { TenantRepository } from '../../src/Auth/Infrastructure/Repositories/TenantRepository';
import { TenantCriteria } from '../../src/Auth/Presentation/Criteria/TenantCriteria';
import { slugify } from '../../src/Shared/Presentation/Utils/Slugify';

import { createTenantFixture } from './Fixtures/CreateTenantFixture';

describe('listTenantsUseCase', () =>
{
  let app: NestFastifyApplication;
  let listTenantsUseCase: ListTenantsUseCase;
  let tenantRepository: TenantRepository;
  let syncRolesUseCase: SyncRolesUseCase;

  beforeAll(async() =>
  {
    try
    {
      const testEnv = await global.getTestEnv();
      app = testEnv.app;

      listTenantsUseCase = app.get<ListTenantsUseCase>(ListTenantsUseCase);
      tenantRepository = app.get<TenantRepository>(TenantRepository);
      syncRolesUseCase = app.get<SyncRolesUseCase>(SyncRolesUseCase);

      await syncRolesUseCase.execute();
    }
    catch (error)
    {
      console.error('Error during setup: ', error);
      throw error;
    }
  });

  beforeEach(async() =>
  {
    const tenants = new Array(20).fill(0).map((_, i) =>
    {
      return createTenantFixture();
    });

    for (const tenant of tenants)
    {
      await tenantRepository.create({ ...tenant, slug: slugify(tenant.name) });
    }
  });

  afterAll(async() =>
  {
    await app.close();
  });

  it('use case should be defined', () =>
  {
    expect(ListTenantsUseCase).toBeDefined();
  });

  it('should return all tenants', async() =>
  {
    try
    {
      const criteria = new TenantCriteria();
      criteria.limit = 20;

      const result = await listTenantsUseCase.execute(criteria);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBe(20);
    }
    catch (error)
    {
      console.error('Error during tenant listing: ', error);
    }
  });

  it('should return correct pagination', async() =>
  {
    try
    {
      const criteria = new TenantCriteria();
      criteria.limit = 1;
      criteria.offset = 1;

      const result = await listTenantsUseCase.execute(criteria);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBe(1);
      expect(result.nextPage).toBeDefined();
      expect(result.prevPage).toBeDefined();
    }
    catch (error)
    {
      console.error('Error during tenant listing: ', error);
      throw error;
    }
  });

  it('should return orderer DESC and ASC', async() =>
  {
    try
    {
      const criteria = new TenantCriteria();
      criteria.limit = 10;
      criteria.sortBy = 'name';
      criteria.orderBy = 'desc';

      const result = await listTenantsUseCase.execute(criteria);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.nextPage).toBeDefined();
      expect(result.prevPage).toBeDefined();

      for (let i = 0; i < result.data.length - 1; i++)
      {
        expect(result.data[i].name.localeCompare(result.data[i + 1].name)).toBeGreaterThanOrEqual(0);
      }

      criteria.offset = 0;
      criteria.limit = 10;
      criteria.sortBy = 'name';
      criteria.orderBy = 'asc';

      const resultASC = await listTenantsUseCase.execute(criteria);

      expect(resultASC.data).toBeInstanceOf(Array);
      expect(resultASC.nextPage).toBeDefined();
      expect(resultASC.prevPage).toBeDefined();

      console.log(resultASC);

      for (let i = 0; i < result.data.length - 1; i++)
      {
        expect(resultASC.data[i].name.localeCompare(resultASC.data[i + 1].name)).toBeLessThanOrEqual(0);
      }
    }
    catch (error)
    {
      console.error('Error during tenant listing: ', error);
      throw error;
    }
  });
});
