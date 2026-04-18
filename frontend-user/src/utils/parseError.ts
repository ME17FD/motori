// utils/parseError.ts
import axios from 'axios';

const HTTP_ERROR_MAP: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  401: 'Invalid credentials.',
  403: 'You do not have permission to perform this action.',
  404: 'Resource not found.',
  409: 'Email already in use.',
  422: 'Validation failed. Please check your input.',
  429: 'Too many requests. Please try again later.',
  500: 'Server error. Please try again later.',
};

interface BackendValidationError {
  field: string;
  message: string;
}

interface BackendErrorResponse {
  message?: string;
  errors?: BackendValidationError[];
}

const isBackendErrorResponse = (data: unknown): data is BackendErrorResponse =>
  typeof data === 'object' && data !== null;

const extractValidationErrors = (errors: BackendValidationError[]): string =>
  errors.map(({ field, message }) => `${field}: ${message}`).join(', ');

const parseError = (error: unknown): string => {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error) return error.message;
    return 'An unexpected error occurred.';
  }

  const status = error.response?.status;
  const data = error.response?.data;

  if (status !== undefined && isBackendErrorResponse(data)) {
    // validation errors array from backend
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return extractValidationErrors(data.errors);
    }

    // backend message override
    if (typeof data.message === 'string' && data.message.trim() !== '') {
      return data.message;
    }

    // mapped HTTP status
    if (status in HTTP_ERROR_MAP) {
      return HTTP_ERROR_MAP[status];
    }
  }

  // network error (no response)
  if (error.request && !error.response) {
    return 'Network error. Please check your connection.';
  }

  return 'An unexpected error occurred.';
};

export default parseError;