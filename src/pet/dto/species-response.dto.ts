import type { SpeciesEntity } from '../entities/species.entity';

export class SpeciesResponseDto {
  readonly id!: string;
  readonly code!: string;
  readonly label!: string;
}

export function toSpeciesResponseDto(
  entity: SpeciesEntity,
): SpeciesResponseDto {
  return {
    id: entity.id,
    code: entity.code,
    label: entity.label,
  };
}
