import type { PrepItem } from '@nepal-football/shared';

interface ChecklistItemProps {
  item: PrepItem;
  onToggle: (item: PrepItem) => void;
}

export default function ChecklistItem({ item, onToggle }: ChecklistItemProps) {
  return (
    <button
      type="button"
      className="prep-item"
      onClick={() => onToggle(item)}
      aria-pressed={item.done}
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
