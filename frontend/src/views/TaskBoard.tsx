import { useMemo } from 'react';
import type { Task } from '@nepal-football/shared';
import { useTasks, useToggleTask } from '../api/hooks';
import TaskItem from '../components/TaskItem';

const PRIORITY_ORDER: Record<Task['priority'], number> = { high: 0, medium: 1, low: 2 };

export default function TaskBoard() {
  const { data: tasks, isLoading, isError } = useTasks();
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
      <div className="card-title">All Volunteer Tasks — Click to Mark Complete</div>
      {sorted.map((t) => (
        <TaskItem
          key={t.id}
          task={t}
          onToggle={(task) => toggle.mutate({ id: task.id, done: !task.done })}
        />
      ))}
    </div>
  );
}
