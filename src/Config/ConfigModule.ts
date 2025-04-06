import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

import { envConfig } from './Env/EnvConfig';
import { EnvService } from './Env/EnvService';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      validationSchema: Joi.object(envConfig),
      validationOptions: {
        allowUnknown: true,
        abortEarly: true
      },
      isGlobal: true,
      cache: true
    })
  ],
  providers: [EnvService],
  exports: [EnvService]
})
export class ConfigModule {}
