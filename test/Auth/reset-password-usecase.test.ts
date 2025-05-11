import { faker } from '@faker-js/faker';
import { BadRequestException } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { addHours, subHours } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

import { CreateSuperUserUseCase } from '../../src/Auth/Application/CreateSuperUserUseCase';
import { ResetPasswordUseCase } from '../../src/Auth/Application/ResetPasswordUseCase';
import { SyncRolesUseCase } from '../../src/Auth/Application/SyncRolesUseCase';
import { UserDomain } from '../../src/Auth/Domain/Entities/UserDomain';
import { HashService } from '../../src/Auth/Domain/Services/HashService';
import { PasswordRecoveryTokenRepository } from '../../src/Auth/Infrastructure/Repositories/PasswordRecoveryTokenRepository';
import { UserRepository } from '../../src/Auth/Infrastructure/Repositories/UserRepository';

import { CreateSuperUserFixture, SuperUserFixture } from './Fixtures/CreateSuperUserFixture';

describe('ResetPasswordUseCase - Integration Test', () =>
{
  let app: NestFastifyApplication;
  let resetPasswordUseCase: ResetPasswordUseCase;
  let syncRolesUseCase: SyncRolesUseCase;
  let userRepository: UserRepository;
  let tokenRepository: PasswordRecoveryTokenRepository;
  let hashService: HashService;
  let createSuperUserUseCase: CreateSuperUserUseCase;
  let testUserPayload: SuperUserFixture;
  let user: UserDomain;

  beforeAll(async() =>
  {
    const testEnv = await global.getTestEnv();
    app = testEnv.app;

    resetPasswordUseCase = app.get(ResetPasswordUseCase);
    syncRolesUseCase = app.get(SyncRolesUseCase);
    userRepository = app.get(UserRepository);
    tokenRepository = app.get(PasswordRecoveryTokenRepository);
    hashService = app.get(HashService);
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
    it('should throw BadRequestException when token is invalid', async() =>
    {
      const invalidToken = uuidv4();
      const newPassword = faker.internet.password();

      await expect(resetPasswordUseCase.execute({ token: invalidToken, password: newPassword }))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when token has already been used', async() =>
    {
      const token = await tokenRepository.create({
        token: uuidv4(),
        userId: user.id,
        expiresAt: addHours(new Date(), 24),
        isUsed: true // Already used
      });

      const newPassword = faker.internet.password();

      await expect(resetPasswordUseCase.execute({ token: token.token, password: newPassword }))
        .rejects.toThrow('Token has already been used');
    });

    it('should throw BadRequestException when token has expired', async() =>
    {
      const token = await tokenRepository.create({
        token: uuidv4(),
        userId: user.id,
        expiresAt: subHours(new Date(), 1), // Expired 1 hour ago
        isUsed: false
      });

      const newPassword = faker.internet.password();

      await expect(resetPasswordUseCase.execute({ token: token.token, password: newPassword }))
        .rejects.toThrow('Token has expired');
    });

    it('should successfully reset the password when token is valid', async() =>
    {
      const token = await tokenRepository.create({
        token: uuidv4(),
        userId: user.id,
        expiresAt: addHours(new Date(), 24),
        isUsed: false
      });

      const newPassword = faker.internet.password();

      await resetPasswordUseCase.execute({ token: token.token, password: newPassword });

      const updatedUser = await userRepository.findOneBy({ id: user.id });
      const isPasswordValid = await hashService.compare(newPassword, updatedUser!.password);
      expect(isPasswordValid).toBe(true);

      const usedToken = await tokenRepository.findOneBy({ id: token.id });
      expect(usedToken!.isUsed).toBe(true);
    });
  });
});
