import { Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
} from 'class-validator';

function normalizeString(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  return value.trim();
}

function normalizeUppercase(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  return value.trim().toUpperCase();
}

export class UpdateAdoptionListingDto {
  @Transform(({ value }: { value: unknown }) => normalizeString(value))
  @IsOptional()
  @IsString()
  @MaxLength(140)
  readonly title?: string;

  @Transform(({ value }: { value: unknown }) => normalizeString(value))
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  readonly description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  readonly adoptionFeeCents?: number | null;

  @Transform(({ value }: { value: unknown }) => normalizeUppercase(value))
  @IsOptional()
  @IsString()
  @Length(3, 3)
  readonly currency?: string | null;

  @Transform(({ value }: { value: unknown }) => normalizeString(value))
  @IsOptional()
  @IsString()
  @MaxLength(120)
  readonly city?: string;

  @Transform(({ value }: { value: unknown }) => normalizeString(value))
  @IsOptional()
  @IsString()
  @MaxLength(120)
  readonly state?: string;

  @Transform(({ value }: { value: unknown }) => normalizeUppercase(value))
  @IsOptional()
  @IsString()
  @Length(2, 2)
  readonly country?: string;
}
