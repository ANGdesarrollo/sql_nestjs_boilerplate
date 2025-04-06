import fastifyCookie from '@fastify/cookie';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify';

import { AppModule } from './App/AppModule';
import { EnvService } from './Config/Env/EnvService';

void (async() =>
{
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  const envService = app.get(EnvService);

  app.setGlobalPrefix('api');

  await app.register(fastifyCookie, {
    secret: envService.cookie.secret,
    hook: 'onRequest'
  });

  await app.listen(envService.port, '0.0.0.0');

  console.log(`Application is running on: ${await app.getUrl()}`);
})();
