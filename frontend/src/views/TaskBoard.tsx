import { useMemo } from 'react';
import type { Task } from '@nepal-football/shared';
import { useTasks, useToggleTask } from '../api/hooks';
import { useAdminAuth } from '../hooks/AdminAuthContext';
import TaskItem from '../components/TaskItem';
import AdminGate from '../components/AdminGate';

const PRIORITY_ORDER: Record<Task['priority'], number> = { high: 0, medium: 1, low: 2 };

export default function TaskBoard() {
  const { data: tasks, isLoading, isError } = useTasks();
  const { isAdmin } = useAdminAuth();
  const toggle = useToggleTask();

  const sorted = useMemo(() => {
    if (!tasks) return [];
    return [...tasks].sort((a, b) => {
      const p = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (p !== 0) return p;
      return (a.sortKey ?? 0) - (b.sortKey ?? 0);
    });
  }, [tasks]);

  if (isLoading) return <div className="inline-loading">Loading tasks…</div>;
  if (isError || !tasks) return <div className="inline-error">Could not load tasks.</div>;

  return (
    <div className="card">
      <div className="card-title">
        All Volunteer Tasks
        {isAdmin ? ' — Click to Mark Complete' : ' — View Only'}
      </div>
      <AdminGate />
      {sorted.map((t) => (
        <TaskItem
          key={t.id}
          task={t}
          onToggle={isAdmin
            ? (task) => toggle.mutate({ id: task.id, done: !task.done })
            : undefined
          }
        />
      ))}
    </div>
  );
}
