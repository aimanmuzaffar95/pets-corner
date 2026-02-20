import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreatePetDto } from './dto/create-pet.dto';
import type { PetResponseDto } from './dto/pet-response.dto';
import type { SpeciesResponseDto } from './dto/species-response.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { PetService } from './pet.service';

@Controller('pets')
export class PetController {
  constructor(private readonly petService: PetService) {}

  @Get()
  async listPets(): Promise<PetResponseDto[]> {
    return this.petService.listPets();
  }

  @Get('species')
  async listSpecies(): Promise<SpeciesResponseDto[]> {
    return this.petService.listSpecies();
  }

  @Get(':id')
  async getPetById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<PetResponseDto> {
    return this.petService.getPetById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPet(@Body() payload: CreatePetDto): Promise<PetResponseDto> {
    return this.petService.createPet(payload);
  }

  @Patch(':id')
  async updatePet(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() payload: UpdatePetDto,
  ): Promise<PetResponseDto> {
    return this.petService.updatePet(id, payload);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePet(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.petService.softDeletePet(id);
  }
}
