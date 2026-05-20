import type { Team } from '@nepal-football/shared';
import { queryByPK } from '../db/ddb.js';

interface TeamRecord extends Omit<Team, 'id'> {
  PK: 'TEAM';
  SK: string;
}

function toTeam(record: TeamRecord): Team {
  return {
    id: record.SK,
    name: record.name,
    icon: record.icon,
    color: record.color,
    count: record.count,
    countLabel: record.countLabel,
    tasks: record.tasks,
    sortKey: record.sortKey,
  };
}

export async function listTeams(): Promise<Team[]> {
  const records = await queryByPK<TeamRecord>('TEAM');
  return records.map(toTeam);
}
