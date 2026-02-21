import type { UserEntity } from '../entities/user.entity';

export class UserResponseDto {
  readonly id!: string;
  readonly email!: string;
  readonly firstName!: string;
  readonly lastName!: string;
  readonly bio!: string | null;
  readonly createdAt!: string;
  readonly updatedAt!: string;
}

export function toUserResponseDto(entity: UserEntity): UserResponseDto {
  return {
    id: entity.id,
    email: entity.email,
    firstName: entity.firstName,
    lastName: entity.lastName,
    bio: entity.bio,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}
