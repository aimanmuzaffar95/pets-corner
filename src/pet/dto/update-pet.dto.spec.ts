import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdatePetDto } from './update-pet.dto';

describe('UpdatePetDto', () => {
  it('accepts omitted breed and age', async () => {
    const dto = plainToInstance(UpdatePetDto, {
      name: 'Nala',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects breed when null', async () => {
    const dto = plainToInstance(UpdatePetDto, {
      breed: null,
    });

    const errors = await validate(dto);
    const breedError = errors.find((error) => error.property === 'breed');

    expect(breedError).toBeDefined();
  });

  it('rejects age when null', async () => {
    const dto = plainToInstance(UpdatePetDto, {
      age: null,
    });

    const errors = await validate(dto);
    const ageError = errors.find((error) => error.property === 'age');

    expect(ageError).toBeDefined();
  });

  it('rejects speciesCode when null', async () => {
    const dto = plainToInstance(UpdatePetDto, {
      speciesCode: null,
    });

    const errors = await validate(dto);
    const speciesCodeError = errors.find(
      (error) => error.property === 'speciesCode',
    );

    expect(speciesCodeError).toBeDefined();
  });
});
