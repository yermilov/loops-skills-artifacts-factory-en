import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { Window, RecreationMark } from './Chrome';
import { PAPER, MONO, SANS } from './theme';

/**
 * September 2024, Boris Cherny's first Claude prototype. ON RECORD (his
 * Pragmatic Engineer interview): the question, that it answered through
 * AppleScript, that it could also change the track, and that it could NOT read
 * files or run bash. The AppleScript itself and the track are RECONSTRUCTED —
 * no transcript of that session is public.
 */
const QUESTION = 'What music am I listening to?';
const SCRIPT = [
  'tell application "Music"',
  '  get name of current track & " — " & artist of current track',
  'end tell',
];
const ANSWER = 'You\'re listening to "Mezzanine" by Massive Attack.';

const Q_AT = 30;
const SCRIPT_AT = Q_AT + 40;
const ANSWER_AT = SCRIPT_AT + 80;

const TERMINAL_BG = '#101014';

export const Prototype2024 = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const scriptShown = Math.ceil(
    SCRIPT.length * interpolate(frame, [SCRIPT_AT, SCRIPT_AT + 40], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  return (
    <AbsoluteFill style={{ background: PAPER, fontFamily: SANS, opacity: o }}>
      <Window title="claude — prototype" background={TERMINAL_BG}>
        <div style={{ padding: '32px 40px', fontFamily: MONO, color: '#e9e9ee' }}>
          <div style={{ fontSize: 34, color: '#6f6f7d', marginBottom: 26 }}>
            September 2024 · Claude 3.6 · no file access, no bash — only AppleScript
          </div>
          <div style={{ fontSize: 42, lineHeight: 1.5 }}>
            <span style={{ color: '#d77757' }}>❯ </span>
            {frame >= Q_AT ? QUESTION : ''}
          </div>
          {frame >= SCRIPT_AT && (
            <div style={{ marginTop: 28 }}>
              <div style={{ fontSize: 34, color: '#6f6f7d', marginBottom: 10 }}>osascript</div>
              <div
                style={{
                  borderLeft: '3px solid #d77757',
                  paddingLeft: 20,
                  fontSize: 39,
                  lineHeight: 1.5,
                  color: '#c9c9d4',
                }}
              >
                {SCRIPT.slice(0, scriptShown).map((l) => (
                  <div key={l}>{l}</div>
                ))}
              </div>
            </div>
          )}
          {frame >= ANSWER_AT && (
            <div style={{ marginTop: 30, fontSize: 42, lineHeight: 1.5 }}>
              <span style={{ color: '#ffffff' }}>⏺ </span>
              {ANSWER}
            </div>
          )}
        </div>
      </Window>
      <RecreationMark>reconstruction — the session was never recorded</RecreationMark>
    </AbsoluteFill>
  );
};

export const PROTOTYPE_FRAMES = ANSWER_AT + 130;
