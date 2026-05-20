import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'content-type',
  'access-control-allow-methods': 'GET,PATCH,OPTIONS',
};

export function jsonResponse(
  statusCode: number,
  body: unknown,
): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json',
      ...CORS_HEADERS,
    },
    body: JSON.stringify(body),
  };
}
