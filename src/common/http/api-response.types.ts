import type { ApiErrorCode } from './api-error-codes';

export interface ApiResponseMeta {
  readonly timestamp: string;
  readonly path: string;
}

export interface ApiSuccessResponse<T> {
  readonly success: true;
  readonly data: T;
  readonly meta: ApiResponseMeta;
}

export interface ApiValidationErrorItem {
  readonly field: string;
  readonly message: string;
}

export interface ApiErrorBody {
  readonly type: string;
  readonly code: ApiErrorCode;
  readonly title: string;
  readonly status: number;
  readonly detail: string;
  readonly errors?: ApiValidationErrorItem[];
  readonly timestamp: string;
  readonly path: string;
}

export interface ApiErrorResponse {
  readonly success: false;
  readonly error: ApiErrorBody;
}
