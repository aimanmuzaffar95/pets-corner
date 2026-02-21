import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  UnauthorizedException,
  type ArgumentsHost,
} from '@nestjs/common';
import { ApiExceptionFilter } from './api-exception.filter';

describe('ApiExceptionFilter', () => {
  function buildHost() {
    const status = jest.fn().mockReturnThis();
    const json = jest.fn();

    const host = {
      switchToHttp: () => ({
        getRequest: () => ({
          originalUrl: '/auth/register',
          url: '/auth/register',
        }),
        getResponse: () => ({ status, json }),
      }),
    } as unknown as ArgumentsHost;

    return { host, status, json };
  }

  it('maps UnauthorizedException to UNAUTHORIZED', () => {
    const filter = new ApiExceptionFilter();
    const { host, status, json } = buildHost();

    filter.catch(new UnauthorizedException('Invalid email or password'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'UNAUTHORIZED',
          status: HttpStatus.UNAUTHORIZED,
        }),
      }),
    );
  });

  it('maps ConflictException to CONFLICT', () => {
    const filter = new ApiExceptionFilter();
    const { host, status, json } = buildHost();

    filter.catch(new ConflictException('Email is already in use'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'CONFLICT',
          status: HttpStatus.CONFLICT,
        }),
      }),
    );
  });

  it('maps unknown error to INTERNAL_ERROR', () => {
    const filter = new ApiExceptionFilter();
    const { host, status, json } = buildHost();

    filter.catch(new Error('boom'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'INTERNAL_ERROR',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        }),
      }),
    );
  });

  it('formats validation errors into field/message pairs', () => {
    const filter = new ApiExceptionFilter();
    const { host, status, json } = buildHost();

    filter.catch(
      new BadRequestException([
        'email must be an email',
        'password must include uppercase',
      ]),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR',
          errors: [
            {
              field: 'email',
              message: 'email must be an email',
            },
            {
              field: 'password',
              message: 'password must include uppercase',
            },
          ],
        }),
      }),
    );
  });
});
