import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  HttpException,
  HttpStatus,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiErrorCode } from './api-error-codes';
import type {
  ApiErrorResponse,
  ApiValidationErrorItem,
} from './api-response.types';
import { getProblemTypeMapping } from './problem-type.mapper';

interface ValidationErrorPayload {
  readonly message?: string | string[];
  readonly error?: string;
  readonly statusCode?: number;
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const timestamp = new Date().toISOString();
    const path = request.originalUrl || request.url;

    const errorResponse = this.buildErrorResponse(
      exception,
      status,
      timestamp,
      path,
    );

    response.status(status).json(errorResponse);
  }

  private buildErrorResponse(
    exception: unknown,
    status: number,
    timestamp: string,
    path: string,
  ): ApiErrorResponse {
    if (this.isValidationException(exception)) {
      const validationException = exception as BadRequestException;

      return {
        success: false,
        error: {
          type: 'https://api.petscorner.dev/problems/validation',
          code: ApiErrorCode.ValidationError,
          title: 'Validation failed',
          status,
          detail: 'One or more fields are invalid',
          errors: this.extractValidationItems(validationException),
          timestamp,
          path,
        },
      };
    }

    const mapping = getProblemTypeMapping(status);
    const detail = this.resolveDetail(exception, status);

    return {
      success: false,
      error: {
        type: mapping.type,
        code: mapping.code,
        title: mapping.title,
        status,
        detail,
        timestamp,
        path,
      },
    };
  }

  private isValidationException(exception: unknown): boolean {
    if (!(exception instanceof BadRequestException)) {
      return false;
    }

    const response = exception.getResponse();

    if (typeof response !== 'object') {
      return false;
    }

    const payload = response as ValidationErrorPayload;
    return Array.isArray(payload.message);
  }

  private extractValidationItems(
    exception: BadRequestException,
  ): ApiValidationErrorItem[] {
    const response = exception.getResponse() as ValidationErrorPayload;
    const messages = Array.isArray(response.message) ? response.message : [];

    return messages.map((message) => {
      const normalized = message.replace(/^\s+|\s+$/g, '');
      const field = normalized.split(' ')[0] ?? 'unknown';

      return {
        field,
        message: normalized,
      };
    });
  }

  private resolveDetail(exception: unknown, status: number): string {
    if (status === 500) {
      return 'An unexpected error occurred';
    }

    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (typeof response === 'string') {
        return response;
      }

      if (typeof response === 'object') {
        const payload = response as ValidationErrorPayload;

        if (typeof payload.message === 'string' && payload.message.length) {
          return payload.message;
        }
      }

      return exception.message;
    }

    return 'An unexpected error occurred';
  }
}
