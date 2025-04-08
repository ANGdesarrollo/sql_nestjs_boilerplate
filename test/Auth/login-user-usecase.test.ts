import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { LoginUserUseCase } from '../../src/Auth/Application/LoginUserUseCase';
import { getTestAgent } from '../TestAgent';

let app: NestFastifyApplication;
let loginUserUseCase: LoginUserUseCase;

beforeAll(async() =>
{
  app = await getTestAgent();
  loginUserUseCase = app.get(LoginUserUseCase);
});

describe('LoginUserUseCase', () =>
{
  describe('execute', () =>
  {
    it('should return a JWT token', async() =>
    {
      const result = await loginUserUseCase.execute({
        username: 'admin',
        password: 'admin'
      });

      expect(result).toBeDefined();
    });
  });
});
