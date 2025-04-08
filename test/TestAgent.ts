import fastifyCookie from '@fastify/cookie';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../src/App/AppModule';
import { EnvService } from '../src/Config/Env/EnvService';


export const getTestAgent = async() =>
{
  const testingModule: TestingModule = await Test.createTestingModule({
    imports: [
      AppModule
    ]
  }).compile();

  const app = testingModule.createNestApplication<NestFastifyApplication>(new FastifyAdapter());

  app.setGlobalPrefix('api');

  const envService = app.get(EnvService);

  await app.register(fastifyCookie, {
    secret: envService.cookie.secret,
    hook: 'onRequest'
  });

  await app.init();
  await app.getHttpAdapter().getInstance().ready();

  return app;
};
