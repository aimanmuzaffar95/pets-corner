import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  Min,
  ValidateIf,
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

export class CreateAdoptionListingDto {
  @IsUUID()
  readonly petId: string;

  @Transform(({ value }: { value: unknown }) => normalizeString(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(140)
  readonly title: string;

  @Transform(({ value }: { value: unknown }) => normalizeString(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  readonly description: string;

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
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  readonly city: string;

  @Transform(({ value }: { value: unknown }) => normalizeString(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  readonly state: string;

  @Transform(({ value }: { value: unknown }) => normalizeUppercase(value))
  @IsString()
  @Length(2, 2)
  readonly country: string;

  @ValidateIf(({ adoptionFeeCents, currency }: CreateAdoptionListingDto) => {
    const hasFee = adoptionFeeCents !== undefined && adoptionFeeCents !== null;
    const hasCurrency = currency !== undefined && currency !== null;
    return hasFee !== hasCurrency;
  })
  @IsNotEmpty({
    message:
      'adoptionFeeCents and currency must both be provided or both omitted',
  })
  readonly feeCurrencyPairValidator?: string;
}
