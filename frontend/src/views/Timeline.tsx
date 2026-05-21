import { useMilestones, useToggleMilestone } from '../api/hooks';
import { useAdminAuth } from '../hooks/AdminAuthContext';
import ProgressBar from '../components/ProgressBar';
import MilestoneItem from '../components/MilestoneItem';
import AdminGate from '../components/AdminGate';

const TIMELINE_GRADIENT = 'linear-gradient(90deg,#22c55e,#003893)';

export default function Timeline() {
  const { data: milestones, isLoading, isError } = useMilestones();
  const { isAdmin } = useAdminAuth();
  const toggle = useToggleMilestone();

  if (isLoading) return <div className="inline-loading">Loading timeline…</div>;
  if (isError || !milestones) return <div className="inline-error">Could not load timeline.</div>;

  const done = milestones.filter((m) => m.done).length;

  return (
    <div className="card">
      <div className="card-title">
        Manager Action Timeline
        {isAdmin ? ' — Click to Mark Done' : ' — View Only'}
      </div>
      <AdminGate />
      <ProgressBar
        label="Milestones Completed"
        done={done}
        total={milestones.length}
        gradient={TIMELINE_GRADIENT}
      />
      <div className="timeline">
        {milestones.map((m) => (
          <MilestoneItem
            key={m.id}
            milestone={m}
            withDot
            onToggle={isAdmin
              ? (milestone) => toggle.mutate({ id: milestone.id, done: !milestone.done })
              : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
