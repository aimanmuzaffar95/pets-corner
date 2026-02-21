import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';

describe('RegisterDto', () => {
  const validPayload = {
    email: '  USER@EXAMPLE.COM  ',
    password: 'Strong!123',
    firstName: '  Aiman ',
    lastName: ' Muzaffar  ',
    bio: '  loves pets ',
  };

  it('accepts a valid payload and normalizes fields', async () => {
    const dto = plainToInstance(RegisterDto, validPayload);
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.email).toBe('user@example.com');
    expect(dto.firstName).toBe('Aiman');
    expect(dto.lastName).toBe('Muzaffar');
    expect(dto.bio).toBe('loves pets');
  });

  it('rejects weak passwords', async () => {
    const dto = plainToInstance(RegisterDto, {
      ...validPayload,
      password: 'password',
    });

    const errors = await validate(dto);
    const passwordError = errors.find((error) => error.property === 'password');

    expect(passwordError).toBeDefined();
  });

  it('rejects blank first name', async () => {
    const dto = plainToInstance(RegisterDto, {
      ...validPayload,
      firstName: '   ',
    });

    const errors = await validate(dto);
    const firstNameError = errors.find(
      (error) => error.property === 'firstName',
    );

    expect(firstNameError).toBeDefined();
  });

  it('normalizes blank bio into null', async () => {
    const dto = plainToInstance(RegisterDto, {
      ...validPayload,
      bio: ' ',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.bio).toBeNull();
  });
});
