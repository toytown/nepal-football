import type { PrepItem } from '@nepal-football/shared';

interface ChecklistItemProps {
  item: PrepItem;
  onToggle?: (item: PrepItem) => void;
}

export default function ChecklistItem({ item, onToggle }: ChecklistItemProps) {
  const readOnly = !onToggle;

  return (
    <button
      type="button"
      className={`prep-item${readOnly ? ' read-only' : ''}`}
      onClick={readOnly ? undefined : () => onToggle!(item)}
      disabled={readOnly}
      aria-pressed={readOnly ? undefined : item.done}
      style={readOnly ? { cursor: 'default', opacity: 1 } : undefined}
    >
      <div className={`task-check${item.done ? ' checked' : ''}`}>
        {item.done ? '✓' : null}
      </div>
      <span className={`prep-label${item.done ? ' done-text' : ''}`}>
        {item.label}
      </span>
    </button>
  );
}
