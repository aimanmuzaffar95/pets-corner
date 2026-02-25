import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { AdoptionListingStatus } from '../entities/adoption-listing-status.enum';

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

export class ListAdoptionListingsQueryDto {
  @IsOptional()
  @IsEnum(AdoptionListingStatus)
  readonly status?: AdoptionListingStatus;

  @Transform(({ value }: { value: unknown }) => normalizeUppercase(value))
  @IsOptional()
  @IsString()
  @MaxLength(32)
  readonly speciesCode?: string;

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

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly page: number = 1;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  readonly limit: number = 20;
}
