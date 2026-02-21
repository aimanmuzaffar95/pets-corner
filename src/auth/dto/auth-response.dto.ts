import type { UserResponseDto } from '../../users/dto/user-response.dto';

export type AuthUserDto = Omit<UserResponseDto, 'createdAt' | 'updatedAt'> &
  Partial<Pick<UserResponseDto, 'createdAt' | 'updatedAt'>>;

export class AuthResponseDto {
  readonly accessToken!: string;
  readonly tokenType!: 'Bearer';
  readonly expiresIn!: string;
  readonly user!: AuthUserDto;
}
