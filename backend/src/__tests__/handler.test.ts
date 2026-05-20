import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import {
  DynamoDBDocumentClient,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';

import { handler } from '../handler.js';

const ddbMock = mockClient(DynamoDBDocumentClient);

beforeEach(() => {
  ddbMock.reset();
  // Silence handler logs during tests.
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

function makeEvent(partial: Partial<APIGatewayProxyEventV2>): APIGatewayProxyEventV2 {
  return {
    version: '2.0',
    routeKey: '$default',
    rawPath: '/',
    rawQueryString: '',
    headers: {},
    requestContext: {
      accountId: '0',
      apiId: 't',
      domainName: 'd',
      domainPrefix: 'd',
      http: { method: 'GET', path: '/', protocol: 'HTTP/1.1', sourceIp: '0', userAgent: 'test' },
      requestId: 'req-1',
      routeKey: '$default',
      stage: '$default',
      time: '',
      timeEpoch: 0,
    },
    isBase64Encoded: false,
    ...partial,
  } as APIGatewayProxyEventV2;
}

describe('handler routes', () => {
  it('GET /tasks returns sorted task list (200)', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [
        { PK: 'TASK', SK: 'b', name: 'Volunteers', task: 'B', time: '08:00', priority: 'medium', done: false, sortKey: 2 },
        { PK: 'TASK', SK: 'a', name: 'Volunteers', task: 'A', time: '07:00', priority: 'high',   done: false, sortKey: 1 },
      ],
    });
    const res = await handler(makeEvent({ routeKey: 'GET /tasks' }));
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body!);
    expect(body).toHaveLength(2);
    expect(body[0].id).toBe('a');
    expect(body[1].id).toBe('b');
  });

  it('PATCH /tasks/{id} happy path returns updated task (200)', async () => {
    ddbMock.on(UpdateCommand).resolves({
      Attributes: { PK: 'TASK', SK: 'a', name: 'X', task: 'T', time: '07:00', priority: 'high', done: true, sortKey: 1 },
    });
    const res = await handler(makeEvent({
      routeKey: 'PATCH /tasks/{id}',
      pathParameters: { id: 'a' },
      body: JSON.stringify({ done: true }),
    }));
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body!).done).toBe(true);
  });

  it('PATCH with non-boolean done returns 400 BAD_REQUEST', async () => {
    const res = await handler(makeEvent({
      routeKey: 'PATCH /tasks/{id}',
      pathParameters: { id: 'a' },
      body: JSON.stringify({ done: 'yes' }),
    }));
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body!).error.code).toBe('BAD_REQUEST');
  });

  it('PATCH against missing item returns 404 NOT_FOUND', async () => {
    const err = Object.assign(new Error('cond'), { name: 'ConditionalCheckFailedException' });
    ddbMock.on(UpdateCommand).rejects(err);
    const res = await handler(makeEvent({
      routeKey: 'PATCH /tasks/{id}',
      pathParameters: { id: 'missing' },
      body: JSON.stringify({ done: true }),
    }));
    expect(res.statusCode).toBe(404);
    expect(JSON.parse(res.body!).error.code).toBe('NOT_FOUND');
  });

  it('DDB outage returns 503 SERVICE_UNAVAILABLE', async () => {
    const err = Object.assign(new Error('down'), { name: 'ServiceUnavailable' });
    ddbMock.on(QueryCommand).rejects(err);
    const res = await handler(makeEvent({ routeKey: 'GET /tasks' }));
    expect(res.statusCode).toBe(503);
    expect(JSON.parse(res.body!).error.code).toBe('SERVICE_UNAVAILABLE');
  });

  it('GET /bootstrap returns all four collections', async () => {
    ddbMock.on(QueryCommand).callsFake((input) => {
      const pk = input.ExpressionAttributeValues![':pk'];
      const items: Record<string, unknown>[] = pk === 'TASK'
        ? [{ PK: 'TASK', SK: '1', name: 'n', task: 't', time: '07:00', priority: 'high', done: false, sortKey: 1 }]
        : pk === 'TEAM'
        ? [{ PK: 'TEAM', SK: '1', name: 'n', icon: '⚽', color: '#000', count: 3, tasks: ['x'], sortKey: 1 }]
        : pk === 'PREP'
        ? [{ PK: 'PREP', SK: '1', label: 'l', done: false, sortKey: 1 }]
        : [{ PK: 'MILESTONE', SK: '1', icon: '📧', task: 'm', date: 'Now', done: false, sortKey: 1 }];
      return Promise.resolve({ Items: items });
    });
    const res = await handler(makeEvent({ routeKey: 'GET /bootstrap' }));
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body!);
    expect(body.tasks).toHaveLength(1);
    expect(body.teams).toHaveLength(1);
    expect(body.prepItems).toHaveLength(1);
    expect(body.milestones).toHaveLength(1);
  });

  it('Unknown route returns 404', async () => {
    const res = await handler(makeEvent({ routeKey: 'GET /not-real' }));
    expect(res.statusCode).toBe(404);
  });
});
