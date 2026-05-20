interface ProgressBarProps {
  label: string;
  done: number;
  total: number;
  /** CSS gradient string used for the fill. Defaults to navy→red template gradient. */
  gradient?: string;
  showSub?: boolean;
}

/** Compute integer percentage; 0 when total is 0 to avoid NaN. */
export function computePct(done: number, total: number): number {
  if (total <= 0) return 0;
  const raw = Math.round((done / total) * 100);
  return Math.max(0, Math.min(100, raw));
}

export default function ProgressBar({
  label,
  done,
  total,
  gradient,
  showSub = true,
}: ProgressBarProps) {
  const pct = computePct(done, total);
  const remaining = Math.max(0, total - done);
  const fillStyle = gradient
    ? { width: `${pct}%`, background: gradient }
    : { width: `${pct}%` };

  return (
    <div className="progress-wrap">
      <div className="progress-header">
        <span className="progress-label">{label}</span>
        <span className="progress-pct">{pct}%</span>
      </div>
      <div className="progress-bar-bg">
        <div className="progress-bar-fill" style={fillStyle} />
      </div>
      {showSub && (
        <div className="progress-sub">
          <span>{done} completed</span>
          <span>{remaining} remaining</span>
        </div>
      )}
    </div>
  );
}
