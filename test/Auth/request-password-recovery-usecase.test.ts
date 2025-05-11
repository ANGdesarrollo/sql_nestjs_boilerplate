import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { addHours } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

import { CreateSuperUserUseCase } from '../../src/Auth/Application/CreateSuperUserUseCase';
import { RequestPasswordRecoveryUseCase } from '../../src/Auth/Application/RequestPasswordRecoveryUseCase';
import { SyncRolesUseCase } from '../../src/Auth/Application/SyncRolesUseCase';
import { UserDomain } from '../../src/Auth/Domain/Entities/UserDomain';
import { PasswordRecoveryTokenRepository } from '../../src/Auth/Infrastructure/Repositories/PasswordRecoveryTokenRepository';
import { UserRepository } from '../../src/Auth/Infrastructure/Repositories/UserRepository';

import { CreateSuperUserFixture, SuperUserFixture } from './Fixtures/CreateSuperUserFixture';

describe('RequestPasswordRecoveryUseCase - Integration Test', () =>
{
  let app: NestFastifyApplication;
  let requestPasswordRecoveryUseCase: RequestPasswordRecoveryUseCase;
  let syncRolesUseCase: SyncRolesUseCase;
  let userRepository: UserRepository;
  let tokenRepository: PasswordRecoveryTokenRepository;
  let createSuperUserUseCase: CreateSuperUserUseCase;
  let testUserPayload: SuperUserFixture;
  let user: UserDomain;

  beforeAll(async() =>
  {
    const testEnv = await global.getTestEnv();
    app = testEnv.app;

    requestPasswordRecoveryUseCase = app.get(RequestPasswordRecoveryUseCase);
    syncRolesUseCase = app.get(SyncRolesUseCase);
    userRepository = app.get(UserRepository);
    tokenRepository = app.get(PasswordRecoveryTokenRepository);
    createSuperUserUseCase = app.get(CreateSuperUserUseCase);

    await syncRolesUseCase.execute();
  });

  beforeEach(async() =>
  {
    testUserPayload = CreateSuperUserFixture();
    await createSuperUserUseCase.execute(testUserPayload);
    const findUser = await userRepository.findOneBy({ username: testUserPayload.username });

    if (!findUser)
    {
      throw new Error('User not found');
    }
    user = findUser;
  });

  describe('execute', () =>
  {
    it('should throw NotFoundException when user does not exist', async() =>
    {
      await expect(requestPasswordRecoveryUseCase.execute('non-existent@email.com'))
        .rejects.toThrow('User not found');
    });

    it('should create a new token when user exists and has no previous tokens', async() =>
    {
      await requestPasswordRecoveryUseCase.execute(user.username);

      const newToken = await tokenRepository.findOneBy({ userId: user.id });
      expect(newToken).toBeDefined();

      if (newToken)
      {
        expect(newToken.token).toBeDefined();
        expect(newToken.expiresAt).toBeInstanceOf(Date);
        expect(newToken.expiresAt.getTime()).toBeGreaterThan(Date.now());
        expect(newToken.isUsed).toBe(false);

        const expectedExpiresAt = addHours(new Date(), 24);
        const diff = Math.abs(newToken.expiresAt.getTime() - expectedExpiresAt.getTime());
        expect(diff).toBeLessThan(1000);
      }
    });

    it('should invalidate previous tokens and create a new one when user exists', async() =>
    {
      const oldToken1 = await tokenRepository.create({
        token: uuidv4(),
        userId: user.id,
        expiresAt: addHours(new Date(), 24),
        isUsed: false
      });

      const oldToken2 = await tokenRepository.create({
        token: uuidv4(),
        userId: user.id,
        expiresAt: addHours(new Date(), 24),
        isUsed: false
      });

      await requestPasswordRecoveryUseCase.execute(user.username);

      const updatedOldToken1 = await tokenRepository.findOneBy({ token: oldToken1.token });
      expect(updatedOldToken1!.isUsed).toBe(true);

      const updatedOldToken2 = await tokenRepository.findOneBy({ token: oldToken2.token });
      expect(updatedOldToken2!.isUsed).toBe(true);

      const newToken = await tokenRepository.findOneBy({ userId: user.id, isUsed: false });
      expect(newToken).toBeDefined();

      if (newToken)
      {
        expect(newToken.token).toBeDefined();
        expect(newToken.expiresAt).toBeInstanceOf(Date);
        expect(newToken.expiresAt.getTime()).toBeGreaterThan(Date.now());
        expect(newToken.isUsed).toBe(false);

        const expectedExpiresAt = addHours(new Date(), 24);
        const diff = Math.abs(newToken.expiresAt.getTime() - expectedExpiresAt.getTime());
        expect(diff).toBeLessThan(1000);
      }
    });
  });
});
