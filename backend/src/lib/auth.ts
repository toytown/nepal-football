import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { createHmac, timingSafeEqual } from 'crypto';
import { ValidationError } from './errors.js';

// ── Minimal JWT implementation (no external deps) ────────────────────────────
// Uses HS256 (HMAC-SHA256). Avoids adding jsonwebtoken to the bundle.

function b64url(input: string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function b64urlDecode(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4;
  return Buffer.from(pad ? padded + '='.repeat(4 - pad) : padded, 'base64').toString('utf8');
}

export interface JwtPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
}

const HEADER = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
const JWT_EXPIRY_SECONDS = 8 * 60 * 60; // 8 hours

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET env var is not set');
  return secret;
}

export function signJwt(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  const now = Math.floor(Date.now() / 1000);
  const full: JwtPayload = { ...payload, iat: now, exp: now + JWT_EXPIRY_SECONDS };
  const data = `${HEADER}.${b64url(JSON.stringify(full))}`;
  const sig = createHmac('sha256', getSecret()).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifyJwt(token: string): JwtPayload {
  const parts = token.split('.');
  if (parts.length !== 3) throw new ValidationError('Invalid token format');
  const [header, payload, sig] = parts;
  const expected = createHmac('sha256', getSecret())
    .update(`${header}.${payload}`)
    .digest('base64url');
  // Constant-time comparison
  const sigBuf = Buffer.from(sig, 'base64url');
  const expBuf = Buffer.from(expected, 'base64url');
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    throw new ValidationError('Invalid token signature');
  }
  let parsed: JwtPayload;
  try {
    parsed = JSON.parse(b64urlDecode(payload)) as JwtPayload;
  } catch {
    throw new ValidationError('Invalid token payload');
  }
  if (Math.floor(Date.now() / 1000) > parsed.exp) {
    throw new ValidationError('Token has expired');
  }
  return parsed;
}

// ── Tagged error for 401 responses ───────────────────────────────────────────
export class UnauthorizedError extends Error {
  readonly tag = 'UnauthorizedError' as const;
  constructor(message = 'Unauthorized') {
    super(message);
  }
}

/**
 * Extract and verify the Bearer token from the Authorization header.
 * Throws UnauthorizedError if missing or invalid.
 */
export function verifyAdminToken(event: APIGatewayProxyEventV2): JwtPayload {
  const authHeader =
    event.headers?.['authorization'] ?? event.headers?.['Authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or malformed Authorization header');
  }
  const token = authHeader.slice(7);
  try {
    return verifyJwt(token);
  } catch (err) {
    throw new UnauthorizedError(err instanceof Error ? err.message : 'Invalid token');
  }
}
