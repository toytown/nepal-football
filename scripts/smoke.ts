/**
 * Smoke test against the deployed API.
 *
 * Usage:
 *   API_URL=https://abc123.execute-api.eu-central-1.amazonaws.com npx tsx scripts/smoke.ts
 *
 * It hits GET /bootstrap, asserts the response shape contains all four
 * collections, then PATCHes the first task and re-fetches it to verify
 * the `done` value persisted.
 */

interface Bootstrap {
  tasks: Array<{ id: string; done: boolean }>;
  teams: Array<{ id: string }>;
  prepItems: Array<{ id: string; done: boolean }>;
  milestones: Array<{ id: string; done: boolean }>;
}

const apiUrl = process.env.API_URL;
if (!apiUrl) {
  console.error('API_URL env var is required (e.g. the CDK output ApiUrl)');
  process.exit(2);
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${apiUrl}${path}`);
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return (await res.json()) as T;
}

async function patchJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${apiUrl}${path}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH ${path} → ${res.status}`);
  return (await res.json()) as T;
}

async function main() {
  console.log(`→ smoke testing ${apiUrl}`);

  console.log('  GET /bootstrap');
  const boot = await getJson<Bootstrap>('/bootstrap');
  if (!boot.tasks.length) throw new Error('tasks empty');
  if (!boot.teams.length) throw new Error('teams empty');
  if (!boot.prepItems.length) throw new Error('prepItems empty');
  if (!boot.milestones.length) throw new Error('milestones empty');
  console.log(`    ✓ tasks=${boot.tasks.length} teams=${boot.teams.length} prep=${boot.prepItems.length} milestones=${boot.milestones.length}`);

  const task = boot.tasks[0]!;
  const target = !task.done;
  console.log(`  PATCH /tasks/${task.id} { done: ${target} }`);
  const updated = await patchJson<{ id: string; done: boolean }>(`/tasks/${task.id}`, { done: target });
  if (updated.done !== target) throw new Error('done did not persist on PATCH response');
  console.log('    ✓ PATCH response reflects new value');

  console.log('  GET /bootstrap (verify persisted)');
  const after = await getJson<Bootstrap>('/bootstrap');
  const refetched = after.tasks.find((t) => t.id === task.id);
  if (!refetched) throw new Error('task disappeared');
  if (refetched.done !== target) throw new Error('done not persisted in DB');
  console.log('    ✓ persisted in DynamoDB');

  // Restore
  await patchJson(`/tasks/${task.id}`, { done: task.done });
  console.log('  ✓ restored original state');
  console.log('SMOKE OK');
}

main().catch((err) => {
  console.error('SMOKE FAILED:', err);
  process.exit(1);
});
