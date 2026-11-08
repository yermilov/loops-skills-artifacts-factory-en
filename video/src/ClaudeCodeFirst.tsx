import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { Window } from './Chrome';
import { PAPER, SANS, typedFor } from './theme';
import {
  T,
  CWD,
  ASK_1,
  Scrollback,
  Prompt,
  Step,
  Welcome,
  PermissionBox,
  NO_OPTION,
} from './claudeTerminal';

/**
 * The first released Claude Code — you chatted to it in your terminal, and it
 * asked permission for every single thing, the same command twice included.
 *
 * MEASURED, not remembered: every string, glyph and colour is read off the
 * published package @anthropic-ai/claude-code@0.2.9 (24.02.2025, the first
 * release on npm) — the welcome box and its claude-coloured border, the
 * «Bash command» / «Edit file» titles in the permission colour, «Do you want
 * to proceed?», «Do you want to make this edit to <file>?», the three options
 * with no numbers (numbering came later) and the ❯ pointer, ⏺ and ⎿.
 * RECONSTRUCTION all the same: the session is invented, and so is the code it
 * edits. Said in the notes, not on the frame.
 *
 * The transcript lives in claudeTerminal.tsx because GithubMcp.tsx opens on
 * this clip's last frame — see FirstSession there.
 */

/* The banner gets a breath of its own before the transcript pushes it up. */
const B = {
  ask: 28,
  assist1: 0,
  box1: 0,
  done1: 0,
  out1: 0,
  assist2: 0,
  box2: 0,
  done2: 0,
  out2: 0,
  box3: 0,
  done3: 0,
  out3: 0,
};
B.assist1 = B.ask + typedFor(ASK_1) + 14;
B.box1 = B.assist1 + 16;
B.done1 = B.box1 + 54;
B.out1 = B.done1 + 10;
B.assist2 = B.out1 + 30;
B.box2 = B.assist2 + 16;
B.done2 = B.box2 + 58;
B.out2 = B.done2 + 10;
B.box3 = B.out2 + 28;
B.done3 = B.box3 + 50;
B.out3 = B.done3 + 10;

export const CLAUDE_CODE_FIRST_FRAMES = B.out3 + 80;

const BASH_OPTIONS = [
  'Yes',
  `Yes, and don't ask again for npm commands in ${CWD}`,
  NO_OPTION,
];
const EDIT_OPTIONS = [
  'Yes',
  "Yes, and don't ask again this session",
  NO_OPTION,
];

function Diff() {
  const rows: [string, string, string | null][] = [
    ['12', '  const net = items.reduce((s, i) => s + i.price * i.qty, 0);', null],
    ['13', '  return { net, vat: 0, gross: net };', T.removed],
    ['13', '  const vat = round(net * VAT);', T.added],
    ['14', '  return { net, vat, gross: net + vat };', T.added],
  ];
  return (
    <div>
      {rows.map(([n, text, bg], i) => (
        <div key={i} style={{ background: bg ?? 'transparent', color: bg ? T.text : T.dim }}>
          <span style={{ color: T.dim }}>{n.padStart(4, ' ')} </span>
          <span>{bg === T.removed ? '-' : bg === T.added ? '+' : ' '}</span>
          {text}
        </div>
      ))}
    </div>
  );
}

const BASH_BODY = (description: string) => (
  <>
    <div style={{ color: T.text }}>npm test</div>
    <div style={{ color: T.dim }}>{description}</div>
  </>
);

export const ClaudeCodeFirst = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: PAPER, fontFamily: SANS, opacity: o }}>
      <Window title="my-shop — claude" background={T.bg}>
        <Scrollback>
          <Welcome />
          {frame >= B.ask && <Prompt text={ASK_1} frame={frame} at={B.ask} />}

          {frame >= B.assist1 && <Step head="I'll start by running the test suite." />}
          {frame >= B.box1 && frame < B.done1 && (
            <PermissionBox
              frame={frame}
              at={B.box1}
              title="Bash command"
              body={BASH_BODY('Run the test suite')}
              question="Do you want to proceed?"
              options={BASH_OPTIONS}
            />
          )}
          {frame >= B.out1 && (
            <Step
              head={
                <>
                  Bash(<span style={{ color: T.dim }}>npm test</span>)
                </>
              }
              out={
                <>
                  1 failing — <span style={{ color: T.text }}>cart totals</span>: expected 120,
                  got 100
                </>
              }
            />
          )}

          {frame >= B.assist2 && <Step head="Found it — the VAT line never made it in." />}
          {frame >= B.box2 && frame < B.done2 && (
            <PermissionBox
              frame={frame}
              at={B.box2}
              title="Edit file"
              body={<Diff />}
              question={
                <>
                  Do you want to make this edit to <strong>cart.ts</strong>?
                </>
              }
              options={EDIT_OPTIONS}
            />
          )}
          {frame >= B.out2 && (
            <Step
              head={
                <>
                  Update(<span style={{ color: T.dim }}>cart.ts</span>)
                </>
              }
              out="Updated cart.ts with 2 additions and 1 removal"
            />
          )}

          {frame >= B.box3 && frame < B.done3 && (
            <PermissionBox
              frame={frame}
              at={B.box3}
              title="Bash command"
              body={BASH_BODY('Run the test suite again')}
              question="Do you want to proceed?"
              options={BASH_OPTIONS}
            />
          )}
          {frame >= B.out3 && (
            <Step
              head={
                <>
                  Bash(<span style={{ color: T.dim }}>npm test</span>)
                </>
              }
              out={<span style={{ color: T.success }}>12 passing</span>}
            />
          )}
        </Scrollback>
      </Window>
    </AbsoluteFill>
  );
};
