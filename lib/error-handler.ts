/**
 * Centralized error handling utilities
 * Provides consistent error responses and logging
 */

import { NextResponse } from 'next/server';
import { ErrorResponse } from './types';

/**
 * Standard error response format
 */
export function createErrorResponse(
  error: string,
  details?: string,
  status: number = 500
): NextResponse<ErrorResponse> {
  console.error(`[Error ${status}]: ${error}`, details ? `Details: ${details}` : '');
  
  return NextResponse.json(
    {
      error,
      ...(details && { details }),
    },
    { status }
  );
}

/**
 * Handle unknown errors gracefully
 */
export function handleUnknownError(error: unknown): NextResponse<ErrorResponse> {
  if (error instanceof Error) {
    return createErrorResponse('Interne serverfout', error.message, 500);
  }
  
  return createErrorResponse('Interne serverfout', String(error), 500);
}

/**
 * Validation error response
 */
export function createValidationError(message: string): NextResponse<ErrorResponse> {
  return createErrorResponse('Validatiefout', message, 400);
}

/**
 * Authentication error response
 */
export function createAuthError(message: string = 'Authenticatie vereist'): NextResponse<ErrorResponse> {
  return createErrorResponse(message, undefined, 401);
}

/**
 * Not found error response
 */
export function createNotFoundError(resource: string = 'Resource'): NextResponse<ErrorResponse> {
  return createErrorResponse(`${resource} niet gevonden`, undefined, 404);
}
