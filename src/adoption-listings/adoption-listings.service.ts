import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { QueryFailedError } from 'typeorm';
import { Repository } from 'typeorm';
import {
  canTransitionStatus,
  isTerminalStatus,
} from './domain/adoption-listing-status-policy';
import { CreateAdoptionListingDto } from './dto/create-adoption-listing.dto';
import type { ListAdoptionListingsQueryDto } from './dto/list-adoption-listings-query.dto';
import {
  AdoptionListingListResponseDto,
  type AdoptionListingResponseDto,
  toAdoptionListingResponseDto,
} from './dto/adoption-listing-response.dto';
import { UpdateAdoptionListingDto } from './dto/update-adoption-listing.dto';
import { AdoptionListingEntity } from './entities/adoption-listing.entity';
import { AdoptionListingStatus } from './entities/adoption-listing-status.enum';
import { PetEntity } from '../pet/entities/pet.entity';

@Injectable()
export class AdoptionListingsService {
  constructor(
    @InjectRepository(AdoptionListingEntity)
    private readonly adoptionListingRepository: Repository<AdoptionListingEntity>,
    @InjectRepository(PetEntity)
    private readonly petRepository: Repository<PetEntity>,
  ) {}

  async createListing(
    payload: CreateAdoptionListingDto,
    ownerUserId: string,
  ): Promise<AdoptionListingResponseDto> {
    await this.findPetByIdOrThrow(payload.petId);

    const listing = this.adoptionListingRepository.create({
      petId: payload.petId,
      ownerUserId,
      status: AdoptionListingStatus.Draft,
      title: payload.title,
      description: payload.description,
      adoptionFeeCents: payload.adoptionFeeCents ?? null,
      currency: payload.currency ?? null,
      city: payload.city,
      state: payload.state,
      country: payload.country,
      publishedAt: null,
      closedAt: null,
    });

    this.assertFeeCurrencyPair(listing.adoptionFeeCents, listing.currency);

    try {
      const saved = await this.adoptionListingRepository.save(listing);
      const created = await this.findListingByIdOrThrow(saved.id);
      return toAdoptionListingResponseDto(created);
    } catch (error) {
      if (this.isActiveListingUniqueViolation(error)) {
        throw new ConflictException(
          'An active adoption listing already exists for this pet',
        );
      }

      throw error;
    }
  }

  async listListings(
    query: ListAdoptionListingsQueryDto,
  ): Promise<AdoptionListingListResponseDto> {
    const page = query.page;
    const limit = query.limit;

    const listingQuery = this.adoptionListingRepository
      .createQueryBuilder('listing')
      .leftJoinAndSelect('listing.pet', 'pet')
      .leftJoinAndSelect('pet.species', 'species')
      .orderBy('listing.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.status) {
      listingQuery.andWhere('listing.status = :status', {
        status: query.status,
      });
    }

    if (query.speciesCode) {
      listingQuery.andWhere('species.code = :speciesCode', {
        speciesCode: query.speciesCode,
      });
    }

    if (query.city) {
      listingQuery.andWhere('listing.city ILIKE :city', {
        city: query.city,
      });
    }

    if (query.state) {
      listingQuery.andWhere('listing.state ILIKE :state', {
        state: query.state,
      });
    }

    if (query.country) {
      listingQuery.andWhere('listing.country = :country', {
        country: query.country,
      });
    }

    const [listings, total] = await listingQuery.getManyAndCount();

    return {
      items: listings.map(toAdoptionListingResponseDto),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async getListingById(id: string): Promise<AdoptionListingResponseDto> {
    const listing = await this.findListingByIdOrThrow(id);
    return toAdoptionListingResponseDto(listing);
  }

  async updateListing(
    id: string,
    payload: UpdateAdoptionListingDto,
    actorUserId: string,
  ): Promise<AdoptionListingResponseDto> {
    const listing = await this.findListingByIdOrThrow(id);
    this.assertListingOwner(listing, actorUserId);

    if (isTerminalStatus(listing.status)) {
      throw new BadRequestException(
        `Listing in status ${listing.status} cannot be edited`,
      );
    }

    const adoptionFeeCents =
      payload.adoptionFeeCents === undefined
        ? listing.adoptionFeeCents
        : payload.adoptionFeeCents;
    const currency =
      payload.currency === undefined ? listing.currency : payload.currency;

    this.assertFeeCurrencyPair(adoptionFeeCents, currency);

    this.adoptionListingRepository.merge(listing, {
      title: payload.title,
      description: payload.description,
      adoptionFeeCents,
      currency,
      city: payload.city,
      state: payload.state,
      country: payload.country,
    });

    await this.adoptionListingRepository.save(listing);

    const updatedListing = await this.findListingByIdOrThrow(id);
    return toAdoptionListingResponseDto(updatedListing);
  }

  async updateListingStatus(
    id: string,
    status: AdoptionListingStatus,
    actorUserId: string,
  ): Promise<AdoptionListingResponseDto> {
    const listing = await this.findListingByIdOrThrow(id);
    this.assertListingOwner(listing, actorUserId);

    if (!canTransitionStatus(listing.status, status)) {
      throw new BadRequestException(
        `Cannot transition listing status from ${listing.status} to ${status}`,
      );
    }

    if (listing.status === status) {
      return toAdoptionListingResponseDto(listing);
    }

    listing.status = status;

    if (status === AdoptionListingStatus.Published && !listing.publishedAt) {
      listing.publishedAt = new Date();
    }

    if (isTerminalStatus(status) && !listing.closedAt) {
      listing.closedAt = new Date();
    }

    await this.adoptionListingRepository.save(listing);

    const updatedListing = await this.findListingByIdOrThrow(id);
    return toAdoptionListingResponseDto(updatedListing);
  }

  private async findListingByIdOrThrow(
    id: string,
  ): Promise<AdoptionListingEntity> {
    const listing = await this.adoptionListingRepository.findOne({
      where: { id },
      relations: {
        pet: {
          species: true,
        },
      },
    });

    if (!listing) {
      throw new NotFoundException(
        `Adoption listing with id ${id} was not found`,
      );
    }

    return listing;
  }

  private async findPetByIdOrThrow(id: string): Promise<PetEntity> {
    const pet = await this.petRepository.findOne({ where: { id } });

    if (!pet) {
      throw new BadRequestException(`Pet with id ${id} does not exist`);
    }

    return pet;
  }

  private assertListingOwner(
    listing: AdoptionListingEntity,
    actorUserId: string,
  ): void {
    if (listing.ownerUserId !== actorUserId) {
      throw new ForbiddenException(
        'You are not allowed to manage this adoption listing',
      );
    }
  }

  private assertFeeCurrencyPair(
    adoptionFeeCents: number | null | undefined,
    currency: string | null | undefined,
  ): void {
    const hasFee = adoptionFeeCents !== undefined && adoptionFeeCents !== null;
    const hasCurrency = currency !== undefined && currency !== null;

    if (hasFee !== hasCurrency) {
      throw new BadRequestException(
        'adoptionFeeCents and currency must both be provided or both omitted',
      );
    }
  }

  private isActiveListingUniqueViolation(error: unknown): boolean {
    const maybeQueryError = error as QueryFailedError & {
      code?: string;
      constraint?: string;
    };

    return (
      maybeQueryError.code === '23505' &&
      maybeQueryError.constraint === 'UQ_adoption_listings_active_pet'
    );
  }
}
