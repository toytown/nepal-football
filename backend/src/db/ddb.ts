import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  QueryCommand,
  GetCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

const region = process.env.AWS_REGION ?? 'eu-central-1';
export const TABLE_NAME = process.env.TABLE_NAME ?? 'nepal-football-data';

const ddbClient = new DynamoDBClient({ region });
export const ddb = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: { removeUndefinedValues: true, convertClassInstanceToMap: true },
});

export type EntityPK = 'TASK' | 'TEAM' | 'PREP' | 'MILESTONE';

export interface BaseRecord {
  PK: EntityPK;
  SK: string;
  sortKey?: number;
}

/**
 * Query all items with the given partition key.
 * Results are sorted by `sortKey` ascending in-memory before return so the UI
 * gets stable order without requiring a GSI.
 */
export async function queryByPK<T extends BaseRecord = BaseRecord>(pk: EntityPK): Promise<T[]> {
  const items: T[] = [];
  let exclusiveStartKey: Record<string, unknown> | undefined;

  do {
    const res: { Items?: unknown[]; LastEvaluatedKey?: Record<string, unknown> } = await ddb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: { ':pk': pk },
        ExclusiveStartKey: exclusiveStartKey,
      }),
    );
    if (res.Items) items.push(...(res.Items as T[]));
    exclusiveStartKey = res.LastEvaluatedKey;
  } while (exclusiveStartKey);

  return items.sort((a, b) => (a.sortKey ?? 0) - (b.sortKey ?? 0));
}

export async function getItem<T extends BaseRecord = BaseRecord>(pk: EntityPK, sk: string): Promise<T | undefined> {
  const res = await ddb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: pk, SK: sk },
    }),
  );
  return res.Item as T | undefined;
}

/**
 * Toggle the `done` flag on an item. Uses a conditional check so that a
 * non-existent item produces a `ConditionalCheckFailedException`, which the
 * error mapper turns into HTTP 404.
 */
export async function updateDone<T extends BaseRecord = BaseRecord>(
  pk: EntityPK,
  sk: string,
  done: boolean,
): Promise<T> {
  const res = await ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: pk, SK: sk },
      UpdateExpression: 'SET #d = :done',
      ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)',
      ExpressionAttributeNames: { '#d': 'done' },
      ExpressionAttributeValues: { ':done': done },
      ReturnValues: 'ALL_NEW',
    }),
  );
  return res.Attributes as T;
}
