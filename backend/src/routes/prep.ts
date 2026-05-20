import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import type { PrepItem } from '@nepal-football/shared';
import { queryByPK, updateDone } from '../db/ddb.js';
import { requirePathParam, validateDoneBody } from '../lib/errors.js';

interface PrepRecord extends Omit<PrepItem, 'id'> {
  PK: 'PREP';
  SK: string;
}

function toPrepItem(record: PrepRecord): PrepItem {
  return {
    id: record.SK,
    label: record.label,
    done: record.done,
    sortKey: record.sortKey,
  };
}

export async function listPrep(): Promise<PrepItem[]> {
  const records = await queryByPK<PrepRecord>('PREP');
  return records.map(toPrepItem);
}

export async function togglePrep(event: APIGatewayProxyEventV2): Promise<PrepItem> {
  const id = requirePathParam(event.pathParameters, 'id');
  const { done } = validateDoneBody(event.body);
  const updated = await updateDone<PrepRecord>('PREP', id, done);
  return toPrepItem(updated);
}
