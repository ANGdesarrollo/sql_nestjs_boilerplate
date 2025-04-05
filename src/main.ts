
import fastifyCookie from '@fastify/cookie';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify';

import { AppModule } from './App/AppModule';

void (async() =>
{
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  app.setGlobalPrefix('api');

  await app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET || 'super-secret-cookie-key', // Usa variables de entorno en producción
    hook: 'onRequest'
  });

  await app.listen(process.env.PORT ?? 8000);
})();
