import { randomUUID } from 'crypto';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import type { VolunteerDay, VolunteerRegistration } from '@nepal-football/shared';
import { queryByPK, putItem, updateItem, deleteItem } from '../db/ddb.js';
import { ValidationError, requirePathParam } from '../lib/errors.js';
import { verifyAdminToken } from '../lib/auth.js';

const VALID_DAYS = new Set<string>(['Friday', 'Saturday', 'Sunday']);

interface VolunteerRecord extends Omit<VolunteerRegistration, 'id'> {
  PK: 'VOLUNTEER';
  SK: string;
  sortKey?: number;
}

function toVolunteer(r: VolunteerRecord): VolunteerRegistration {
  return {
    id: r.SK,
    name: r.name,
    email: r.email,
    days: r.days,
    submittedAt: r.submittedAt,
    ...(r.phone   !== undefined && { phone: r.phone }),
    ...(r.city    !== undefined && { city:  r.city  }),
    ...(r.notes   !== undefined && { notes: r.notes }),
  };
}

interface VolunteerBody {
  name: string;
  email: string;
  days: VolunteerDay[];
  phone?: string;
  city?: string;
  notes?: string;
}

function parseVolunteerBody(raw: string | undefined | null): VolunteerBody {
  if (!raw) throw new ValidationError('Request body is required');
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch {
    throw new ValidationError('Request body is not valid JSON');
  }
  if (typeof parsed !== 'object' || parsed === null) {
    throw new ValidationError('Request body must be a JSON object');
  }
  const p = parsed as Record<string, unknown>;

  if (typeof p.name !== 'string' || !p.name.trim()) {
    throw new ValidationError('Field "name" is required');
  }
  if (p.name.trim().length > 100) {
    throw new ValidationError('Field "name" must be 100 characters or fewer');
  }
  if (typeof p.email !== 'string' || !p.email.trim()) {
    throw new ValidationError('Field "email" is required');
  }
  if (p.email.trim().length > 200) {
    throw new ValidationError('Field "email" must be 200 characters or fewer');
  }
  if (!Array.isArray(p.days) || p.days.length === 0) {
    throw new ValidationError('Field "days" must be a non-empty array');
  }
  for (const d of p.days as unknown[]) {
    if (typeof d !== 'string' || !VALID_DAYS.has(d)) {
      throw new ValidationError(`Invalid day value: "${d}". Must be Friday, Saturday, or Sunday`);
    }
  }
  if (p.phone !== undefined && (typeof p.phone !== 'string' || p.phone.length > 30)) {
    throw new ValidationError('Field "phone" must be a string of 30 characters or fewer');
  }
  if (p.city !== undefined && (typeof p.city !== 'string' || p.city.length > 100)) {
    throw new ValidationError('Field "city" must be a string of 100 characters or fewer');
  }
  if (p.notes !== undefined && (typeof p.notes !== 'string' || p.notes.length > 500)) {
    throw new ValidationError('Field "notes" must be a string of 500 characters or fewer');
  }

  return {
    name:  p.name.trim(),
    email: p.email.trim(),
    days:  p.days as VolunteerDay[],
    ...(p.phone !== undefined && { phone: (p.phone as string).trim() }),
    ...(p.city  !== undefined && { city:  (p.city  as string).trim() }),
    ...(p.notes !== undefined && { notes: (p.notes as string).trim() }),
  };
}

// ── Public: list all volunteers ───────────────────────────────────────────────
export async function listVolunteers(): Promise<VolunteerRegistration[]> {
  const records = await queryByPK<VolunteerRecord>('VOLUNTEER');
  return records.map(toVolunteer);
}

// ── Public: self-register (no auth required) ─────────────────────────────────
export async function registerVolunteer(
  event: APIGatewayProxyEventV2,
): Promise<VolunteerRegistration> {
  const body = parseVolunteerBody(event.body);
  const sk = randomUUID();
  const now = new Date().toISOString();
  const record: VolunteerRecord = {
    PK: 'VOLUNTEER',
    SK: sk,
    submittedAt: now,
    sortKey: Date.now(),
    ...body,
  };
  await putItem(record);
  return toVolunteer(record);
}

// ── Admin: update a volunteer entry ──────────────────────────────────────────
export async function updateVolunteer(
  event: APIGatewayProxyEventV2,
): Promise<VolunteerRegistration> {
  verifyAdminToken(event);
  const id = requirePathParam(event.pathParameters, 'id');
  const body = parseVolunteerBody(event.body);
  const updated = await updateItem<VolunteerRecord>('VOLUNTEER', id, body);
  return toVolunteer(updated);
}

// ── Admin: delete a volunteer entry ──────────────────────────────────────────
export async function deleteVolunteer(event: APIGatewayProxyEventV2): Promise<void> {
  verifyAdminToken(event);
  const id = requirePathParam(event.pathParameters, 'id');
  await deleteItem('VOLUNTEER', id);
}
