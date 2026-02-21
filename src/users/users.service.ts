import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { QueryFailedError } from 'typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';

export interface CreateUserInput {
  readonly email: string;
  readonly passwordHash: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly bio: string | null;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createUser(payload: CreateUserInput): Promise<UserEntity> {
    const user = this.userRepository.create({
      email: payload.email,
      passwordHash: payload.passwordHash,
      firstName: payload.firstName,
      lastName: payload.lastName,
      bio: payload.bio,
    });

    try {
      return await this.userRepository.save(user);
    } catch (error) {
      if (this.isEmailUniqueViolation(error)) {
        throw new ConflictException('Email is already in use');
      }

      throw error;
    }
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByIdOrThrow(id: string): Promise<UserEntity> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User was not found');
    }

    return user;
  }

  private isEmailUniqueViolation(error: unknown): boolean {
    const maybeQueryError = error as QueryFailedError & {
      code?: string;
      constraint?: string;
    };

    return (
      maybeQueryError.code === '23505' &&
      maybeQueryError.constraint === 'UQ_users_email'
    );
  }
}
