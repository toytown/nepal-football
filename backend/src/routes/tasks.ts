import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import type { Task } from '@nepal-football/shared';
import { queryByPK, updateDone } from '../db/ddb.js';
import { requirePathParam, validateDoneBody } from '../lib/errors.js';

interface TaskRecord extends Omit<Task, 'id'> {
  PK: 'TASK';
  SK: string;
}

function toTask(record: TaskRecord): Task {
  return {
    id: record.SK,
    name: record.name,
    task: record.task,
    time: record.time,
    priority: record.priority,
    done: record.done,
    sortKey: record.sortKey,
  };
}

export async function listTasks(): Promise<Task[]> {
  const records = await queryByPK<TaskRecord>('TASK');
  return records.map(toTask);
}

export async function toggleTask(event: APIGatewayProxyEventV2): Promise<Task> {
  const id = requirePathParam(event.pathParameters, 'id');
  const { done } = validateDoneBody(event.body);
  const updated = await updateDone<TaskRecord>('TASK', id, done);
  return toTask(updated);
}
