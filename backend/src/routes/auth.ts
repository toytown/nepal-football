import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { createHash } from 'crypto';
import { ValidationError } from '../lib/errors.js';
import { UnauthorizedError, signJwt } from '../lib/auth.js';

interface LoginBody {
  username: string;
  password: string;
}

function parseLoginBody(raw: string | undefined | null): LoginBody {
  if (!raw) throw new ValidationError('Request body is required');
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ValidationError('Request body is not valid JSON');
  }
  if (typeof parsed !== 'object' || parsed === null) {
    throw new ValidationError('Request body must be a JSON object');
  }
  const { username, password } = parsed as Record<string, unknown>;
  if (typeof username !== 'string' || !username.trim()) {
    throw new ValidationError('Field "username" is required');
  }
  if (typeof password !== 'string' || !password) {
    throw new ValidationError('Field "password" is required');
  }
  return { username: username.trim(), password };
}

/**
 * Simple constant-time string comparison using SHA-256 digests.
 * Avoids timing attacks without pulling in bcrypt.
 */
function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  if (ha.length !== hb.length) return false;
  let diff = 0;
  for (let i = 0; i < ha.length; i++) diff |= ha[i] ^ hb[i];
  return diff === 0;
}

export async function login(event: APIGatewayProxyEventV2): Promise<{ token: string }> {
  const { username, password } = parseLoginBody(event.body);

  const adminUsername = process.env.ADMIN_USERNAME ?? '';
  const adminPassword = process.env.ADMIN_PASSWORD ?? '';

  if (!adminUsername || !adminPassword) {
    throw new Error('Admin credentials are not configured');
  }

  const usernameOk = safeEqual(username, adminUsername);
  const passwordOk = safeEqual(password, adminPassword);

  if (!usernameOk || !passwordOk) {
    throw new UnauthorizedError('Invalid username or password');
  }

  const token = signJwt({ sub: username, role: 'admin' });
  return { token };
}
