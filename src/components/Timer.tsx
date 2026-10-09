// WAWTech slot: 45 minutes, no Q&A (organiser email, 07.09.2026).
const TOTAL_TIME = 45 * 60;

interface TimerProps {
  elapsedSeconds: number;
  /** Reveal-weighted deck progress (0..1) — the same value that fills the
   *  progress bar, so the pace color and the bar stay in sync. */
  progress: number;
}

function getPaceColor(elapsedSeconds: number, progress: number): string {
  const remaining = Math.max(0, TOTAL_TIME - elapsedSeconds);
  // Out of time but not done → red.
  if (remaining === 0 && progress < 1) return 'var(--terminal-red)';

  // How far behind schedule: expected progress (by the clock) minus actual
  // reveal-weighted progress. Positive means the talk is running slow.
  const behind = elapsedSeconds / TOTAL_TIME - progress;
  if (behind < 0.04) return 'var(--terminal-green)';
  if (behind < 0.08) return 'var(--terminal-yellow)';
  return 'var(--terminal-red)';
}

export function Timer({ elapsedSeconds, progress }: TimerProps) {
  const remaining = Math.max(0, TOTAL_TIME - elapsedSeconds);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const color = getPaceColor(elapsedSeconds, progress);

  return (
    <span className="timer-countdown" style={{ color }}>
      {display}
    </span>
  );
}
