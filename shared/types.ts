// shared/types.ts
// Single source of truth for all entity shapes flowing between frontend, backend, and infra.

export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  /** Unique identifier (UUID v4), max 36 chars */
  id: string;
  /** Team / role label, max 100 chars */
  name: string;
  /** Task description, max 500 chars */
  task: string;
  /** ISO 8601 datetime OR free-form label like "All Day" / "Peak Hours" */
  time: string;
  priority: Priority;
  done: boolean;
  /** Stable display order; lower comes first */
  sortKey?: number;
}

export interface PrepItem {
  /** Unique identifier (UUID v4), max 36 chars */
  id: string;
  /** Display label, max 200 chars */
  label: string;
  done: boolean;
  sortKey?: number;
}

export interface Milestone {
  /** Unique identifier (UUID v4), max 36 chars */
  id: string;
  /** Emoji or short string, max 50 chars */
  icon: string;
  /** Task description, max 500 chars */
  task: string;
  /** ISO 8601 date OR display label like "Now" */
  date: string;
  done: boolean;
  sortKey?: number;
}

export interface Team {
  /** Unique identifier (UUID v4), max 36 chars */
  id: string;
  /** Team name, max 100 chars */
  name: string;
  /** Emoji or short string, max 50 chars */
  icon: string;
  /** CSS color value, max 30 chars */
  color: string;
  /** Volunteer count needed, 1..50 */
  count: number;
  /** Display range like "3-4" preserved from the source template (optional) */
  countLabel?: string;
  /** Task labels, max 20 entries */
  tasks: string[];
  sortKey?: number;
}

export interface Bootstrap {
  tasks: Task[];
  teams: Team[];
  prepItems: PrepItem[];
  milestones: Milestone[];
}

export interface ApiError {
  error: { code: string; message: string };
}
