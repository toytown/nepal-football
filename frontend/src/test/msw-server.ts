import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import {
  mockBootstrap,
  mockTasks,
  mockTeams,
  mockPrep,
  mockMilestones,
} from './fixtures';

export const handlers = [
  http.get('/api/bootstrap',  () => HttpResponse.json(mockBootstrap)),
  http.get('/api/tasks',      () => HttpResponse.json(mockTasks)),
  http.get('/api/teams',      () => HttpResponse.json(mockTeams)),
  http.get('/api/prep-items', () => HttpResponse.json(mockPrep)),
  http.get('/api/milestones', () => HttpResponse.json(mockMilestones)),

  http.patch('/api/tasks/:id', async ({ params, request }) => {
    const body = (await request.json()) as { done: boolean };
    const id = String(params.id);
    const t = mockTasks.find((x) => x.id === id);
    if (!t) return HttpResponse.json({ error: { code: 'NOT_FOUND', message: '' } }, { status: 404 });
    return HttpResponse.json({ ...t, done: body.done });
  }),
  http.patch('/api/prep-items/:id', async ({ params, request }) => {
    const body = (await request.json()) as { done: boolean };
    const id = String(params.id);
    const p = mockPrep.find((x) => x.id === id);
    if (!p) return HttpResponse.json({ error: { code: 'NOT_FOUND', message: '' } }, { status: 404 });
    return HttpResponse.json({ ...p, done: body.done });
  }),
  http.patch('/api/milestones/:id', async ({ params, request }) => {
    const body = (await request.json()) as { done: boolean };
    const id = String(params.id);
    const m = mockMilestones.find((x) => x.id === id);
    if (!m) return HttpResponse.json({ error: { code: 'NOT_FOUND', message: '' } }, { status: 404 });
    return HttpResponse.json({ ...m, done: body.done });
  }),
];

export const server = setupServer(...handlers);
