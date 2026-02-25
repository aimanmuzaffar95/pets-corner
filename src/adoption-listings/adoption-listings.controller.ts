import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtUserPayload } from '../auth/interfaces/jwt-user-payload.interface';
import { AdoptionListingsService } from './adoption-listings.service';
import type {
  AdoptionListingListResponseDto,
  AdoptionListingResponseDto,
} from './dto/adoption-listing-response.dto';
import { CreateAdoptionListingDto } from './dto/create-adoption-listing.dto';
import { ListAdoptionListingsQueryDto } from './dto/list-adoption-listings-query.dto';
import { UpdateAdoptionListingDto } from './dto/update-adoption-listing.dto';
import { UpdateAdoptionListingStatusDto } from './dto/update-adoption-listing-status.dto';

@Controller('adoption-listings')
export class AdoptionListingsController {
  constructor(
    private readonly adoptionListingsService: AdoptionListingsService,
  ) {}

  @Get()
  async listListings(
    @Query() query: ListAdoptionListingsQueryDto,
  ): Promise<AdoptionListingListResponseDto> {
    return this.adoptionListingsService.listListings(query);
  }

  @Get(':id')
  async getListingById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<AdoptionListingResponseDto> {
    return this.adoptionListingsService.getListingById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createListing(
    @Body() payload: CreateAdoptionListingDto,
    @CurrentUser() currentUser: JwtUserPayload,
  ): Promise<AdoptionListingResponseDto> {
    return this.adoptionListingsService.createListing(payload, currentUser.sub);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateListing(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() payload: UpdateAdoptionListingDto,
    @CurrentUser() currentUser: JwtUserPayload,
  ): Promise<AdoptionListingResponseDto> {
    return this.adoptionListingsService.updateListing(
      id,
      payload,
      currentUser.sub,
    );
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateListingStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() payload: UpdateAdoptionListingStatusDto,
    @CurrentUser() currentUser: JwtUserPayload,
  ): Promise<AdoptionListingResponseDto> {
    return this.adoptionListingsService.updateListingStatus(
      id,
      payload.status,
      currentUser.sub,
    );
  }
}
