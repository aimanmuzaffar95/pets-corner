import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePetDto } from './dto/create-pet.dto';
import type { PetResponseDto } from './dto/pet-response.dto';
import { toPetResponseDto } from './dto/pet-response.dto';
import type { SpeciesResponseDto } from './dto/species-response.dto';
import { toSpeciesResponseDto } from './dto/species-response.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { PetEntity } from './entities/pet.entity';
import { SpeciesEntity } from './entities/species.entity';

@Injectable()
export class PetService {
  constructor(
    @InjectRepository(PetEntity)
    private readonly petRepository: Repository<PetEntity>,
    @InjectRepository(SpeciesEntity)
    private readonly speciesRepository: Repository<SpeciesEntity>,
  ) {}

  async listPets(): Promise<PetResponseDto[]> {
    const pets = await this.petRepository.find({
      relations: {
        species: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return pets.map(toPetResponseDto);
  }

  async getPetById(id: string): Promise<PetResponseDto> {
    const pet = await this.findPetByIdOrThrow(id);
    return toPetResponseDto(pet);
  }

  async listSpecies(): Promise<SpeciesResponseDto[]> {
    const species = await this.speciesRepository.find({
      order: {
        label: 'ASC',
      },
    });

    return species.map(toSpeciesResponseDto);
  }

  async createPet(payload: CreatePetDto): Promise<PetResponseDto> {
    const species = await this.findSpeciesByCodeOrThrow(payload.speciesCode);

    const pet = this.petRepository.create({
      name: payload.name,
      breed: payload.breed,
      age: payload.age,
      speciesId: species.id,
    });

    const savedPet = await this.petRepository.save(pet);
    const createdPet = await this.findPetByIdOrThrow(savedPet.id);
    return toPetResponseDto(createdPet);
  }

  async updatePet(id: string, payload: UpdatePetDto): Promise<PetResponseDto> {
    const pet = await this.findPetByIdOrThrow(id);
    const species =
      payload.speciesCode === undefined
        ? undefined
        : await this.findSpeciesByCodeOrThrow(payload.speciesCode);

    const updatedPet = this.petRepository.merge(pet, {
      name: payload.name,
      breed: payload.breed,
      age: payload.age,
      speciesId: species?.id,
    });

    await this.petRepository.save(updatedPet);
    const petAfterUpdate = await this.findPetByIdOrThrow(id);
    return toPetResponseDto(petAfterUpdate);
  }

  async softDeletePet(id: string): Promise<void> {
    const result = await this.petRepository.softDelete(id);

    if (!result.affected) {
      throw new NotFoundException(`Pet with id ${id} was not found`);
    }
  }

  private async findPetByIdOrThrow(id: string): Promise<PetEntity> {
    const pet = await this.petRepository.findOne({
      where: { id },
      relations: {
        species: true,
      },
    });

    if (!pet) {
      throw new NotFoundException(`Pet with id ${id} was not found`);
    }

    return pet;
  }

  private async findSpeciesByCodeOrThrow(code: string): Promise<SpeciesEntity> {
    const species = await this.speciesRepository.findOneBy({ code });

    if (!species) {
      throw new BadRequestException(`Species with code ${code} does not exist`);
    }

    return species;
  }
}
