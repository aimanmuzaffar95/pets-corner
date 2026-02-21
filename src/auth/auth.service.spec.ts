import { ConflictException, UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import type { UsersService } from '../users/users.service';
import type { UserEntity } from '../users/entities/user.entity';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  const usersService = {
    createUser: jest.fn(),
    findByEmail: jest.fn(),
  } as unknown as jest.Mocked<UsersService>;

  const jwtService = {
    signAsync: jest.fn(),
  } as unknown as jest.Mocked<JwtService>;

  const configService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_ACCESS_TOKEN_EXPIRES_IN') {
        return '24h';
      }

      if (key === 'BCRYPT_SALT_ROUNDS') {
        return '12';
      }

      return undefined;
    }),
  } as unknown as jest.Mocked<ConfigService>;

  const hashMock = bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>;
  const compareMock = bcrypt.compare as jest.MockedFunction<
    typeof bcrypt.compare
  >;

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(usersService, jwtService, configService);
  });

  it('registers user and returns auth response', async () => {
    const payload: RegisterDto = {
      email: 'user@example.com',
      password: 'Strong!123',
      firstName: 'Aiman',
      lastName: 'Muzaffar',
      bio: null,
    };

    const createdUser = {
      id: 'b065b94b-3818-4a6d-81f0-ffbe3f7e61fd',
      email: payload.email,
      passwordHash: 'hashed',
      firstName: payload.firstName,
      lastName: payload.lastName,
      bio: payload.bio,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      deletedAt: null,
    } as UserEntity;

    hashMock.mockResolvedValue('hashed');
    usersService.createUser.mockResolvedValue(createdUser);
    jwtService.signAsync.mockResolvedValue('jwt-token');

    const result = await service.register(payload);

    expect(result.accessToken).toBe('jwt-token');
    expect(result.user.email).toBe(payload.email);
    expect(usersService.createUser.mock.calls[0]?.[0]).toEqual({
      email: payload.email,
      passwordHash: 'hashed',
      firstName: payload.firstName,
      lastName: payload.lastName,
      bio: null,
    });
  });

  it('throws on duplicate email registration', async () => {
    const payload: RegisterDto = {
      email: 'user@example.com',
      password: 'Strong!123',
      firstName: 'Aiman',
      lastName: 'Muzaffar',
      bio: null,
    };

    hashMock.mockResolvedValue('hashed');
    usersService.createUser.mockRejectedValue(
      new ConflictException('Email is already in use'),
    );

    await expect(service.register(payload)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('logs in with valid credentials', async () => {
    const payload: LoginDto = {
      email: 'user@example.com',
      password: 'Strong!123',
    };

    const existingUser = {
      id: 'b065b94b-3818-4a6d-81f0-ffbe3f7e61fd',
      email: payload.email,
      passwordHash: 'hashed',
      firstName: 'Aiman',
      lastName: 'Muzaffar',
      bio: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      deletedAt: null,
    } as UserEntity;

    usersService.findByEmail.mockResolvedValue(existingUser);
    compareMock.mockResolvedValue(true);
    jwtService.signAsync.mockResolvedValue('jwt-token');

    const result = await service.login(payload);

    expect(result.accessToken).toBe('jwt-token');
    expect(result.user.id).toBe(existingUser.id);
    expect(result.user).not.toHaveProperty('createdAt');
    expect(result.user).not.toHaveProperty('updatedAt');
    expect(usersService.findByEmail.mock.calls[0]?.[0]).toBe(payload.email);
  });

  it('rejects login when user does not exist', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({ email: 'missing@example.com', password: 'Strong!123' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects login when password is invalid', async () => {
    const existingUser = {
      id: 'b065b94b-3818-4a6d-81f0-ffbe3f7e61fd',
      email: 'user@example.com',
      passwordHash: 'hashed',
      firstName: 'Aiman',
      lastName: 'Muzaffar',
      bio: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      deletedAt: null,
    } as UserEntity;

    usersService.findByEmail.mockResolvedValue(existingUser);
    compareMock.mockResolvedValue(false);

    await expect(
      service.login({ email: existingUser.email, password: 'Strong!123' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
