import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { StringValue } from 'ms';
import {
  toUserResponseDto,
  type UserResponseDto,
} from '../users/dto/user-response.dto';
import { UsersService } from '../users/users.service';
import type { AuthResponseDto, AuthUserDto } from './dto/auth-response.dto';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly jwtExpiresIn: StringValue;
  private readonly bcryptSaltRounds: number;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.jwtExpiresIn = (this.configService.get<string>(
      'JWT_ACCESS_TOKEN_EXPIRES_IN',
    ) ?? '24h') as StringValue;
    this.bcryptSaltRounds = Number(
      this.configService.get<string>('BCRYPT_SALT_ROUNDS') ?? '12',
    );
  }

  async register(payload: RegisterDto): Promise<AuthResponseDto> {
    const passwordHash = await bcrypt.hash(
      payload.password,
      this.bcryptSaltRounds,
    );

    const user = await this.usersService.createUser({
      email: payload.email,
      passwordHash,
      firstName: payload.firstName,
      lastName: payload.lastName,
      bio: payload.bio ?? null,
    });

    return this.buildAuthResponse(toUserResponseDto(user));
  }

  async login(payload: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(payload.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      payload.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResponse(
      this.withoutAuditTimestamps(toUserResponseDto(user)),
    );
  }

  private async buildAuthResponse(user: AuthUserDto): Promise<AuthResponseDto> {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.jwtExpiresIn,
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: this.jwtExpiresIn,
      user,
    };
  }

  private withoutAuditTimestamps(user: UserResponseDto): AuthUserDto {
    const { createdAt: _createdAt, updatedAt: _updatedAt, ...safeUser } = user;
    return safeUser;
  }
}
