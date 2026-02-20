import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

function normalizeSpeciesCode(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.trim().toUpperCase();
  }

  return value;
}

export class CreatePetDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  readonly breed: string;

  @IsInt()
  @Min(0)
  @Max(100)
  readonly age: number;

  @Transform(({ value }: { value: unknown }) => normalizeSpeciesCode(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  readonly speciesCode: string;
}
