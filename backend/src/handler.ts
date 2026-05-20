import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';

import { listTasks, toggleTask } from './routes/tasks.js';
import { listTeams } from './routes/teams.js';
import { listPrep, togglePrep } from './routes/prep.js';
import { listMilestones, toggleMilestone } from './routes/milestones.js';
import { getBootstrap } from './routes/bootstrap.js';
import { jsonResponse } from './lib/response.js';
import { errorResponse } from './lib/errors.js';

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyStructuredResultV2> => {
  const requestId = event.requestContext?.requestId ?? 'unknown';
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ msg: 'request', routeKey: event.routeKey, requestId }));

  try {
    switch (event.routeKey) {
      case 'GET /bootstrap':
        return jsonResponse(200, await getBootstrap());
      case 'GET /tasks':
        return jsonResponse(200, await listTasks());
      case 'PATCH /tasks/{id}':
        return jsonResponse(200, await toggleTask(event));
      case 'GET /teams':
        return jsonResponse(200, await listTeams());
      case 'GET /prep-items':
        return jsonResponse(200, await listPrep());
      case 'PATCH /prep-items/{id}':
        return jsonResponse(200, await togglePrep(event));
      case 'GET /milestones':
        return jsonResponse(200, await listMilestones());
      case 'PATCH /milestones/{id}':
        return jsonResponse(200, await toggleMilestone(event));
      // CORS preflight (API Gateway typically handles this, kept as fallback)
      case 'OPTIONS /{proxy+}':
        return jsonResponse(204, {});
      default:
        return errorResponse(404, 'NOT_FOUND', `Unknown route: ${event.routeKey ?? 'undefined'}`);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(JSON.stringify({ msg: 'error', routeKey: event.routeKey, requestId }));
    return errorResponse.fromException(err);
  }
};
