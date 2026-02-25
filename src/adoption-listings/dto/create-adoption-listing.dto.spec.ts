import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateAdoptionListingDto } from './create-adoption-listing.dto';

describe('CreateAdoptionListingDto', () => {
  const validPayload = {
    petId: 'f3c0e6a1-cf3e-4cf3-87ca-f61738c9cb7a',
    title: '  Friendly golden retriever looking for home  ',
    description: '  Calm with kids and house-trained.  ',
    adoptionFeeCents: 15000,
    currency: ' usd ',
    city: '  Austin  ',
    state: '  Texas ',
    country: ' us ',
  };

  it('accepts valid payload and normalizes text fields', async () => {
    const dto = plainToInstance(CreateAdoptionListingDto, validPayload);
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.title).toBe('Friendly golden retriever looking for home');
    expect(dto.description).toBe('Calm with kids and house-trained.');
    expect(dto.currency).toBe('USD');
    expect(dto.country).toBe('US');
    expect(dto.city).toBe('Austin');
  });

  it('rejects payload when currency is provided without fee', async () => {
    const dto = plainToInstance(CreateAdoptionListingDto, {
      ...validPayload,
      adoptionFeeCents: undefined,
    });

    const errors = await validate(dto);

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ property: 'feeCurrencyPairValidator' }),
      ]),
    );
  });
});
