import type { Milestone } from '@nepal-football/shared';

interface MilestoneItemProps {
  milestone: Milestone;
  onToggle?: (m: Milestone) => void;
  /** Render the timeline dot indicator (used inside the vertical Timeline view). */
  withDot?: boolean;
}

export default function MilestoneItem({ milestone, onToggle, withDot = false }: MilestoneItemProps) {
  const readOnly = !onToggle;

  const content = (
    <div className={`tl-card${milestone.done ? ' done-card' : ''}`}>
      <div className="tl-icon" aria-hidden="true">{milestone.icon}</div>
      <div className={`tl-task${milestone.done ? ' done-text' : ''}`}>{milestone.task}</div>
      <div className="tl-date">{milestone.date}</div>
    </div>
  );

  const handleClick = () => {
    if (onToggle) onToggle(milestone);
  };

  if (withDot) {
    return (
      <div
        className={`tl-item${readOnly ? ' read-only' : ''}`}
        onClick={readOnly ? undefined : handleClick}
        onKeyDown={
          readOnly
            ? undefined
            : (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClick();
                }
              }
        }
        role={readOnly ? undefined : 'button'}
        tabIndex={readOnly ? undefined : 0}
        aria-pressed={readOnly ? undefined : milestone.done}
      >
        <div className={`tl-dot${milestone.done ? ' done' : ''}`}>
          {milestone.done && <span className="dot-check">✓</span>}
        </div>
        {content}
      </div>
    );
  }

  // Without a dot, render as a simple clickable card row (used on Overview).
  if (readOnly) {
    return <div className="tl-item read-only">{content}</div>;
  }
  return (
    <div className="tl-item" onClick={handleClick} role="button" tabIndex={0}
         onKeyDown={(e) => {
           if (e.key === 'Enter' || e.key === ' ') {
             e.preventDefault();
             handleClick();
           }
         }}
         aria-pressed={milestone.done}>
      {content}
    </div>
  );
}
