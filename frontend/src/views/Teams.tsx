import { useTeams } from '../api/hooks';

export default function Teams() {
  const { data: teams, isLoading, isError } = useTeams();

  if (isLoading) return <div className="inline-loading">Loading teams…</div>;
  if (isError || !teams) return <div className="inline-error">Team information is unavailable.</div>;

  return (
    <div className="teams-grid">
      {teams.map((team) => (
        <div
          key={team.id}
          className="team-card"
          style={{ borderLeftColor: team.color }}
        >
          <div className="team-header">
            <div className="team-icon" aria-hidden="true">{team.icon}</div>
            <div>
              <div className="team-name">{team.name}</div>
              <div className="team-count">
                👤 {team.countLabel ?? team.count} volunteers needed
              </div>
            </div>
          </div>
          {team.tasks.slice(0, 5).map((task) => (
            <div
              key={task}
              className="team-task-item"
              style={{ borderLeftColor: `${team.color}60` }}
            >
              {task}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
