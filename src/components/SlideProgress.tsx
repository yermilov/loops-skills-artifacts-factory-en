import { SlideProgressProps } from '../types/slides';

export function SlideProgress({ current, total, isFirst, hidden }: SlideProgressProps & { isFirst?: boolean; hidden?: boolean }) {
  const percentage = Math.round((current / total) * 100);
  const remaining = 100 - percentage;

  return (
    <div className="slide-progress" aria-hidden={hidden} style={hidden ? { visibility: 'hidden' } : undefined}>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${percentage}%` }} />
      </div>
      <span className={isFirst ? 'progress-text--glow' : 'progress-text'}>
        context left until auto-compact {remaining}%
      </span>
    </div>
  );
}
