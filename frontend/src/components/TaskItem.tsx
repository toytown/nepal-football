import type { Task } from '@nepal-football/shared';

interface TaskItemProps {
  task: Task;
  onToggle?: (task: Task) => void;
  /** Compact mode shows just name + time, used for high-priority list on Overview. */
  compact?: boolean;
}

export default function TaskItem({ task, onToggle, compact = false }: TaskItemProps) {
  if (compact) {
    return (
      <div className="hp-item">
        <span className={`hp-name${task.done ? ' done-text' : ''}`}>{task.task}</span>
        <span className="hp-time">{task.time}</span>
      </div>
    );
  }

  const readOnly = !onToggle;
  const checkClass = task.done
    ? 'task-check checked'
    : `task-check${task.priority === 'high' ? ' high' : task.priority === 'medium' ? ' medium' : ''}`;

  const handleClick = () => {
    if (onToggle) onToggle(task);
  };

  return (
    <button
      type="button"
      className={`task-item${task.done ? ' done' : ''}${readOnly ? ' read-only' : ''}`}
      onClick={handleClick}
      disabled={readOnly}
      aria-pressed={task.done}
    >
      <div className={checkClass}>{task.done ? '✓' : null}</div>
      <div className="task-info">
        <div className={`task-name${task.done ? ' done-text' : ''}`}>{task.task}</div>
        <div className="task-team">{task.name}</div>
      </div>
      <div className="task-meta">
        <div className="task-time">{task.time}</div>
        <div className={`badge ${task.priority}`}>{task.priority.toUpperCase()}</div>
      </div>
    </button>
  );
}
