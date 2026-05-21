import { useVolunteers } from '../api/hooks';
import type { VolunteerRegistration } from '@nepal-football/shared';

const DAY_COLS: { key: 'Friday' | 'Saturday' | 'Sunday'; label: string }[] = [
  { key: 'Friday',   label: 'Fri 3 Jul' },
  { key: 'Saturday', label: 'Sat 4 Jul' },
  { key: 'Sunday',   label: 'Sun 5 Jul' },
];

function DayCell({ available }: { available: boolean }) {
  return (
    <td className="vol-day-cell" aria-label={available ? 'Available' : 'Not available'}>
      <span className={`vol-day-badge${available ? ' vol-day-yes' : ' vol-day-no'}`}>
        {available ? '✓' : '–'}
      </span>
    </td>
  );
}

function VolunteerRow({ v }: { v: VolunteerRegistration }) {
  return (
    <tr className="vol-row">
      <td className="vol-cell vol-name">
        <span className="vol-avatar">{v.name.charAt(0).toUpperCase()}</span>
        <span>
          <div className="vol-name-text">{v.name}</div>
          {v.city && <div className="vol-city">{v.city}</div>}
        </span>
      </td>
      {DAY_COLS.map(({ key }) => (
        <DayCell key={key} available={v.days.includes(key)} />
      ))}
      <td className="vol-cell">
        {v.city ? (
          <span className="vol-role-badge">{v.city}</span>
        ) : (
          <span className="vol-muted">—</span>
        )}
      </td>
      <td className="vol-cell vol-muted vol-date">
        {new Date(v.submittedAt).toLocaleDateString('en-GB', {
          day: 'numeric', month: 'short',
        })}
      </td>
    </tr>
  );
}

export default function Volunteers() {
  const { data, isLoading, isError } = useVolunteers();

  const total     = data?.length ?? 0;
  const friCount  = data?.filter((v) => v.days.includes('Friday')).length   ?? 0;
  const satCount  = data?.filter((v) => v.days.includes('Saturday')).length ?? 0;
  const sunCount  = data?.filter((v) => v.days.includes('Sunday')).length   ?? 0;

  return (
    <div>
      {/* Header */}
      <div className="prep-banner" style={{ marginBottom: 24 }}>
        <div className="prep-banner-icon">🤝</div>
        <div>
          <div className="prep-banner-title">Registered Volunteers</div>
          <div className="prep-banner-sub">
            Nepali Europapokal 2026 · Sportanlage Grüngürtel, Berlin · 3–5 July 2026
          </div>
        </div>
      </div>

      {/* Summary stats */}
      {!isLoading && !isError && total > 0 && (
        <div className="stats-row" style={{ marginBottom: 20 }}>
          {[
            { icon: '🤝', value: total,    label: 'Total Volunteers' },
            { icon: '📅', value: friCount, label: 'Available Friday'   },
            { icon: '⚽', value: satCount, label: 'Available Saturday' },
            { icon: '🏆', value: sunCount, label: 'Available Sunday'   },
          ].map(({ icon, value, label }) => (
            <div key={label} className="stat-card gold">
              <div className="stat-icon">{icon}</div>
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="card-title">👥 Volunteer List</div>

        {isLoading && (
          <div className="inline-loading">Loading volunteers…</div>
        )}

        {isError && (
          <div className="inline-error">
            ⚠️ Volunteer information is unavailable. Please try again later.
          </div>
        )}

        {!isLoading && !isError && total === 0 && (
          <div className="inline-loading">
            No volunteers registered yet.{' '}
            <a href="#/register" style={{ color: 'var(--gold)' }}>
              Be the first to sign up →
            </a>
          </div>
        )}

        {!isLoading && !isError && total > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table className="vol-table" aria-label="Registered volunteers">
              <thead>
                <tr>
                  <th className="vol-th">Name</th>
                  {DAY_COLS.map(({ key, label }) => (
                    <th key={key} className="vol-th vol-th-day">{label}</th>
                  ))}
                  <th className="vol-th">City</th>
                  <th className="vol-th">Registered</th>
                </tr>
              </thead>
              <tbody>
                {data!.map((v) => <VolunteerRow key={v.id} v={v} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <a href="#/register" className="reg-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
          🤝 Register as a Volunteer
        </a>
      </div>
    </div>
  );
}
