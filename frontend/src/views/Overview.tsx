import { useMemo } from 'react';
import { useBootstrap } from '../api/hooks';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import TaskItem from '../components/TaskItem';
import MilestoneItem from '../components/MilestoneItem';

const TIMELINE_GRADIENT = 'linear-gradient(90deg, #22c55e, #003893)';

export default function Overview() {
  const { data, isLoading, isError } = useBootstrap();

  const stats = useMemo(() => {
    if (!data) {
      return { taskTotal: 0, taskDone: 0, milestoneTotal: 0, milestoneDone: 0, teamTotal: 0 };
    }
    return {
      taskTotal: data.tasks.length,
      taskDone: data.tasks.filter((t) => t.done).length,
      milestoneTotal: data.milestones.length,
      milestoneDone: data.milestones.filter((m) => m.done).length,
      teamTotal: data.teams.length,
    };
  }, [data]);

  if (isLoading) return <div className="inline-loading">Loading dashboard…</div>;
  if (isError || !data) return <div className="inline-error">Could not load dashboard.</div>;

  const highPriority = data.tasks.filter((t) => t.priority === 'high');
  const nextSteps = [...data.milestones]
    .sort((a, b) => (a.sortKey ?? 0) - (b.sortKey ?? 0))
    .slice(0, 5);

  return (
    <>
      <div className="stats-row">
        <StatCard icon="📅" value={2} label="Tournament Days" />
        <StatCard icon="🙋" value={stats.taskTotal} label="Volunteer Roles" accent="red" />
        <StatCard icon="👥" value={stats.teamTotal} label="Specialist Teams" accent="gold" />
        <StatCard
          icon="✅"
          value={`${stats.taskDone}/${stats.taskTotal}`}
          label="Tasks Completed"
          accent="green"
        />
      </div>

      <div className="card">
        <div className="card-title">Overall Task Progress</div>
        <ProgressBar
          label="Volunteer Tasks"
          done={stats.taskDone}
          total={stats.taskTotal}
        />
        <ProgressBar
          label="Action Timeline"
          done={stats.milestoneDone}
          total={stats.milestoneTotal}
          gradient={TIMELINE_GRADIENT}
          showSub={false}
        />
        <div className="progress-sub">
          <span>{stats.milestoneDone} milestones done</span>
          <span>{stats.milestoneTotal - stats.milestoneDone} remaining</span>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-title">🚨 High Priority Tasks</div>
          {highPriority.map((t) => (
            <TaskItem key={t.id} task={t} compact />
          ))}
        </div>
        <div className="card">
          <div className="card-title">📅 Next Steps</div>
          {nextSteps.map((m) => (
            <MilestoneItem key={m.id} milestone={m} />
          ))}
        </div>
      </div>

      <div className="card" style={{ background: 'linear-gradient(135deg,#0d1a3a,#1a0a14)', borderColor: '#2a2a4a' }}>
        <div className="card-title">📋 Event Information</div>
        <div className="event-info-grid">
          <div>
            <div className="event-info-label">Venue</div>
            <div className="event-info-value">Sportanlage Grüngürtel</div>
            <div className="event-info-sub">Grüngürtelstraße 34, 13599 Berlin</div>
          </div>
          <div>
            <div className="event-info-label">Tournament Days</div>
            <div className="event-info-value">04–05 July 2026</div>
            <div className="event-info-sub">All volunteers: 07:00 AM start</div>
          </div>
          <div>
            <div className="event-info-label">Preparation Day</div>
            <div className="event-info-value">03 July 2026</div>
            <div className="event-info-sub">Setup from 14:00 at venue</div>
          </div>
        </div>
      </div>
    </>
  );
}
