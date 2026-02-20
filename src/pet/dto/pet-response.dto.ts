import type { PetEntity } from '../entities/pet.entity';

export class PetResponseDto {
  readonly id!: string;
  readonly name!: string;
  readonly breed!: string | null;
  readonly age!: number | null;
  readonly speciesId!: string;
  readonly speciesCode!: string;
  readonly speciesLabel!: string;
  readonly createdAt!: string;
  readonly updatedAt!: string;
}

export function toPetResponseDto(entity: PetEntity): PetResponseDto {
  return {
    id: entity.id,
    name: entity.name,
    breed: entity.breed,
    age: entity.age,
    speciesId: entity.speciesId,
    speciesCode: entity.species.code,
    speciesLabel: entity.species.label,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}
