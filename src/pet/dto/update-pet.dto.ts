import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

function normalizeSpeciesCode(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.trim().toUpperCase();
  }

  return value;
}

export class UpdatePetDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly name?: string;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  readonly breed?: string;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsInt()
  @Min(0)
  @Max(100)
  readonly age?: number;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @Transform(({ value }: { value: unknown }) => normalizeSpeciesCode(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  readonly speciesCode?: string;
}
