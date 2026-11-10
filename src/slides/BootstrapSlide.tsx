import { useEffect, useState } from 'react';
import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';

/**
 * Where it starts: one session, and a queue that did not exist an hour ago.
 * Five beats, one per click, and the newest one PLAYS — you type, it answers,
 * the tool runs, the result lands. The beats are the real sequence out of
 * juggernaut's own history; the dates live in the notes, not on the frame.
 *
 * The window is a session already under way, so there is no welcome banner:
 * in a real one it scrolled off the top long ago. Everything else is read off
 * the installed CLI (2.1.321) rather than memory — the «claude» accent, the
 * ⏺ bullet (⏺ on macOS), the ⎿ result line, the prompt box and its
 * «? for shortcuts» hint.
 */

/** PDF capture must photograph the finished beat, not a half-typed one. */
const EXPORT_MODE =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('export') === '1';

const TICK_MS = 50;
/** A person at a keyboard, the model streaming, and a tool actually running. */
const TYPE_MS = 26;
const WORD_MS = 70;
const RUN_MS = 800;
const GAP_MS = 280;

type Line =
  | { kind: 'you'; text: string }
  | { kind: 'say'; text: string }
  | { kind: 'tool'; text: string; result: string };

/** Each beat appends to the session. */
const STEPS: Line[][] = [
  [
    {
      kind: 'you',
      text: 'a task system: tasks assigned to agents that poll and pick them up, every session attached back to its task',
    },
    { kind: 'tool', text: 'Write(CLAUDE.md)', result: 'the vision, before a line of code' },
  ],
  [
    { kind: 'you', text: 'now build it' },
    {
      kind: 'tool',
      text: 'Write(apps/api · packages/db-schema · apps/web)',
      result: '75 files, 9,130 lines',
    },
    { kind: 'tool', text: 'Bash(deploy)', result: 'live' },
  ],
  [
    { kind: 'you', text: 'it does not build on the server' },
    { kind: 'tool', text: 'Bash(railway up)', result: 'four fixes, twenty minutes — it is never that clean' },
  ],
  [
    { kind: 'you', text: 'now give any agent a way to ask for work' },
    {
      kind: 'tool',
      text: 'Write(routes/mcp.ts)',
      result: 'whats_next · create_task · start_session · finish_session · upload_session_log',
    },
    { kind: 'tool', text: 'whats_next()', result: '«Put the queue on a web page» — taken, done, closed' },
  ],
  [
    { kind: 'you', text: 'create a task to send me a summary every morning' },
    { kind: 'say', text: 'Created. Anything else for the queue?' },
    { kind: 'you', text: 'create a task to add priorities to the queue itself' },
  ],
  [
    { kind: 'you', text: '/loop take the next task from the queue, do it, report back' },
    { kind: 'tool', text: 'whats_next()', result: '«Send me a summary every morning» — taken' },
    { kind: 'tool', text: 'finish_session()', result: 'reported back · asking for the next one' },
    { kind: 'tool', text: 'whats_next()', result: '«Add priorities to the queue itself» — taken' },
  ],
];

/** The scene's only clock, restarted whenever the beat changes. */
function useClock(resetKey: number): number {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (EXPORT_MODE) {
      setT(Number.MAX_SAFE_INTEGER);
      return;
    }
    setT(0);
    const id = setInterval(() => setT((v) => v + TICK_MS), TICK_MS);
    return () => clearInterval(id);
  }, [resetKey]);
  return t;
}

/** How long a line takes to arrive. */
function span(line: Line): number {
  if (line.kind === 'you') return line.text.length * TYPE_MS;
  if (line.kind === 'say') return line.text.split(' ').length * WORD_MS;
  return RUN_MS;
}

type Played = { line: Line; shown: string; started: boolean; done: boolean; typing: boolean };

/** The live beat, played out: how much of each of its lines is on screen. */
function played(lines: Line[], t: number): Played[] {
  let at = 0;
  return lines.map((line) => {
    const start = at;
    const end = start + span(line);
    at = end + GAP_MS;
    const started = t >= start;
    const done = t >= end;
    if (line.kind === 'tool') {
      return { line, shown: line.text, started, done, typing: false };
    }
    const units = line.kind === 'you' ? line.text.length : line.text.split(' ').length;
    const per = line.kind === 'you' ? TYPE_MS : WORD_MS;
    const n = Math.max(0, Math.min(units, Math.round((t - start) / per)));
    const shown =
      line.kind === 'you' ? line.text.slice(0, n) : line.text.split(' ').slice(0, n).join(' ');
    return { line, shown, started, done, typing: started && !done };
  });
}

function Row({
  line,
  shown,
  done,
  typing = false,
}: {
  line: Line;
  shown: string;
  done: boolean;
  typing?: boolean;
}) {
  if (line.kind === 'you') {
    return (
      <div className="ww-boot__you">
        <span className="ww-boot__caret">&gt;</span> {shown}
        {typing && <span className="ww-boot__cursor ww-boot__cursor--inline" />}
      </div>
    );
  }
  if (line.kind === 'say') {
    return (
      <div className="ww-boot__say">
        <span className="ww-boot__bullet">⏺</span> {shown}
        {typing && <span className="ww-boot__cursor ww-boot__cursor--inline" />}
      </div>
    );
  }
  return (
    <div className="ww-boot__tool">
      <div>
        <span className={`ww-boot__bullet${done ? ' ww-boot__bullet--done' : ' ww-boot__bullet--busy'}`}>
          ⏺
        </span>{' '}
        {line.text}
      </div>
      <div className="ww-boot__result">
        <span aria-hidden="true">⎿</span>
        <span>{done ? line.result : 'running…'}</span>
      </div>
    </div>
  );
}

