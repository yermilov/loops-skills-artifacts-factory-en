import { useEffect, useState } from 'react';
import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';

/**
 * Where it starts: one session, and a queue that did not exist an hour ago.
 * Three beats (vision, build, loop), one per click, and the newest one PLAYS — you type, it answers,
 * the tool runs, the result lands. The beats are the real sequence out of
 * myclaw's own history; the dates live in the notes, not on the frame.
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
  /** `fired`: the harness put it there (a /loop tick) — it lands whole, nobody types it */
  | { kind: 'you'; text: string; fired?: boolean }
  | { kind: 'say'; text: string }
  | {
      kind: 'tool';
      text: string;
      result: string;
      preview?: string[];
      /** How long the tool «runs» before its result lands; default RUN_MS. */
      ms?: number;
    };

/** The vision, shortened for the stage from the first commit's CLAUDE.md
 *  (6 June 2026, 19:04) — the real one is 18 lines; the project's name is
 *  aliased to «myclaw» throughout the deck. */
const VISION = [
  '# CLAUDE.md',
  '## Vision',
  'myclaw connects services and AI agents into one system.',
  'Its core is a task system:',
  '- tasks are assigned to agents (Claude Code, Codex, OpenClaw…)',
  '  that poll and pick them up',
  '- every agent session is attached back to its task',
  'Not an agent itself — the connecting tissue between them.',
  'Personal: not scalable, but low-latency and delightful.',
];

const API = 'https://myclaw-api.up.railway.app';
const TASK_ID = '7f3a2c91';
const LOOP_PROMPT = 'get the next task from myclaw-api.up.railway.app/api/tasks, do it, close it, report back';
/** Claude Code's own summary under an Edit/Update result. */
const EDIT_RESULT = (added: number, removed: number) =>
  `Added ${added} line${added === 1 ? '' : 's'}${removed ? `, removed ${removed} line${removed === 1 ? '' : 's'}` : ''}`;

