import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';

import { AppModule } from '../../src/App/AppModule';

describe('Auth (e2e)', () =>
{
  let app: INestApplication;
  let server: any;

  beforeAll(async() =>
  {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async() =>
  {
    await app.close();
  });

  describe('POST /auth/register', () =>
  {
    it('should create a new user and return 201', async() =>
    {
      return request(server)
        .post('/auth/register')
        .send({
          username: 'testuser',
          password: 'password123'
        })
        .expect(201)
        .expect(res =>
        {
          expect(res.body).toHaveProperty('username', 'testuser');
          expect(res.body).toHaveProperty('password', 'password123');
        });
    });

    it('should fail with invalid data', async() =>
    {
      return request(server)
        .post('/auth/register')
        .send({
          // Missing required fields
        })
        .expect(400);
    });
  });
});
