import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetController } from './pet.controller';
import { PetEntity } from './entities/pet.entity';
import { SpeciesEntity } from './entities/species.entity';
import { PetService } from './pet.service';

@Module({
  imports: [TypeOrmModule.forFeature([PetEntity, SpeciesEntity])],
  controllers: [PetController],
  providers: [PetService],
})
export class PetModule {}
