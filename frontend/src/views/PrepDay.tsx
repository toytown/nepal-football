import { usePrepItems, useTogglePrepItem } from '../api/hooks';
import ProgressBar from '../components/ProgressBar';
import ChecklistItem from '../components/ChecklistItem';

const PREP_GRADIENT = 'linear-gradient(90deg,#22c55e,#003893)';

export default function PrepDay() {
  const { data: items, isLoading, isError } = usePrepItems();
  const toggle = useTogglePrepItem();

  if (isLoading) return <div className="inline-loading">Loading checklist…</div>;
  if (isError || !items) return <div className="inline-error">Could not load checklist.</div>;

  const done = items.filter((i) => i.done).length;

  return (
    <>
      <div className="prep-banner">
        <div className="prep-banner-icon" aria-hidden="true">🏗️</div>
        <div>
          <div className="prep-banner-title">Preparation Day — Friday, 03 July 2026</div>
          <div className="prep-banner-sub">
            📍 Sportanlage Grüngürtel &nbsp;·&nbsp; ⏰ From 14:00
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Setup Checklist — Click to Complete</div>
        <ProgressBar
          label="Preparation Progress"
          done={done}
          total={items.length}
          gradient={PREP_GRADIENT}
          showSub={false}
        />
        {items.map((item) => (
          <ChecklistItem
            key={item.id}
            item={item}
            onToggle={(it) => toggle.mutate({ id: it.id, done: !it.done })}
          />
        ))}
      </div>
    </>
  );
}
