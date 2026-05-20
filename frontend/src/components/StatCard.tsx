interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
  accent?: 'navy' | 'red' | 'gold' | 'green';
}

export default function StatCard({ icon, value, label, accent }: StatCardProps) {
  const accentClass =
    accent === 'red' ? ' red' :
    accent === 'gold' ? ' gold' :
    accent === 'green' ? ' green' : '';
  return (
    <div className={`stat-card${accentClass}`}>
      <div className="stat-icon" aria-hidden="true">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
