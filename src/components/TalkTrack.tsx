/** The bottom chrome: one thin strip, the speaker's instrument.
 *
 *  The track is the whole talk — the left edge is 00:00 and the first slide,
 *  the right edge is 45:00 and the last reveal. Two things ride it:
 *
 *    - the magenta FILL is the material — how far the deck has got;
 *    - the purple TICK is the clock — where the deck should be by now.
 *
 *  Tick past the end of the fill → running late, and the clock turns red.
 *  Right of the clock sits the READY mark (▸): it lights up once everything
 *  the current frame plays — reveals, clips, typed sessions — is over, so the
 *  next click won't cut an animation short (see frameSettled.ts).
 *  Right of that sits the OFFLINE mark: «⇣ 42%» while the service worker is
 *  still downloading the deck, a dim ✓ once every file is cached and the talk
 *  no longer needs the network (see utils/offline.ts).
 *  The terminal is not here any more: Esc calls it over the slide (see
 *  Presentation.tsx), and the clock is the tap target for a phone with no Esc.
 */

import { useOfflineStatus } from '../utils/offline';

// WAWTech slot: 45 minutes, no Q&A (organiser email, 07.09.2026).
const TOTAL_TIME = 45 * 60;

/** How far behind schedule the talk may drift before the clock goes amber,
 *  then red. 4% of 45 minutes ≈ 1:48; 8% ≈ 3:36. */
const WARN_THRESHOLD = 0.04;
const LATE_THRESHOLD = 0.08;

interface TalkTrackProps {
  elapsedSeconds: number;
  /** Reveal-weighted deck progress (0..1) — where the MATERIAL has got to. */
  progress: number;
  /** The current frame has finished playing — the next click is safe. */
  ready: boolean;
  onOpenCommand: () => void;
}

function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function TalkTrack({ elapsedSeconds, progress, ready, onOpenCommand }: TalkTrackProps) {
  const offline = useOfflineStatus();
  const flown = Math.min(1, elapsedSeconds / TOTAL_TIME);
  const covered = Math.min(1, Math.max(0, progress));
  const remaining = Math.max(0, TOTAL_TIME - elapsedSeconds);

  // Positive = the clock is ahead of the deck, i.e. the talk is running slow.
  const behind = flown - covered;
  const pace =
    (remaining === 0 && covered < 1) || behind >= LATE_THRESHOLD
      ? 'late'
      : behind >= WARN_THRESHOLD
        ? 'warn'
        : 'ok';

  return (
    <div className={`talk-track talk-track--${pace}`}>
      <div className="talk-track__rail" aria-hidden="true">
        <div className="talk-track__fill" style={{ width: `${covered * 100}%` }} />
        {elapsedSeconds > 0 && (
          <div className="talk-track__tick" style={{ left: `${flown * 100}%` }} />
        )}
      </div>
      <button
        type="button"
        className="talk-track__clock"
        onClick={onOpenCommand}
        aria-label="Open the command line"
        title="esc"
      >
        {formatClock(remaining)}
      </button>
      {/* The ready mark: lights up once every animation of this frame is over. */}
      <span
        className={`talk-track__ready${ready ? ' talk-track__ready--on' : ''}`}
        role="status"
        aria-label={ready ? 'Ready for the next click' : 'Still playing'}
        title={ready ? 'ready' : 'playing…'}
      >
        ▸
      </span>
      {offline && offline.total > 0 && (
        offline.done >= offline.total ? (
          <span className="talk-track__offline talk-track__offline--ready" role="status"
            aria-label="Available offline" title="cached: works without internet">
            ✓
          </span>
        ) : (
          <span className="talk-track__offline" role="status"
            aria-label="Downloading the deck for offline use" title="caching the deck for offline use">
            ⇣ {Math.floor((offline.done / offline.total) * 100)}%
          </span>
        )
      )}
    </div>
  );
}
