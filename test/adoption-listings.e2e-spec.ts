import {
  ValidationPipe,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { type App } from 'supertest/types';
import { AdoptionListingsController } from '../src/adoption-listings/adoption-listings.controller';
import { AdoptionListingsService } from '../src/adoption-listings/adoption-listings.service';
import { AdoptionListingStatus } from '../src/adoption-listings/entities/adoption-listing-status.enum';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { ApiExceptionFilter } from '../src/common/http/api-exception.filter';
import { ApiResponseInterceptor } from '../src/common/http/api-response.interceptor';

describe('AdoptionListingsController (e2e)', () => {
  let app: INestApplication<App>;

  const baseListing = {
    id: '4ccf1165-4862-459f-8bea-20c2938f48db',
    petId: 'b6f470a8-4cf4-4220-a9a1-b01ddfd7050e',
    petName: 'Milo',
    petBreed: 'Labrador',
    petAge: 3,
    speciesId: 'a0f6f96e-c772-4a53-8520-2b245abde1ca',
    speciesCode: 'DOG',
    speciesLabel: 'Dog',
    ownerUserId: 'f4d6eef0-afcc-47b5-a3ed-57ab15aa73f9',
    status: AdoptionListingStatus.Draft,
    title: 'Friendly Labrador for adoption',
    description: 'House-trained and good with kids',
    adoptionFeeCents: 12000,
    currency: 'USD',
    city: 'Austin',
    state: 'Texas',
    country: 'US',
    publishedAt: null,
    closedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  const adoptionListingsServiceMock = {
    createListing: jest.fn().mockResolvedValue(baseListing),
    listListings: jest.fn().mockResolvedValue({
      items: [baseListing],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    }),
    getListingById: jest.fn().mockResolvedValue(baseListing),
    updateListing: jest.fn().mockResolvedValue({
      ...baseListing,
      title: 'Updated title',
    }),
    updateListingStatus: jest.fn().mockResolvedValue({
      ...baseListing,
      status: AdoptionListingStatus.Published,
      publishedAt: '2026-01-02T00:00:00.000Z',
    }),
  };

  const authGuardMock: CanActivate = {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest<{
        user?: { sub: string; email: string };
      }>();

      request.user = {
        sub: 'f4d6eef0-afcc-47b5-a3ed-57ab15aa73f9',
        email: 'owner@example.com',
      };

      return true;
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AdoptionListingsController],
      providers: [
        {
          provide: AdoptionListingsService,
          useValue: adoptionListingsServiceMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(authGuardMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalInterceptors(new ApiResponseInterceptor());
    app.useGlobalFilters(new ApiExceptionFilter());
    await app.init();
  });

  it('POST /adoption-listings creates listing', async () => {
    await request(app.getHttpServer())
      .post('/adoption-listings')
      .send({
        petId: baseListing.petId,
        title: baseListing.title,
        description: baseListing.description,
        adoptionFeeCents: baseListing.adoptionFeeCents,
        currency: baseListing.currency,
        city: baseListing.city,
        state: baseListing.state,
        country: baseListing.country,
      })
      .expect(201)
      .expect((response) => {
        expect(response.body).toMatchObject({
          success: true,
          data: {
            id: baseListing.id,
            status: AdoptionListingStatus.Draft,
          },
          meta: {
            path: '/adoption-listings',
          },
        });
      });

    expect(adoptionListingsServiceMock.createListing.mock.calls).toHaveLength(
      1,
    );
  });

  it('PATCH /adoption-listings/:id/status updates status', async () => {
    await request(app.getHttpServer())
      .patch(`/adoption-listings/${baseListing.id}/status`)
      .send({
        status: AdoptionListingStatus.Published,
      })
      .expect(200)
      .expect((response) => {
        expect(response.body).toMatchObject({
          success: true,
          data: {
            status: AdoptionListingStatus.Published,
          },
          meta: {
            path: `/adoption-listings/${baseListing.id}/status`,
          },
        });
      });
  });

  it('GET /adoption-listings supports list payload', async () => {
    await request(app.getHttpServer())
      .get('/adoption-listings?status=PUBLISHED&page=1&limit=20')
      .expect(200)
      .expect((response) => {
        expect(response.body).toMatchObject({
          success: true,
          data: {
            items: expect.any(Array),
            pagination: {
              page: 1,
              limit: 20,
            },
          },
          meta: {
            path: '/adoption-listings?status=PUBLISHED&page=1&limit=20',
          },
        });
      });
  });
});
