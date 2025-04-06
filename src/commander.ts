import { NestFactory } from '@nestjs/core';
import { CommandFactory } from 'nest-commander';

import { AppModule } from './App/AppModule';

void (async() =>
{
  try
  {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn']
    });

    await CommandFactory.run(AppModule);

    await app.close();
  }
  catch (error)
  {
    console.error('Error executing command:', error);
    process.exit(1);
  }
})();
