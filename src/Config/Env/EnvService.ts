import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

import { EnvironmentConfig } from './EnvConfig';

@Injectable()
export class EnvService
{
  constructor(private readonly configService: NestConfigService) {}

  get<T extends keyof EnvironmentConfig>(key: T): EnvironmentConfig[T]
  {
    const value = this.configService.get<EnvironmentConfig[T]>(key as string);

    if (value === undefined)
    {
      throw new Error(`Configuration key "${key}" is undefined`);
    }

    return value;
  }

  get nodeEnv(): string
  {
    return this.get('NODE_ENV') as string;
  }

  get port(): number
  {
    return this.get('PORT') as number;
  }

  get isDevelopment(): boolean
  {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean
  {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean
  {
    return this.nodeEnv === 'test';
  }

  get database()
  {
    return {
      host: this.get('DATABASE_HOST') as string,
      port: this.get('DATABASE_PORT') as number,
      username: this.get('DATABASE_USER') as string,
      password: this.get('DATABASE_PASSWORD') as string,
      name: this.get('DATABASE_NAME') as string
    };
  }

  get jwt()
  {
    return {
      secret: this.get('JWT_SECRET') as string,
      expiresIn: this.get('JWT_EXPIRES_IN') as string
    };
  }

  get cookie()
  {
    return {
      secret: this.get('COOKIE_SECRET') as string,
      expiration: this.get('COOKIE_EXPIRATION') as number
    };
  }
}
