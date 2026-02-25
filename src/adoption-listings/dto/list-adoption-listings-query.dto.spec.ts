import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ListAdoptionListingsQueryDto } from './list-adoption-listings-query.dto';

describe('ListAdoptionListingsQueryDto', () => {
  it('uses defaults for pagination', async () => {
    const dto = plainToInstance(ListAdoptionListingsQueryDto, {});
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(20);
  });

  it('rejects limit above max value', async () => {
    const dto = plainToInstance(ListAdoptionListingsQueryDto, {
      limit: 101,
    });

    const errors = await validate(dto);
    const limitError = errors.find((error) => error.property === 'limit');

    expect(limitError).toBeDefined();
  });
});
