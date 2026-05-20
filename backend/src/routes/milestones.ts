import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import type { Milestone } from '@nepal-football/shared';
import { queryByPK, updateDone } from '../db/ddb.js';
import { requirePathParam, validateDoneBody } from '../lib/errors.js';

interface MilestoneRecord extends Omit<Milestone, 'id'> {
  PK: 'MILESTONE';
  SK: string;
}

function toMilestone(record: MilestoneRecord): Milestone {
  return {
    id: record.SK,
    icon: record.icon,
    task: record.task,
    date: record.date,
    done: record.done,
    sortKey: record.sortKey,
  };
}

export async function listMilestones(): Promise<Milestone[]> {
  const records = await queryByPK<MilestoneRecord>('MILESTONE');
  return records.map(toMilestone);
}

export async function toggleMilestone(event: APIGatewayProxyEventV2): Promise<Milestone> {
  const id = requirePathParam(event.pathParameters, 'id');
  const { done } = validateDoneBody(event.body);
  const updated = await updateDone<MilestoneRecord>('MILESTONE', id, done);
  return toMilestone(updated);
}
