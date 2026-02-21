import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

function normalizeEmail(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.trim().toLowerCase();
  }

  return value;
}

export class LoginDto {
  @Transform(({ value }: { value: unknown }) => normalizeEmail(value))
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(254)
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
