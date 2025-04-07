export const testConfig = {
  database: {
    host: 'localhost',
    port: 5433,
    username: 'postgres',
    password: 'postgres',
    name: 'nest_auth_test'
  },
  jwt: {
    secret: 'test-jwt-secret',
    expiresIn: '1h'
  },
  cookie: {
    secret: 'test-cookie-secret',
    expiration: 3600000
  },
  isProduction: false,
  isDevelopment: false,
  isTest: true,
  nodeEnv: 'test'
};