/** Each beat appends to the session. */
const STEPS: Line[][] = [
  [
    {
      kind: 'you',
      // the vision itself went in as a paste, which Claude Code collapses to this
      // placeholder (format read off the 2.1.322 binary: «[Pasted text #N +M lines]»)
      text: 'create CLAUDE.md with one section Vision and following text: [Pasted text #1 +7 lines]',
    },
    {
      kind: 'tool',
      text: 'Write(CLAUDE.md)',
      result: `Wrote ${VISION.length} lines to CLAUDE.md`,
      preview: VISION,
    },
  ],
  [
    {
      kind: 'you',
      text: 'build a server that stores tasks for agents, with an API to create a task, get the next task to work on, and close it',
    },
    // The evening of 6 June 2026, 19:12 → 21:15, replayed over about half a minute —
    // the SERVER half only (the real commit also carried a web board, left out
    // on purpose). Rebuilt from the one commit it produced (bd712975: message,
    // file list with line counts, CLAUDE.md diff) — no transcript survives.
    // Every ⎿ line is output in the CLI's own words: Write's «Wrote N lines to»,
    // drizzle-kit's and vitest's summaries, and Railway's deploy line.
    {
      kind: 'say',
      text: 'Plan: Bun + Hono for the API, Drizzle over Postgres for the tasks, end-to-end tests against a real database, Railway to host it. OK?',
    },
    { kind: 'you', text: 'go' },
    {
      kind: 'tool',
      text: 'Write(packages/db-schema/src/tasks.ts)',
      result: 'Wrote 29 lines to packages/db-schema/src/tasks.ts',
      ms: 1900,
    },
    {
      kind: 'tool',
      text: 'Write(packages/db-schema/src/sessions.ts)',
      result: 'Wrote 54 lines to packages/db-schema/src/sessions.ts',
      ms: 1800,
    },
    {
      kind: 'tool',
      text: 'Bash(pnpm --filter @myclaw/api db:generate)',
      result: '[✓] Your SQL migration file ➜ drizzle/0000_workable_tag.sql 🚀',
      ms: 1700,
    },
    {
      kind: 'tool',
      text: 'Write(apps/api/src/services/tasks.ts)',
      result: 'Wrote 172 lines to apps/api/src/services/tasks.ts',
      ms: 2800,
    },
    {
      kind: 'tool',
      text: 'Write(apps/api/src/routes/tasks.ts)',
      result: 'Wrote 53 lines to apps/api/src/routes/tasks.ts',
      ms: 2100,
    },
    {
      kind: 'tool',
      text: 'Write(apps/api/test/tasks.test.ts)',
      result: 'Wrote 132 lines to apps/api/test/tasks.test.ts',
      ms: 2500,
    },
    {
      kind: 'tool',
      text: 'Bash(pnpm --filter @myclaw/api test)',
      result: 'Tests  12 passed (12)',
      ms: 2400,
    },
    {
      kind: 'tool',
      text: 'Write(apps/api/railway.json)',
      result: 'Wrote 14 lines to apps/api/railway.json',
      ms: 1600,
    },
    {
      kind: 'tool',
      text: 'Bash(git add -A && git commit -m "Scaffold initial task tracker")',
      result: '[main bd71297] Scaffold initial task tracker',
      ms: 1200,
    },
    // the deploy goes through first time here — in real life it took the next
    // morning and three more pushes (see the notes). Wording is the Railway
    // CLI's own («Deploy complete», «Live at»); /api/healthz is the commit's.
    {
      kind: 'tool',
      text: 'Bash(railway up --ci)',
      result: 'Deploy complete · Live at https://myclaw-api.up.railway.app',
      ms: 2400,
    },
    {
      kind: 'tool',
      text: 'Bash(curl -s https://myclaw-api.up.railway.app/api/healthz)',
      result: '{"status":"ok","service":"myclaw-api"}',
      ms: 900,
    },
  ],
  [
    // The loop, straight against the REST API the first beat built — no MCP
    // connector, no tasks yet. With an empty queue the honest first answer is
    // `[]`, and /loop simply waits for the next tick.
    {
      kind: 'you',
      text: `/loop 10m ${LOOP_PROMPT}`,
    },
    {
      kind: 'tool',
      text: "Bash(curl -s 'https://myclaw-api.up.railway.app/api/tasks?status=todo')",
      result: '[]',
    },
    { kind: 'say', text: 'The queue is empty — nothing to do. Checking again in 10 minutes.' },
  ],
  [
    // Same session, a few minutes later: the first real task goes in through
    // the API the session built an hour ago.
    { kind: 'you', text: 'create task to add priorities (high, medium, low) to the tasks' },
    {
      kind: 'tool',
      text: `Bash(curl -s -X POST ${API}/api/tasks -d '{"title":"Add priorities (high, medium, low) to tasks"}')`,
      result: `{"id":"${TASK_ID}","title":"Add priorities (high, medium, low) to tasks","status":"todo"}`,
      ms: 900,
    },
    { kind: 'say', text: `Created task ${TASK_ID}.` },
  ],
  [
    // The tick: /loop re-enters its own prompt into the same session — the
    // harness writes the «user» turn (the previous slide), so it lands whole.
    { kind: 'you', text: LOOP_PROMPT, fired: true },
    {
      kind: 'tool',
      text: `Bash(curl -s '${API}/api/tasks?status=todo')`,
      result: `[{"id":"${TASK_ID}","title":"Add priorities (high, medium, low) to tasks","status":"todo"}]`,
    },
    {
      kind: 'tool',
      text: `Bash(curl -s -X PATCH ${API}/api/tasks/${TASK_ID} -d '{"status":"in_progress"}')`,
      result: `{"id":"${TASK_ID}","status":"in_progress"}`,
      ms: 700,
    },
    {
      kind: 'tool',
      text: 'Update(packages/db-schema/src/tasks.ts)',
      result: EDIT_RESULT(4, 0),
      ms: 1500,
    },
    {
      kind: 'tool',
      text: 'Bash(pnpm --filter @myclaw/api db:generate)',
      result: '[✓] Your SQL migration file ➜ drizzle/0001_task_priority.sql 🚀',
      ms: 1500,
    },
    {
      kind: 'tool',
      text: 'Update(apps/api/src/services/tasks.ts)',
      result: EDIT_RESULT(11, 3),
      ms: 1900,
    },
    {
      kind: 'tool',
      text: 'Update(apps/api/src/routes/tasks.ts)',
      result: EDIT_RESULT(6, 1),
      ms: 1500,
    },
    {
      kind: 'tool',
      text: 'Update(apps/api/test/tasks.test.ts)',
      result: EDIT_RESULT(31, 0),
      ms: 1700,
    },
    {
      kind: 'tool',
      text: 'Bash(pnpm --filter @myclaw/api test)',
      result: 'Tests  15 passed (15)',
      ms: 2200,
    },
    {
      kind: 'tool',
      text: 'Bash(git add -A && git commit -m "Add task priorities")',
      result: '[main 4c1e8a2] Add task priorities',
      ms: 1000,
    },
    {
      kind: 'tool',
      text: 'Bash(railway up --ci)',
      result: `Deploy complete · Live at ${API}`,
      ms: 2200,
    },
    {
      kind: 'tool',
      text: `Bash(curl -s -X PATCH ${API}/api/tasks/${TASK_ID} -d '{"status":"done"}')`,
      result: `{"id":"${TASK_ID}","status":"done","priority":"medium"}`,
      ms: 700,
    },
    {
      kind: 'say',
      text: `Done: tasks now have a priority — high, medium or low, medium by default — and the next task is the highest-priority one. Deployed, and ${TASK_ID} is closed.`,
    },
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
  if (line.kind === 'you') return line.fired ? 0 : line.text.length * TYPE_MS;
  if (line.kind === 'say') return line.text.split(' ').length * WORD_MS;
  return line.ms ?? RUN_MS;
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
    if (line.kind === 'you' && line.fired) {
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
      {/* Write prints the file it wrote, numbered, under the result line */}
      {done && line.preview && (
        <div className="ww-boot__preview">
          {line.preview.map((text, i) => (
            <div key={i} className="ww-boot__previewline">
              <span className="ww-boot__lineno">{i + 1}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      )}
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
        <span className="ww-boot__title">~/src/myclaw — claude</span>
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
          <div className="ww-boot__welcome-cwd">cwd: /Users/yarik/src/myclaw</div>
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
 *  explainer — everything that act makes possible. No title: the terminal
 *  takes the whole stage. */
function sessionSlide(id: string, from: number, count: number): SlideDefinition {
  return {
    id,
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
  ...sessionSlide('bootstrap-rest', 1, 2),
  notes:
    'Back in the same session, and now it moves. '
    + 'Beat 1 plays for about half a minute — let it, and talk over it. That was one evening: the vision '
    + 'at 19:04, the technical choices at 19:12, and at 21:15 the queue in ONE commit. It proposed '
    + 'the stack and I said go: Bun, Hono, Drizzle over Postgres, create / list / update / delete, '
    + 'twelve end-to-end tests against a real Postgres, no mocks, and the Railway config. I did not '
    + 'open an editor. '
    + 'Honest about the replay: it is rebuilt from that commit — files, counts and routes are all '
    + 'in it — not from a transcript, and it shows only the server: the real commit (75 files, '
    + '9,130 lines) also carried a web board, left out here. And notice how «get the next task» '
    + 'was answered on day one: a list filtered by status=todo — the agent still had to pick. '
    + 'Then it deploys, and here it goes through first time — say the truth: in real life the build '
    + 'failed on Railway and took three more pushes the next morning, 11:19 to 11:30. It is never '
    + 'that clean. '
    + 'And that is enough for the next click. '
    + 'Beat 2 — the loop, which is the only sentence that matters, and it talks to the queue over '
    + 'plain REST: curl, the list filtered by status=todo. The queue is empty, so the honest '
    + 'answer is [] and it waits for the next tick. (In real life the MCP connector came five days '
    + 'later, on 11 June — a nicer way to ask for work, not a different idea.) And /loop is a real '
    + 'command: /loop shipped in Claude Code 2.1.71 on 7 March 2026, three months before any of '
    + 'this, and anyone in the room can type it tonight. '
    + 'Then the honest sentence, because it is the bridge to the rest of the talk: /loop is '
    + 'SESSION-SCOPED. It re-fires into the same conversation and dies when you close the '
    + 'terminal — the CLI says so itself: «Runs until you close this session». What I ended up '
    + 'with instead is a runner, `myclaw start` (2 August 2026), which opens a PANE PER TASK '
    + 'and re-prompts that same pane when the task comes back — so every task gets its own '
    + 'session and its own transcript back on the card, the loop survives a closed laptop, and '
    + 'several agents can poll the same queue. Before it, a cron job did the job badly: the '
    + 'comment in that file says it «threw away the context every tick». '
    + 'The number to say out loud: of 2,969 commits in that repository, 2,482 carry a Claude '
    + 'session trailer. Five months, and about five sixths of it written by the agents working '
    + 'the queue.',
};

/** After the loop explainer: back in the same session, the first real task —
 *  created by hand, then picked up and done by the loop on its next tick. */
export const BootstrapTaskSlide: SlideDefinition = {
  ...sessionSlide('bootstrap-task', 3, STEPS.length - 3),
  notes:
    'Back in the session, where we left it: the loop is ticking, the queue is empty. '
    + 'Beat 1 — I ask for the first real task, and the agent creates it through the API it built an '
    + 'hour ago. Nobody does it yet: the loop is waiting. '
    + 'Beat 2 — ten minutes later the tick fires. Point at the prompt line: nobody typed it, it lands '
    + 'whole — that is the harness writing a «User:» turn, exactly the sheet on the previous slide. '
    + 'Then it is an ordinary run: fetch the queue, claim the task, change the schema, migrate, the '
    + 'service, the route, the tests, commit, deploy, close the task. The first feature of the '
    + 'queue was built by the queue. '
    + 'Honest about the replay: rebuilt for the stage — task id, line counts and commit hash are '
    + 'illustrative; in real life priorities came later and through the web board, not as the first task.',
};
