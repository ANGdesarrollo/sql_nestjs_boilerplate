import * as Joi from 'joi';

export const envConfig = {
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(8000),

  DATABASE_HOST: Joi.string().default('localhost'),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USER: Joi.string().default('postgres'),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().default('nest_auth'),

  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('1h'),

  COOKIE_SECRET: Joi.string().required(),
  COOKIE_EXPIRATION: Joi.number().default(3600000)
};

export type EnvironmentConfig = {
  [K in keyof typeof envConfig]: string | number | boolean;
};
