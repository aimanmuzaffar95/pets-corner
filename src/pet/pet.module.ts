import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetEntity } from './entities/pet.entity';
import { SpeciesEntity } from './entities/species.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PetEntity, SpeciesEntity])],
})
export class PetModule {}
