import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreatePetDto } from './create-pet.dto';

describe('CreatePetDto', () => {
  const validPayload = {
    name: 'Milo',
    breed: 'Labrador',
    age: 4,
    speciesCode: 'DOG',
  };

  it('accepts a valid payload', async () => {
    const dto = plainToInstance(CreatePetDto, validPayload);
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects payload without breed', async () => {
    const dto = plainToInstance(CreatePetDto, {
      name: validPayload.name,
      age: validPayload.age,
      speciesCode: validPayload.speciesCode,
    });

    const errors = await validate(dto);
    const breedError = errors.find((error) => error.property === 'breed');

    expect(breedError).toBeDefined();
  });

  it('rejects payload without age', async () => {
    const dto = plainToInstance(CreatePetDto, {
      name: validPayload.name,
      breed: validPayload.breed,
      speciesCode: validPayload.speciesCode,
    });

    const errors = await validate(dto);
    const ageError = errors.find((error) => error.property === 'age');

    expect(ageError).toBeDefined();
  });

  it('rejects payload with age out of range', async () => {
    const dto = plainToInstance(CreatePetDto, {
      ...validPayload,
      age: 101,
    });

    const errors = await validate(dto);
    const ageError = errors.find((error) => error.property === 'age');

    expect(ageError).toBeDefined();
  });

  it('rejects payload without speciesCode', async () => {
    const dto = plainToInstance(CreatePetDto, {
      name: validPayload.name,
      breed: validPayload.breed,
      age: validPayload.age,
    });

    const errors = await validate(dto);
    const speciesCodeError = errors.find(
      (error) => error.property === 'speciesCode',
    );

    expect(speciesCodeError).toBeDefined();
  });
});
