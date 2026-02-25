import type { AdoptionListingEntity } from '../entities/adoption-listing.entity';
import type { AdoptionListingStatus } from '../entities/adoption-listing-status.enum';

export class AdoptionListingResponseDto {
  readonly id!: string;
  readonly petId!: string;
  readonly petName!: string;
  readonly petBreed!: string | null;
  readonly petAge!: number | null;
  readonly speciesId!: string;
  readonly speciesCode!: string;
  readonly speciesLabel!: string;
  readonly ownerUserId!: string;
  readonly status!: AdoptionListingStatus;
  readonly title!: string;
  readonly description!: string;
  readonly adoptionFeeCents!: number | null;
  readonly currency!: string | null;
  readonly city!: string;
  readonly state!: string;
  readonly country!: string;
  readonly publishedAt!: string | null;
  readonly closedAt!: string | null;
  readonly createdAt!: string;
  readonly updatedAt!: string;
}

export class AdoptionListingListResponseDto {
  readonly items!: AdoptionListingResponseDto[];
  readonly pagination!: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly totalPages: number;
  };
}

export function toAdoptionListingResponseDto(
  entity: AdoptionListingEntity,
): AdoptionListingResponseDto {
  return {
    id: entity.id,
    petId: entity.petId,
    petName: entity.pet.name,
    petBreed: entity.pet.breed,
    petAge: entity.pet.age,
    speciesId: entity.pet.speciesId,
    speciesCode: entity.pet.species.code,
    speciesLabel: entity.pet.species.label,
    ownerUserId: entity.ownerUserId,
    status: entity.status,
    title: entity.title,
    description: entity.description,
    adoptionFeeCents: entity.adoptionFeeCents,
    currency: entity.currency,
    city: entity.city,
    state: entity.state,
    country: entity.country,
    publishedAt: entity.publishedAt?.toISOString() ?? null,
    closedAt: entity.closedAt?.toISOString() ?? null,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}
