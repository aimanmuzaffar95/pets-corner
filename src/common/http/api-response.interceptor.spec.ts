import { HttpStatus, type ExecutionContext } from '@nestjs/common';
import { firstValueFrom, of } from 'rxjs';
import { ApiResponseInterceptor } from './api-response.interceptor';

describe('ApiResponseInterceptor', () => {
  it('wraps successful non-204 responses', async () => {
    const interceptor = new ApiResponseInterceptor<{ ok: boolean }>();

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          originalUrl: '/auth/login',
          url: '/auth/login',
        }),
        getResponse: () => ({
          statusCode: HttpStatus.OK,
        }),
      }),
    } as unknown as ExecutionContext;

    const result = await firstValueFrom(
      interceptor.intercept(context, {
        handle: () => of({ ok: true }),
      }),
    );

    expect(result).toMatchObject({
      success: true,
      data: { ok: true },
      meta: {
        path: '/auth/login',
      },
    });
    expect((result as { meta: { timestamp: string } }).meta.timestamp).toEqual(
      expect.any(String),
    );
  });

  it('does not wrap 204 responses', async () => {
    const interceptor = new ApiResponseInterceptor<{ ok: boolean }>();

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          originalUrl: '/pets/1',
          url: '/pets/1',
        }),
        getResponse: () => ({
          statusCode: HttpStatus.NO_CONTENT,
        }),
      }),
    } as unknown as ExecutionContext;

    const result = await firstValueFrom(
      interceptor.intercept(context, {
        handle: () => of({ ok: true }),
      }),
    );

    expect(result).toEqual({ ok: true });
  });
});
