import { HttpStatus } from '@nestjs/common';
import { ApiErrorCode } from './api-error-codes';

export interface ProblemTypeMapping {
  readonly type: string;
  readonly title: string;
  readonly code: ApiErrorCode;
}

const problemBaseUrl = 'https://api.petscorner.dev/problems';

const mappingByStatus: Readonly<Record<number, ProblemTypeMapping>> = {
  [HttpStatus.BAD_REQUEST]: {
    type: `${problemBaseUrl}/validation`,
    title: 'Validation failed',
    code: ApiErrorCode.ValidationError,
  },
  [HttpStatus.UNAUTHORIZED]: {
    type: `${problemBaseUrl}/unauthorized`,
    title: 'Unauthorized',
    code: ApiErrorCode.Unauthorized,
  },
  [HttpStatus.FORBIDDEN]: {
    type: `${problemBaseUrl}/forbidden`,
    title: 'Forbidden',
    code: ApiErrorCode.Forbidden,
  },
  [HttpStatus.NOT_FOUND]: {
    type: `${problemBaseUrl}/not-found`,
    title: 'Resource not found',
    code: ApiErrorCode.NotFound,
  },
  [HttpStatus.CONFLICT]: {
    type: `${problemBaseUrl}/conflict`,
    title: 'Conflict',
    code: ApiErrorCode.Conflict,
  },
};

const internalErrorMapping: ProblemTypeMapping = {
  type: `${problemBaseUrl}/internal`,
  title: 'Internal server error',
  code: ApiErrorCode.InternalError,
};

export function getProblemTypeMapping(status: number): ProblemTypeMapping {
  return mappingByStatus[status] ?? internalErrorMapping;
}
