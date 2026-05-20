import type { Bootstrap, Task, Team, PrepItem, Milestone } from '@nepal-football/shared';

export const mockTasks: Task[] = [
  { id: 't1', name: 'All Volunteers', task: 'Hanging Banners',     time: '07:00',   priority: 'high',   done: false, sortKey: 1 },
  { id: 't2', name: 'All Volunteers', task: 'Pavilion Setup',      time: '07:00',   priority: 'high',   done: true,  sortKey: 2 },
  { id: 't3', name: 'Volunteers',     task: 'Water Distribution',  time: 'All Day', priority: 'medium', done: false, sortKey: 3 },
];

export const mockTeams: Team[] = [
  { id: 'team1', name: 'Registration', icon: '📋', color: '#003893', count: 4, countLabel: '3-4', tasks: ['Reg', 'Welcome'], sortKey: 1 },
];

export const mockPrep: PrepItem[] = [
  { id: 'p1', label: 'Setup pavilions', done: false, sortKey: 1 },
  { id: 'p2', label: 'Hang banners',    done: true,  sortKey: 2 },
];

export const mockMilestones: Milestone[] = [
  { id: 'm1', icon: '📧', task: 'Send recruitment emails', date: 'Now',    done: false, sortKey: 1 },
  { id: 'm2', icon: '📋', task: 'Confirm roster',           date: 'Jun 15', done: true,  sortKey: 2 },
];

export const mockBootstrap: Bootstrap = {
  tasks: mockTasks,
  teams: mockTeams,
  prepItems: mockPrep,
  milestones: mockMilestones,
};
