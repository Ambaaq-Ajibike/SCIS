/**
 * Centralized error handling utilities
 */

import { ApiError } from '@/lib/api';

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError;
    if (apiError.message) {
      return apiError.message;
    }
  }
  
  return 'An unexpected error occurred';
};

export const getApiErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    return axiosError.response?.data?.message || 'An error occurred';
  }
  
  return getErrorMessage(error);
};

export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as ApiError).message === 'string'
  );
};

