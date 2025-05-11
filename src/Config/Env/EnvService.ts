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
    if (this.isTest)
    {
      return {
        host: this.get('TEST_DATABASE_HOST') as string,
        port: this.get('TEST_DATABASE_PORT') as number,
        username: this.get('TEST_DATABASE_USER') as string,
        password: this.get('TEST_DATABASE_PASSWORD') as string,
        name: this.get('TEST_DATABASE_NAME') as string,
        schema: this.get('DATABASE_SCHEMA') as string
      };
    }

    return {
      host: this.get('DATABASE_HOST') as string,
      port: this.get('DATABASE_PORT') as number,
      username: this.get('DATABASE_USER') as string,
      password: this.get('DATABASE_PASSWORD') as string,
      name: this.get('DATABASE_NAME') as string,
      schema: this.get('DATABASE_SCHEMA') as string
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

  get minio()
  {
    return {
      host: this.get('MINIO_HOST') as string,
      port: this.get('MINIO_PORT') as number,
      accessKey: this.get('MINIO_ACCESS_KEY') as string,
      secretKey: this.get('MINIO_SECRET_KEY') as string,
      useSSL: this.get('MINIO_USE_SSL') as boolean,
      publicBucket: this.get('MINIO_PUBLIC_BUCKET') as string,
      privateBucket: this.get('MINIO_PRIVATE_BUCKET') as string,
      region: this.get('MINIO_REGION') as string
    };
  }

  get smtp()
  {
    return {
      host: this.get('SMTP_HOST') as string,
      port: this.get('SMTP_PORT') as number,
      secure: this.get('SMTP_SECURE') as boolean,
      user: this.get('SMTP_USER') as string,
      pass: this.get('SMTP_PASS') as string,
      from: this.get('SMTP_FROM') as string
    };
  }

  get frontEndUrl(): string
  {
    return this.get('FRONT_END_URL') as string;
  }
}
