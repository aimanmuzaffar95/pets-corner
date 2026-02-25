import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import type { Repository } from 'typeorm';
import { AdoptionListingsService } from './adoption-listings.service';
import { AdoptionListingStatus } from './entities/adoption-listing-status.enum';
import type { AdoptionListingEntity } from './entities/adoption-listing.entity';

describe('AdoptionListingsService', () => {
  const listingId = 'bce2d0a5-8f26-4fb2-b4a3-a6312785f4ab';
  const ownerUserId = '3af3893c-0da2-44fd-ba83-c860ff5354f7';
  const anotherUserId = 'd7d1fc89-32dc-43b4-a3d5-0fa34e82f5ef';

  let service: AdoptionListingsService;
  let listingRepository: jest.Mocked<Repository<AdoptionListingEntity>>;
  let petRepository: {
    findOne: jest.Mock;
  };

  const makeListing = (
    status: AdoptionListingStatus = AdoptionListingStatus.Draft,
  ): AdoptionListingEntity =>
    ({
      id: listingId,
      petId: '06520a84-bffd-4929-bf79-8beabdf26e8f',
      ownerUserId,
      status,
      title: 'Friendly dog',
      description: 'Very calm and playful',
      adoptionFeeCents: 10000,
      currency: 'USD',
      city: 'Austin',
      state: 'Texas',
      country: 'US',
      publishedAt: null,
      closedAt: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      deletedAt: null,
      pet: {
        id: '06520a84-bffd-4929-bf79-8beabdf26e8f',
        name: 'Milo',
        breed: 'Labrador',
        age: 3,
        speciesId: 'f8b4ad8a-c7a5-4483-96e2-58d7f865b0b4',
        species: {
          id: 'f8b4ad8a-c7a5-4483-96e2-58d7f865b0b4',
          code: 'DOG',
          label: 'Dog',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        },
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        deletedAt: null,
      },
      owner: undefined as never,
    }) as AdoptionListingEntity;

  beforeEach(() => {
    listingRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      merge: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as unknown as jest.Mocked<Repository<AdoptionListingEntity>>;

    petRepository = {
      findOne: jest.fn(),
    };

    service = new AdoptionListingsService(
      listingRepository,
      petRepository as unknown as Repository<never>,
    );
  });

  it('publishes listing and sets publishedAt timestamp', async () => {
    const listing = makeListing(AdoptionListingStatus.Draft);
    const listingAfterPublish = makeListing(AdoptionListingStatus.Published);
    listingAfterPublish.publishedAt = new Date('2026-01-10T00:00:00.000Z');

    listingRepository.findOne
      .mockResolvedValueOnce(listing)
      .mockResolvedValueOnce(listingAfterPublish);
    listingRepository.save.mockResolvedValue(listingAfterPublish);

    const response = await service.updateListingStatus(
      listingId,
      AdoptionListingStatus.Published,
      ownerUserId,
    );

    expect(response.status).toBe(AdoptionListingStatus.Published);
    expect(listingRepository.save.mock.calls).toHaveLength(1);
  });

  it('rejects invalid status transition', async () => {
    listingRepository.findOne.mockResolvedValue(makeListing());

    await expect(
      service.updateListingStatus(
        listingId,
        AdoptionListingStatus.Adopted,
        ownerUserId,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects listing update by non-owner', async () => {
    listingRepository.findOne.mockResolvedValue(makeListing());

    await expect(
      service.updateListing(
        listingId,
        {
          title: 'Updated title',
        },
        anotherUserId,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws conflict when active-listing unique index is violated', async () => {
    const listing = makeListing();
    petRepository.findOne.mockResolvedValue({ id: listing.petId });
    listingRepository.create.mockReturnValue(listing);
    listingRepository.save.mockRejectedValue({
      code: '23505',
      constraint: 'UQ_adoption_listings_active_pet',
    });

    await expect(
      service.createListing(
        {
          petId: listing.petId,
          title: listing.title,
          description: listing.description,
          adoptionFeeCents: listing.adoptionFeeCents,
          currency: listing.currency,
          city: listing.city,
          state: listing.state,
          country: listing.country,
        },
        ownerUserId,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
