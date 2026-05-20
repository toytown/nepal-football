// infra/lib/seed-data.ts
// Initial data seeded into DynamoDB on first deploy. Ported verbatim from
// site/NepaliEuropapokal2026 Manager.html. Re-deploys do not re-seed (the
// seed Lambda is idempotent — it only writes when the table is empty).

export interface SeedTask {
  name: string;
  task: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  done: boolean;
  sortKey: number;
}

export interface SeedPrepItem {
  label: string;
  done: boolean;
  sortKey: number;
}

export interface SeedMilestone {
  icon: string;
  task: string;
  date: string;
  done: boolean;
  sortKey: number;
}

export interface SeedTeam {
  name: string;
  icon: string;
  color: string;
  /** Numeric upper-bound used for stat math */
  count: number;
  /** Original display label, e.g. "3-4" */
  countLabel: string;
  tasks: string[];
  sortKey: number;
}

export const seedTasks: SeedTask[] = [
  { name: 'All Volunteers',      task: 'Hanging Banners & Signs',     time: '07:00',      priority: 'high',   done: false, sortKey: 1 },
  { name: 'All Volunteers',      task: 'Pavilion & Stage Setup',      time: '07:00',      priority: 'high',   done: false, sortKey: 2 },
  { name: 'Registration Team',   task: 'Team Registration',           time: '08:00',      priority: 'high',   done: false, sortKey: 3 },
  { name: 'Volunteers/Coord.',   task: 'Water Distribution',          time: 'All Day',    priority: 'medium', done: false, sortKey: 4 },
  { name: 'Match Coordinators',  task: 'Match Coordination',          time: 'All Day',    priority: 'high',   done: false, sortKey: 5 },
  { name: 'Assigned Volunteers', task: 'Ball Boys / Field Support',   time: 'All Day',    priority: 'medium', done: false, sortKey: 6 },
  { name: 'All Volunteers',      task: 'Cleaning & Trash Management', time: 'All Day',    priority: 'medium', done: false, sortKey: 7 },
  { name: 'Assigned Volunteers', task: 'Toilet Cleaning/Check',       time: 'All Day',    priority: 'medium', done: false, sortKey: 8 },
  { name: 'Vendor Support Team', task: 'Food & Vendor Coordination',  time: 'All Day',    priority: 'medium', done: false, sortKey: 9 },
  { name: 'Media Team',          task: 'Social Media / Live Updates', time: 'All Day',    priority: 'medium', done: false, sortKey: 10 },
  { name: 'IT Volunteers',       task: 'IT & Livestream Support',     time: 'All Day',    priority: 'high',   done: false, sortKey: 11 },
  { name: 'Assigned Volunteers', task: 'Jury / Tournament Desk',      time: 'All Day',    priority: 'high',   done: false, sortKey: 12 },
  { name: 'Medical Team',        task: 'Medical Support Coordination',time: 'All Day',    priority: 'high',   done: false, sortKey: 13 },
  { name: 'Assigned Volunteers', task: 'Parking & Crowd Guidance',    time: 'Peak Hours', priority: 'medium', done: false, sortKey: 14 },
  { name: 'All Volunteers',      task: 'Prize Ceremony Setup',        time: 'Evening',    priority: 'high',   done: false, sortKey: 15 },
];

export const seedPrepItems: SeedPrepItem[] = [
  { label: 'Setting up pavilions, tables and decoration',     done: false, sortKey: 1 },
  { label: 'Hanging banners and sponsor boards',              done: false, sortKey: 2 },
  { label: 'Preparing registration area',                     done: false, sortKey: 3 },
  { label: 'Organizing water and supplies',                   done: false, sortKey: 4 },
  { label: 'Sound system and cable management',               done: false, sortKey: 5 },
  { label: 'IT setup and livestream testing',                 done: false, sortKey: 6 },
  { label: 'Jury desk preparation and tournament documents',  done: false, sortKey: 7 },
  { label: 'Preparing trophies, medals and stage area',       done: false, sortKey: 8 },
  { label: 'Final planning discussions and coordination',     done: false, sortKey: 9 },
];

export const seedMilestones: SeedMilestone[] = [
  { icon: '📧',  task: 'Send volunteer recruitment emails',        date: 'Now',    done: false, sortKey: 1 },
  { icon: '📋',  task: 'Confirm volunteer roster & assign roles',  date: 'Jun 15', done: false, sortKey: 2 },
  { icon: '📄',  task: 'Share task briefing documents',            date: 'Jun 20', done: false, sortKey: 3 },
  { icon: '⏰',  task: 'Volunteer registration deadline',          date: 'Jun 25', done: false, sortKey: 4 },
  { icon: '💬',  task: 'Volunteer WhatsApp/Signal group setup',    date: 'Jun 28', done: false, sortKey: 5 },
  { icon: '📞',  task: 'Final briefing call with all volunteers',  date: 'Jul 01', done: false, sortKey: 6 },
  { icon: '🏗️', task: 'Preparation Day – 14:00 at venue',          date: 'Jul 03', done: false, sortKey: 7 },
  { icon: '⚽',  task: 'Tournament Day 1 – 07:00 start',           date: 'Jul 04', done: false, sortKey: 8 },
  { icon: '🏆',  task: 'Tournament Day 2 + Prize Ceremony',        date: 'Jul 05', done: false, sortKey: 9 },
];

export const seedTeams: SeedTeam[] = [
  { name: 'Registration Team',  icon: '📋',  color: '#003893', count: 4, countLabel: '3–4', tasks: ['Team registration', 'Info distribution', 'Welcome teams'],         sortKey: 1 },
  { name: 'Match Coordinators', icon: '⚽',  color: '#DC143C', count: 5, countLabel: '4–5', tasks: ['Match scheduling', 'Referee support', 'Score updates'],            sortKey: 2 },
  { name: 'Media Team',         icon: '📸',  color: '#7c3aed', count: 3, countLabel: '2–3', tasks: ['Photos & videos', 'Instagram & TikTok', 'Live updates'],           sortKey: 3 },
  { name: 'IT Volunteers',      icon: '💻',  color: '#0891b2', count: 3, countLabel: '2–3', tasks: ['Livestream setup', 'Technical support', 'Internet & software'],   sortKey: 4 },
  { name: 'Medical Team',       icon: '🏥',  color: '#16a34a', count: 2, countLabel: '2',   tasks: ['Emergency coordination', 'First aid support'],                    sortKey: 5 },
  { name: 'Vendor Support',     icon: '🍽️', color: '#d97706', count: 3, countLabel: '2–3', tasks: ['Food stall support', 'Vendor coordination'],                       sortKey: 6 },
];
