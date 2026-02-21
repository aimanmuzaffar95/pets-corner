import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  it('accepts valid payload and normalizes email', async () => {
    const dto = plainToInstance(LoginDto, {
      email: '  USER@EXAMPLE.COM ',
      password: 'Strong!123',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.email).toBe('user@example.com');
  });

  it('rejects missing password', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'user@example.com',
    });

    const errors = await validate(dto);
    const passwordError = errors.find((error) => error.property === 'password');

    expect(passwordError).toBeDefined();
  });
});