/** `from` is where this slide's beats start in the session; everything
 *  before it is already in the scrollback, so the split reads as one
 *  continuous session with an explainer wedged into the middle of it. */
function Session({ stage, from }: { stage: number; from: number }) {
  const t = useClock(stage);
  const earlier = STEPS.slice(0, from + stage - 1).flat();
  const live = played(STEPS[from + stage - 1] ?? [], t);

  return (
    <div className="ww-boot__term">
      <div className="ww-boot__chrome">
        <span className="ww-dot ww-dot--red" />
        <span className="ww-dot ww-dot--amber" />
        <span className="ww-dot ww-dot--green" />
        <span className="ww-boot__title">~/src/juggernaut — claude</span>
      </div>

      <div className="ww-boot__body">
        {/* The banner the CLI really prints, in the form the deck's own
            Remotion clips use (video/src/claudeTerminal.tsx, read off the
            published package). It scrolls off the top as the session grows,
            exactly as it does in a real one. */}
        <div className="ww-boot__welcome">
          <div>
            <span className="ww-boot__star">✻</span> Welcome to <strong>Claude Code</strong>!
          </div>
          <div className="ww-boot__welcome-help">/help for help, /status for your current setup</div>
          <div className="ww-boot__welcome-cwd">cwd: /Users/yarik/src/juggernaut</div>
        </div>
        {earlier.map((line, i) => (
          <Row key={`p${i}`} line={line} shown={line.text} done />
        ))}
        {live.map(
          (row, i) =>
            row.started && (
              <Row key={`l${i}`} line={row.line} shown={row.shown} done={row.done} typing={row.typing} />
            )
        )}
      </div>

      <div className="ww-boot__prompt">
        <div className="ww-boot__input">
          <span className="ww-boot__caret">&gt;</span>
          <span className="ww-boot__cursor" />
        </div>
        <div className="ww-boot__hint">? for shortcuts</div>
      </div>
    </div>
  );
}

/** The session is one slide per act: the vision, then — after the CLAUDE.md
 *  explainer — everything that act makes possible. */
function sessionSlide(id: string, from: number, count: number): SlideDefinition {
  return {
    id,
    title: (
      <>
        Where it starts <span className="ww-llm__titlesub">— a queue that writes itself</span>
      </>
    ),
    maxRevealStages: count,
    initialRevealStage: 1,
    content: ({ revealStage }) => (
      <>
        <CornerRings corner="top-right" />
        <div className="ww-boot">
          <Session stage={revealStage} from={from} />
        </div>
      </>
    ),
    notes: '',
  };
}

export const BootstrapSlide: SlideDefinition = {
  ...sessionSlide('bootstrap', 0, 1),
  notes:
    'The first commit was not code. 6 June 2026, 19:04: a CLAUDE.md with the vision — and the '
    + 'vision already says the thing the rest of the talk is about: tasks assigned to agents that '
    + 'POLL and pick them up, and every session attached back to its task. '
    + 'Before the session carries on, say what that file IS — the next slide.',
};

export const BootstrapRestSlide: SlideDefinition = {
  ...sessionSlide('bootstrap-rest', 1, STEPS.length - 1),
  notes:
    'Back in the same session, and now it moves. '
    + 'Beat 1 — two hours and eleven minutes after the vision, 21:15, the whole queue exists in '
    + 'ONE commit: 75 files, 9,130 lines — API, database, web app, deploy config. I did not open '
    + 'an editor. '
    + 'Beat 2 — and the next morning went on four Railway build fixes in twenty minutes, because '
    + 'it is never that clean. '
    + 'Beat 3 — the loop came FIVE DAYS after the queue, on 11 June, as an MCP connector: '
    + 'whats_next, create_task, start_session, finish_session, upload_session_log. That order '
    + 'matters — first a place to put work, then a way to ask for it. '
    + 'Beat 4 — after that it is just talking, and the queue starts improving the thing that '
    + 'runs it. '
    + 'Beat 5 — and then the loop, which is the only sentence that matters. And it is a real '
    + 'command: /loop shipped in Claude Code 2.1.71 on 7 March 2026, three months before any of '
    + 'this, and anyone in the room can type it tonight. '
    + 'Then the honest sentence, because it is the bridge to the rest of the talk: /loop is '
    + 'SESSION-SCOPED. It re-fires into the same conversation and dies when you close the '
    + 'terminal — the CLI says so itself: «Runs until you close this session». What I ended up '
    + 'with instead is a runner, `juggernaut start` (2 August 2026), which opens a PANE PER TASK '
    + 'and re-prompts that same pane when the task comes back — so every task gets its own '
    + 'session and its own transcript back on the card, the loop survives a closed laptop, and '
    + 'several agents can poll the same queue. Before it, a cron job did the job badly: the '
    + 'comment in that file says it «threw away the context every tick». '
    + 'The number to say out loud: of 2,969 commits in that repository, 2,482 carry a Claude '
    + 'session trailer. Five months, and about five sixths of it written by the agents working '
    + 'the queue.',
};
