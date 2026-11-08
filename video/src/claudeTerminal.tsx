import { ReactNode } from 'react';
import { interpolate } from 'remotion';
import { MONO, typed } from './theme';

/**
 * The my-shop terminal session, shared by the two Claude Code clips so the
 * second can OPEN on the exact frame the first closes on: same shell, same
 * type scale, same transcript built from the same components. Anything that
 * differs between them would show as a jump at the reveal.
 *
 * Colours and strings are claude-code's own dark theme, read off the published
 * packages (0.2.9 for the first release, 1.0.0 for the MCP era).
 */

export const T = {
  bg: '#101014',
  text: '#ffffff',
  dim: '#999999',
  claude: '#D97757',
  permission: '#b1b9f9',
  success: '#4eba65',
  added: '#225c2b',
  removed: '#7a2936',
};

export const CODE = 30;
export const CWD = '/Users/yarik/src/my-shop';

/** The scrollback: newest at the bottom, history leaving at the top. */
export function Scrollback({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        padding: '26px 40px',
        fontFamily: MONO,
        fontSize: CODE,
        lineHeight: 1.45,
        color: T.text,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
}

export function Prompt({ text, frame, at }: { text: string; frame: number; at: number }) {
  return (
    <div style={{ marginTop: 14 }}>
      <span style={{ color: T.dim }}>&gt; </span>
      {typed(text, frame, at)}
    </div>
  );
}

/** «⏺ …» — what Claude says, and «⎿ …» under it, what came back. */
export function Step({ head, out }: { head: ReactNode; out?: ReactNode }) {
  return (
    <div style={{ margin: '14px 0' }}>
      <div style={{ color: T.text }}>
        <span style={{ color: T.claude }}>⏺ </span>
        {head}
      </div>
      {out && (
        <div style={{ color: T.dim, marginTop: 4, paddingLeft: 34 }}>
          <span>⎿ </span>
          {out}
        </div>
      )}
    </div>
  );
}

/**
 * The banner, in its two eras: 0.2.9 says «research preview!» over «/help for
 * help», 1.0.0 drops the preview and offers /status as well.
 */
export function Welcome({ ga = false, cwd = CWD }: { ga?: boolean; cwd?: string }) {
  return (
    <div
      style={{
        alignSelf: 'flex-start',
        border: `2px solid ${T.claude}`,
        borderRadius: 10,
        padding: '12px 20px',
        marginBottom: 18,
      }}
    >
      <div>
        <span style={{ color: T.claude }}>✻</span> Welcome to <strong>Claude Code</strong>
        {ga ? '!' : ' research preview!'}
      </div>
      <div style={{ color: T.dim, fontStyle: 'italic', marginTop: 14 }}>
        {ga ? '/help for help, /status for your current setup' : '/help for help'}
      </div>
      <div style={{ color: T.dim, marginTop: 6 }}>cwd: {cwd}</div>
    </div>
  );
}

/** A permission box: rounded, titled, and always the same three answers. */
export function PermissionBox({
  title,
  body,
  question,
  options,
  chosen = 0,
  frame,
  at,
}: {
  title: string;
  body: ReactNode;
  question: ReactNode;
  options: string[];
  chosen?: number;
  frame: number;
  at: number;
}) {
  const o = interpolate(frame, [at, at + 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        opacity: o,
        margin: '16px 0',
        border: `2px solid ${T.permission}`,
        borderRadius: 10,
        padding: '14px 20px 16px',
      }}
    >
      <div style={{ color: T.permission, fontWeight: 700 }}>{title}</div>
      <div style={{ margin: '14px 0 14px 18px' }}>{body}</div>
      <div style={{ color: T.text, marginBottom: 8 }}>{question}</div>
      {options.map((label, i) => (
        <div key={label} style={{ color: i === chosen ? T.text : T.dim, display: 'flex' }}>
          <span style={{ color: i === chosen ? T.permission : 'transparent', flexShrink: 0 }}>
            ❯&nbsp;
          </span>
          {/* A long answer wraps, exactly as it does in a real terminal. */}
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

export const NO_OPTION = 'No, and tell Claude what to do differently (esc)';

/* ── beat one: the first released Claude Code, asking for everything ──── */

export const ASK_1 = 'run the tests and fix what is broken';

/** The whole first session, settled — what the second clip opens on. */
export function FirstSession({ frame }: { frame: number }) {
  return (
    <>
      <Welcome />
      <Prompt text={ASK_1} frame={frame} at={-999} />
      <Step head="I'll start by running the test suite." />
      <Step
        head={
          <>
            Bash(<span style={{ color: T.dim }}>npm test</span>)
          </>
        }
        out={
          <>
            1 failing — <span style={{ color: T.text }}>cart totals</span>: expected 120, got 100
          </>
        }
      />
      <Step head="Found it — the VAT line never made it in." />
      <Step
        head={
          <>
            Update(<span style={{ color: T.dim }}>cart.ts</span>)
          </>
        }
        out="Updated cart.ts with 2 additions and 1 removal"
      />
      <Step
        head={
          <>
            Bash(<span style={{ color: T.dim }}>npm test</span>)
          </>
        }
        out={<span style={{ color: T.success }}>12 passing</span>}
      />
    </>
  );
}
