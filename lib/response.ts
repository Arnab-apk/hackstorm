import { NextResponse } from 'next/server';
import type { APIResponse } from '@/types';

// ===========================================
// SUCCESS RESPONSES
// ===========================================

/**
 * Return a successful response with data
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse {
  const response: APIResponse<T> = {
    success: true,
    data,
  };
  return NextResponse.json(response, { status });
}

/**
 * Return a created response (201)
 */
export function createdResponse<T>(data: T): NextResponse {
  return successResponse(data, 201);
}

/**
 * Return a no content response (204)
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

// ===========================================
// ERROR RESPONSES
// ===========================================

/**
 * Return an error response
 */
export function errorResponse(
  message: string,
  code: string,
  status: number = 400,
  details?: any
): NextResponse {
  const response: APIResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
  return NextResponse.json(response, { status });
}

/**
 * Return a bad request response (400)
 */
export function badRequest(message: string, details?: any): NextResponse {
  return errorResponse(message, 'BAD_REQUEST', 400, details);
}

/**
 * Return an unauthorized response (401)
 */
export function unauthorized(message: string = 'Authentication required'): NextResponse {
  return errorResponse(message, 'UNAUTHORIZED', 401);
}

/**
 * Return a forbidden response (403)
 */
export function forbidden(message: string = 'Access denied'): NextResponse {
  return errorResponse(message, 'FORBIDDEN', 403);
}

/**
 * Return a not found response (404)
 */
export function notFound(resource: string = 'Resource'): NextResponse {
  return errorResponse(`${resource} not found`, 'NOT_FOUND', 404);
}

/**
 * Return a conflict response (409)
 */
export function conflict(message: string): NextResponse {
  return errorResponse(message, 'CONFLICT', 409);
}

/**
 * Return an internal server error response (500)
 */
export function serverError(message: string = 'Internal server error'): NextResponse {
  return errorResponse(message, 'INTERNAL_ERROR', 500);
}

// ===========================================
// VALIDATION RESPONSES
// ===========================================

/**
 * Return a validation error response
 */
export function validationError(errors: string[]): NextResponse {
  return errorResponse(
    'Validation failed',
    'VALIDATION_ERROR',
    400,
    { errors }
  );
}

/**
 * Return a missing field error response
 */
export function missingField(field: string): NextResponse {
  return badRequest(`Missing required field: ${field}`);
}

/**
 * Return an invalid field error response
 */
export function invalidField(field: string, reason: string): NextResponse {
  return badRequest(`Invalid ${field}: ${reason}`);
}

// ===========================================
// PAGINATION RESPONSE
// ===========================================

/**
 * Return a paginated response
 */
export function paginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
): NextResponse {
  return successResponse({
    items,
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  });
}

// ===========================================
// ERROR HANDLER
// ===========================================

/**
 * Handle errors and return appropriate response
 */
export function handleError(error: unknown): NextResponse {
  console.error('API Error:', error);

  if (error instanceof Error) {
    // Check for known error types
    if (error.name === 'AuthError') {
      const authError = error as Error & { statusCode?: number };
      return errorResponse(
        error.message,
        'AUTH_ERROR',
        authError.statusCode || 401
      );
    }

    if (error.message.includes('not found')) {
      return notFound();
    }

    if (error.message.includes('already exists')) {
      return conflict(error.message);
    }

    // Return generic error in production, detailed in development
    if (process.env.NODE_ENV === 'development') {
      return serverError(error.message);
    }
  }

  return serverError();
}
