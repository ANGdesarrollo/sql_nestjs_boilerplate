import fastifyCookie from '@fastify/cookie';
import multiPart from '@fastify/multipart';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify';

import { AppModule } from './App/AppModule';
import { EnvService } from './Config/Env/EnvService';
import { Logger } from './Shared/Presentation/Utils/Logger';


void (async() =>
{
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      logger: ['error', 'warn', 'log', 'debug', 'verbose']
    }
  );

  await app.register(multiPart);

  const envService = app.get(EnvService);

  app.setGlobalPrefix('api');

  await app.register(fastifyCookie, {
    secret: envService.cookie.secret,
    hook: 'onRequest'
  });



  await app.listen(envService.port, '0.0.0.0');


  Logger.log(`Application is running on: ${await app.getUrl()}`);
})();
