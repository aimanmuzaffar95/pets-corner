import { ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { type App } from 'supertest/types';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { ApiExceptionFilter } from '../src/common/http/api-exception.filter';
import { ApiResponseInterceptor } from '../src/common/http/api-response.interceptor';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;

  const authServiceMock = {
    register: jest.fn().mockResolvedValue({
      accessToken: 'token',
      tokenType: 'Bearer',
      expiresIn: '24h',
      user: {
        id: 'b065b94b-3818-4a6d-81f0-ffbe3f7e61fd',
        email: 'user@example.com',
        firstName: 'Aiman',
        lastName: 'Muzaffar',
        bio: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    }),
    login: jest.fn().mockResolvedValue({
      accessToken: 'token',
      tokenType: 'Bearer',
      expiresIn: '24h',
      user: {
        id: 'b065b94b-3818-4a6d-81f0-ffbe3f7e61fd',
        email: 'user@example.com',
        firstName: 'Aiman',
        lastName: 'Muzaffar',
        bio: null,
      },
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalInterceptors(new ApiResponseInterceptor());
    app.useGlobalFilters(new ApiExceptionFilter());
    await app.init();
  });

  it('POST /auth/register returns auth payload', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'user@example.com',
        password: 'Strong!123',
        firstName: 'Aiman',
        lastName: 'Muzaffar',
      })
      .expect(201)
      .expect((response) => {
        expect(response.body).toMatchObject({
          success: true,
          data: {
            accessToken: 'token',
            user: {
              email: 'user@example.com',
            },
          },
          meta: {
            path: '/auth/register',
          },
        });
        expect(response.body.meta.timestamp).toEqual(expect.any(String));
      });

    expect(authServiceMock.register.mock.calls).toHaveLength(1);
  });

  it('POST /auth/register rejects weak password', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'user@example.com',
        password: 'password',
        firstName: 'Aiman',
        lastName: 'Muzaffar',
      })
      .expect(400)
      .expect((response) => {
        expect(response.body).toMatchObject({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            status: 400,
            path: '/auth/register',
          },
        });
        expect(response.body.error.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'password',
            }),
          ]),
        );
      });
  });

  it('POST /auth/login returns auth payload', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user@example.com',
        password: 'Strong!123',
      })
      .expect(200)
      .expect((response) => {
        expect(response.body).toMatchObject({
          success: true,
          data: {
            tokenType: 'Bearer',
            user: {
              email: 'user@example.com',
            },
          },
          meta: {
            path: '/auth/login',
          },
        });
        expect(response.body.data.user).not.toHaveProperty('createdAt');
        expect(response.body.data.user).not.toHaveProperty('updatedAt');
      });

    expect(authServiceMock.login.mock.calls).toHaveLength(1);
  });
});
