import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetEntity } from '../pet/entities/pet.entity';
import { AdoptionListingsController } from './adoption-listings.controller';
import { AdoptionListingsService } from './adoption-listings.service';
import { AdoptionListingEntity } from './entities/adoption-listing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AdoptionListingEntity, PetEntity])],
  controllers: [AdoptionListingsController],
  providers: [AdoptionListingsService],
})
export class AdoptionListingsModule {}
