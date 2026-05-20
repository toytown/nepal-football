// Seed Lambda — runs once via CDK custom resource. Idempotent: skips writes
// when the table already has any items.

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

import {
  seedTasks,
  seedPrepItems,
  seedMilestones,
  seedTeams,
} from '../seed-data';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME!;

interface PutRequest {
  PutRequest: { Item: Record<string, unknown> };
}

async function batchWrite(items: PutRequest[]): Promise<void> {
  // BatchWrite supports up to 25 per call.
  for (let i = 0; i < items.length; i += 25) {
    const chunk = items.slice(i, i + 25);
    await ddb.send(
      new BatchWriteCommand({ RequestItems: { [TABLE_NAME]: chunk } }),
    );
  }
}

export const handler = async (event: { RequestType?: string }): Promise<{
  PhysicalResourceId: string;
  Data: { seeded: boolean; itemCount: number };
}> => {
  // Only seed on Create/Update; Delete is a no-op (we keep data on stack delete).
  if (event.RequestType === 'Delete') {
    return { PhysicalResourceId: 'nepal-football-seed', Data: { seeded: false, itemCount: 0 } };
  }

  // Idempotency check: scan with Limit=1 to see if anything exists.
  const scan = await ddb.send(
    new ScanCommand({ TableName: TABLE_NAME, Limit: 1, Select: 'COUNT' }),
  );
  if ((scan.Count ?? 0) > 0) {
    // eslint-disable-next-line no-console
    console.log('seed-lambda: table already populated, skipping');
    return { PhysicalResourceId: 'nepal-football-seed', Data: { seeded: false, itemCount: 0 } };
  }

  const all: PutRequest[] = [];

  for (const t of seedTasks) {
    all.push({
      PutRequest: {
        Item: { PK: 'TASK', SK: randomUUID(), ...t },
      },
    });
  }
  for (const p of seedPrepItems) {
    all.push({
      PutRequest: {
        Item: { PK: 'PREP', SK: randomUUID(), ...p },
      },
    });
  }
  for (const m of seedMilestones) {
    all.push({
      PutRequest: {
        Item: { PK: 'MILESTONE', SK: randomUUID(), ...m },
      },
    });
  }
  for (const team of seedTeams) {
    all.push({
      PutRequest: {
        Item: { PK: 'TEAM', SK: randomUUID(), ...team },
      },
    });
  }

  await batchWrite(all);
  // eslint-disable-next-line no-console
  console.log(`seed-lambda: wrote ${all.length} items`);
  return { PhysicalResourceId: 'nepal-football-seed', Data: { seeded: true, itemCount: all.length } };
};
