// src/Config/Env/EnvConfig.ts (Update)
import * as Joi from 'joi';

export const envConfig = {
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(8000),
  FRONT_END_URL: Joi.string().default('http://localhost:5173'),
  BASE_URL: Joi.string().default('http://localhost:8000'),
  DATABASE_SCHEMA: Joi.string().default('public'),
  DATABASE_HOST: Joi.string().default('localhost'),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USER: Joi.string().default('postgres'),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().default('nest_auth'),
  TEST_DATABASE_HOST: Joi.string().default('localhost'),
  TEST_DATABASE_PORT: Joi.number().default(5433),
  TEST_DATABASE_USER: Joi.string().default('postgres'),
  TEST_DATABASE_PASSWORD: Joi.string().default('postgres'),
  TEST_DATABASE_NAME: Joi.string().default('nest_auth_test'),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('1h'),

  COOKIE_SECRET: Joi.string().required(),
  COOKIE_EXPIRATION: Joi.number().default(3600000),

  MINIO_HOST: Joi.string().default('localhost'),
  MINIO_PORT: Joi.number().default(9000),
  MINIO_ACCESS_KEY: Joi.string().default('minioadmin'),
  MINIO_SECRET_KEY: Joi.string().default('minioadmin'),
  MINIO_USE_SSL: Joi.boolean().default(false),
  MINIO_PUBLIC_BUCKET: Joi.string().default('public'),
  MINIO_PRIVATE_BUCKET: Joi.string().default('private'),
  MINIO_REGION: Joi.string().default('us-east-1'),

  SMTP_HOST: Joi.string().default('localhost'),
  SMTP_PORT: Joi.number().default(1025),
  SMTP_SECURE: Joi.boolean().default(false),
  SMTP_USER: Joi.string().allow('').default(''),
  SMTP_PASS: Joi.string().allow('').default(''),
  SMTP_FROM: Joi.string().default('ZonaDev Notifier <no-reply@zonadev.com>'),

};

export type EnvironmentConfig = {
  [K in keyof typeof envConfig]: string | number | boolean;
};
