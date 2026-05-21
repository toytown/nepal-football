import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { jsonResponse } from './response.js';

export class ValidationError extends Error {
  readonly tag = 'ValidationError' as const;
  constructor(message: string) {
    super(message);
  }
}

export class NotFoundError extends Error {
  readonly tag = 'NotFoundError' as const;
  constructor(message: string) {
    super(message);
  }
}

interface AwsLikeError {
  name?: string;
  $metadata?: { httpStatusCode?: number };
}

function isAwsError(err: unknown): err is AwsLikeError {
  return typeof err === 'object' && err !== null && ('name' in err || '$metadata' in err);
}

function makeError(
  statusCode: number,
  code: string,
  message: string,
): APIGatewayProxyStructuredResultV2 {
  return jsonResponse(statusCode, { error: { code, message } });
}

/**
 * Build a JSON error response. Also exposes `.fromException` for mapping
 * thrown exceptions to the correct HTTP status code per the design.
 */
export const errorResponse = Object.assign(
  (statusCode: number, code: string, message: string) => makeError(statusCode, code, message),
  {
    fromException(err: unknown): APIGatewayProxyStructuredResultV2 {
      if (err instanceof ValidationError) {
        return makeError(400, 'BAD_REQUEST', err.message);
      }
      if (err instanceof NotFoundError) {
        return makeError(404, 'NOT_FOUND', err.message);
      }
      // Import lazily to avoid circular dep — check by tag string
      if (
        typeof err === 'object' &&
        err !== null &&
        (err as { tag?: string }).tag === 'UnauthorizedError'
      ) {
        return makeError(401, 'UNAUTHORIZED', (err as Error).message);
      }
      if (isAwsError(err)) {
        const name = err.name ?? '';
        if (name === 'ConditionalCheckFailedException') {
          return makeError(404, 'NOT_FOUND', 'Item not found');
        }
        if (
          name === 'ProvisionedThroughputExceededException' ||
          name === 'ServiceUnavailable' ||
          name === 'RequestLimitExceeded' ||
          name === 'InternalServerError' ||
          name === 'ThrottlingException'
        ) {
          return makeError(503, 'SERVICE_UNAVAILABLE', 'Database temporarily unavailable');
        }
      }
      const message = err instanceof Error ? err.message : 'Unexpected error';
      // eslint-disable-next-line no-console
      console.error('[handler] unhandled error', err);
      return makeError(500, 'INTERNAL_ERROR', message);
    },
  },
);

/**
 * Parse a request body and assert it has a boolean `done` field.
 * Throws `ValidationError` on any failure.
 */
export function validateDoneBody(raw: string | undefined | null): { done: boolean } {
  if (!raw) {
    throw new ValidationError('Request body is required');
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ValidationError('Request body is not valid JSON');
  }
  if (typeof parsed !== 'object' || parsed === null) {
    throw new ValidationError('Request body must be a JSON object');
  }
  const done = (parsed as { done?: unknown }).done;
  if (typeof done !== 'boolean') {
    throw new ValidationError('Field "done" must be a boolean');
  }
  return { done };
}

export function requirePathParam(
  pathParams: Record<string, string | undefined> | undefined,
  name: string,
): string {
  const value = pathParams?.[name];
  if (!value || typeof value !== 'string') {
    throw new ValidationError(`Missing path parameter: ${name}`);
  }
  return value;
}
