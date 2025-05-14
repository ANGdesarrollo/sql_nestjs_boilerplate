import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { CreateTenantUseCase } from '../../src/Auth/Application/CreateTenantUseCase';
import { ListUsersUseCase } from '../../src/Auth/Application/ListUsersUseCase';
import { SyncRolesUseCase } from '../../src/Auth/Application/SyncRolesUseCase';
import { TenantRepository } from '../../src/Auth/Infrastructure/Repositories/TenantRepository';
import { UserRepository } from '../../src/Auth/Infrastructure/Repositories/UserRepository';
import { UserCriteria } from '../../src/Auth/Presentation/Criteria/UserCriteria';

import { createTenantFixture } from './Fixtures/CreateTenantFixture';
import { CreateUserFixture } from './Fixtures/CreateUserFixture';

describe('listUsersUseCase', () =>
{
  let app: NestFastifyApplication;
  let listUsersUseCase: ListUsersUseCase;
  let createTenantUseCase: CreateTenantUseCase;
  let tenantRepository: TenantRepository;
  let userRepository: UserRepository;
  let syncRolesUseCase: SyncRolesUseCase;
  let tenantId: string;
  let criteria: UserCriteria;

  beforeAll(async() =>
  {
    try
    {
      const testEnv = await global.getTestEnv();
      app = testEnv.app;

      listUsersUseCase = app.get<ListUsersUseCase>(ListUsersUseCase);
      createTenantUseCase = app.get<CreateTenantUseCase>(CreateTenantUseCase);
      tenantRepository = app.get<TenantRepository>(TenantRepository);
      userRepository = app.get<UserRepository>(UserRepository);
      syncRolesUseCase = app.get<SyncRolesUseCase>(SyncRolesUseCase);

      await syncRolesUseCase.execute();

      const tenantPayload = createTenantFixture();
      await createTenantUseCase.execute(tenantPayload);

      const tenant = await tenantRepository.findOneBy({ name: tenantPayload.name });

      if (!tenant)
      {
        throw new Error('Test setup failed: tenant not found');
      }

      tenantId = tenant.id;
    }
    catch (error)
    {
      console.error('Error during setup: ', error);
      throw error;
    }
  });

  beforeEach(async() =>
  {
    criteria = new UserCriteria();
    const userOne = CreateUserFixture({
      tenantIds: [tenantId],
      defaultTenantId: tenantId
    });
    const userTwo = CreateUserFixture({
      tenantIds: [tenantId],
      defaultTenantId: tenantId
    });

    const usersToInsert = [userOne, userTwo];

    for (const user of usersToInsert)
    {
      await userRepository.create(user);
    }
    await app.close();
  });

  describe('execute', () =>
  {
    it('use case should be defined', () =>
    {
      expect(listUsersUseCase).toBeDefined();
    });

    it('should return all users', async() =>
    {
      try
      {
        const result = await listUsersUseCase.execute(criteria);
        expect(result.data).toBeInstanceOf(Array);
        expect(result.data.length).toBe(2);
      }
      catch (error)
      {
        console.error('Error during user listing: ', error);
        throw error;
      }
    });

    it('should return correct pagination', async() =>
    {
      try
      {
        criteria.offset = 1;
        criteria.limit = 1;

        const result = await listUsersUseCase.execute(criteria);
        expect(result.data).toBeInstanceOf(Array);
        expect(result.data.length).toBe(1);
        expect(result.nextPage).toBeDefined();
        expect(result.prevPage).toBeDefined();
      }
      catch (error)
      {
        console.error('Error during user listing: ', error);
        throw error;
      }
    });

    it('should return orderer DESC and ASC', async() =>
    {
      try
      {
        criteria.offset = 0;
        criteria.limit = 10;
        criteria.sortBy = 'username';
        criteria.orderBy = 'desc';

        const result = await listUsersUseCase.execute(criteria);
        expect(result.data).toBeInstanceOf(Array);
        expect(result.nextPage).toBeDefined();
        expect(result.prevPage).toBeDefined();

        console.log(result.data);

        for (let i = 0; i < result.data.length - 1; i++)
        {
          expect(result.data[i].username.localeCompare(result.data[i + 1].username)).toBeGreaterThanOrEqual(0);
        }


        criteria.offset = 0;
        criteria.limit = 10;
        criteria.sortBy = 'username';
        criteria.orderBy = 'asc';

        const resultASC = await listUsersUseCase.execute(criteria);

        expect(resultASC.data).toBeInstanceOf(Array);
        expect(resultASC.nextPage).toBeDefined();
        expect(resultASC.prevPage).toBeDefined();

        for (let i = 0; i < result.data.length - 1; i++)
        {
          expect(resultASC.data[i].username.localeCompare(resultASC.data[i + 1].username)).toBeLessThanOrEqual(0);
        }
      }
      catch (error)
      {
        console.error('Error during user listing: ', error);
        throw error;
      }
    });
  });
});
