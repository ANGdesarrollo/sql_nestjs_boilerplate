import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { ListRolesUseCase } from '../../src/Auth/Application/ListRolesUseCase';
import { SyncRolesUseCase } from '../../src/Auth/Application/SyncRolesUseCase';

describe('List roles use case', () =>
{
  let app: NestFastifyApplication;
  let syncRolesUseCase: SyncRolesUseCase;
  let listRolesUseCase: ListRolesUseCase;

  beforeAll(async() =>
  {
    const testEnv = await global.getTestEnv();
    app = testEnv.app;
    syncRolesUseCase = app.get(SyncRolesUseCase);
    listRolesUseCase = app.get(ListRolesUseCase);
  });

  beforeEach(async() =>
  {
    await syncRolesUseCase.execute();
  });

  describe('execute', () =>
  {
    it('use case should be defined', () =>
    {
      expect(listRolesUseCase).toBeDefined();
    });

    it('should return a list of roles and their permissions', async() =>
    {
      const roles = await listRolesUseCase.execute();
      expect(roles).toBeDefined();
      expect(roles.length).toBeGreaterThan(0);
      expect(roles[0].permissions).toBeDefined();
      expect(roles[0].permissions.length).toBeGreaterThan(0);
    });
  });
});
