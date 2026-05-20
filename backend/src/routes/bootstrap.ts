import type { Bootstrap } from '@nepal-football/shared';
import { listTasks } from './tasks.js';
import { listTeams } from './teams.js';
import { listPrep } from './prep.js';
import { listMilestones } from './milestones.js';

export async function getBootstrap(): Promise<Bootstrap> {
  const [tasks, teams, prepItems, milestones] = await Promise.all([
    listTasks(),
    listTeams(),
    listPrep(),
    listMilestones(),
  ]);
  return { tasks, teams, prepItems, milestones };
}
