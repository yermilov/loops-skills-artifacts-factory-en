import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { Window } from './Chrome';
import { PAPER, SHELL, MONO, SANS } from './theme';

/**
 * Every line below is verbatim from the author's own screenshot of a real run:
 * github.com/jla/gpt-shell, assets/examples/is-google-down.png. Nothing here
 * is reconstructed.
 */
const QUESTION = 'Is Google down?';
const STEPS = [
  {
    kind: 'gpt' as const,
    lines: [
      'Thought: I should run a shell command to check if Google is down by sending a ping request.',
      'Action: shell: ping -c 1 google.com',
    ],
  },
  {
    kind: 'shell' as const,
    lines: ['Observation: /bin/sh: 1: ping: not found', 'Return code: 127'],
  },
  {
    kind: 'gpt' as const,
    lines: [
      'Thought: The ping command is not available. I should try another method to check if Google is down.',
      'Action: shell: curl -Is https://www.google.com | head -n 1',
    ],
  },
  {
    kind: 'shell' as const,
    lines: ['Observation: HTTP/2 200', 'Return code: 0'],
  },
  {
    kind: 'answer' as const,
    lines: ['No, Google is not down.'],
  },
];

const Q_AT = 20;
const STEP_EVERY = 52;
const FIRST_STEP = Q_AT + 30;

function HackerNews({ frame }: { frame: number }) {
  const o = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{ opacity: o, justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: 1200, fontFamily: 'Verdana, Geneva, sans-serif' }}>
        <div style={{ background: '#ff6600', padding: '10px 16px', display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ border: '2px solid #fff', color: '#fff', fontWeight: 700, padding: '0 8px', fontSize: 36 }}>Y</div>
          <div style={{ color: '#000', fontWeight: 700, fontSize: 36 }}>Hacker News</div>
        </div>
        <div style={{ background: '#f6f6ef', padding: '32px 36px' }}>
          <div style={{ fontSize: 34, color: '#828282', marginBottom: 20 }}>
            ArenaSource on March 27, 2023 | parent | favorite | on: Retrieval in LangChain
          </div>
          <div style={{ fontSize: 56, lineHeight: 1.45, color: '#000' }}>
            If you put GPT-4 on a loop with access to the shell it manages to do whatever is
            needed to finish the job
          </div>
          <div style={{ fontSize: 39, color: '#1a0dab', marginTop: 24 }}>github.com/jla/gpt-shell</div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

function Box({
  kind,
  lines,
  progress,
}: {
  kind: 'gpt' | 'shell' | 'answer';
  lines: string[];
  progress: number;
}) {
  const colour = kind === 'shell' ? SHELL.shellBox : SHELL.gpt;
  const label = kind === 'shell' ? 'Shell' : kind === 'answer' ? 'GPT Response' : 'GPT';
  const shown = Math.ceil(lines.length * progress);
  return (
    <div
      style={{
        border: `2px solid ${colour}`,
        borderRadius: 8,
        padding: '14px 20px 16px',
        margin: '10px 0',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -16,
          left: 22,
          background: SHELL.bg,
          color: colour,
          padding: '0 10px',
          fontSize: 29,
        }}
      >
        {label}
      </div>
      {lines.slice(0, shown).map((l) => (
        <div key={l} style={{ fontSize: 32, lineHeight: 1.45, color: SHELL.text }}>
          {l}
        </div>
      ))}
    </div>
  );
}

function Session({ frame }: { frame: number }) {
  const o = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Window title="gpt-shell — docker" background={SHELL.bg}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            padding: '28px 36px',
            fontFamily: MONO,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          <div style={{ fontSize: 35, color: SHELL.prompt, fontWeight: 700 }}>
            GPT-Shell&gt; :{' '}
            <span style={{ color: SHELL.text, fontWeight: 400 }}>{frame >= Q_AT ? QUESTION : ''}</span>
          </div>
          {STEPS.map((s, i) => {
            const at = FIRST_STEP + i * STEP_EVERY;
            if (frame < at) return null;
            const progress = interpolate(frame, [at, at + 26], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return <Box key={s.lines[0]} kind={s.kind} lines={s.lines} progress={progress} />;
          })}
        </div>
      </Window>
    </AbsoluteFill>
  );
}

/** Beat 1: somebody says out loud what the loop can do. */
export const HackerNews2023 = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: PAPER, fontFamily: SANS }}>
      <HackerNews frame={frame} />
    </AbsoluteFill>
  );
};

/** Beat 2: the loop itself — ping is missing, so it finds another way. */
export const GptShellSession2023 = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: PAPER, fontFamily: SANS }}>
      <Session frame={frame} />
    </AbsoluteFill>
  );
};

export const HN_2023_FRAMES = 160;
export const GPT_SHELL_FRAMES = FIRST_STEP + STEPS.length * STEP_EVERY + 100;
