import { ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';
import { CornerRings, Reveal } from '../components/wawtech';
import { ROUTES, RouteMap } from './RouteMap';
import { useClock } from './BootstrapSlide';
import { useAnimating } from '../components/frameSettled';
import dashLight from '../assets/assistant/dash-light.jpg';
import {
  App,
  Chip,
  Comment,
  Event,
  Fields,
  SessionFoot,
  Task,
  TaskBar,
  TaskCard,
  Thumb,
} from './ledgerApp';

/**
 * «How do we improve it?» — six slides that answer the four «not so great»
 * beats of the session slide before them, and say so: every slide carries the
 * same LEDGER at its foot — the four problems as pills, grey while open,
 * magenta while this slide is working on one, mint once it is fixed. By the
 * last slide all four are mint, which is the answer to «does it cover them?».
 *
 * Yarik's outline (12.11.2026), drawn from what juggernaut actually is — the
 * project is aliased «myclaw» throughout the deck. The interfaces are
 * RECREATIONS for the stage (tasks, sums and names are invented — the real app is
 * full of private data), but since 13.11.2026 they are recreations of the REAL
 * interface, studied in the running product: the web app's look and structure
 * (ledgerApp.tsx) and herdr's sidebar of spaces and agents (Herdr below). And
 * the mechanics are read off the code, not memory:
 *   - the board, the per-task thread and the session attached back to its task:
 *     apps/web/src/routes/board.tsx, task-detail.tsx, session-view.tsx;
 *   - the human's queue: an answer re-assigns the task to the agent that asked
 *     (apps/api/src/services/questions.ts — status todo, assignee = the asker);
 *   - artifacts: ONE html panel at the top of the task page, in two versions,
 *     `set_task_artifact(task_id, html_wide, html_narrow)`;
 *   - the pages: apps/web/src/routes — money, home, movies, books, music,
 *     nanny, coffee, attack, sleep (and a dozen more);
 *   - the runner: `juggernaut start` polls GET /api/tasks/next every 60 s
 *     (apps/cli/src/features/tasks.ts, POLL_SECONDS) — plain code, no model —
 *     and opens a herdr pane per task with the model and effort the SERVER
 *     resolved (task override → agent default → built-in);
 *   - any agent: juggernaut launches claude, codex and opencode; herdr 0.7's
 *     `agent start --kind` lists 24, cursor among them; codex and opencode can
 *     run OpenRouter models, its `:free` ones too (apps/cli/src/openrouter-provider.ts,
 *     packages/api-types/src/agent-models.ts);
 *   - pacing: the server withholds lower priorities while a subscription runs
 *     ahead of its 7-day pace (apps/api/src/services/tasks.ts);
 *   - agents talking: `juggernaut review` / `consult` / `delegate`
 *     (apps/cli/src/review.ts, consult.ts, delegate.ts) — always the OTHER vendor.
 */

/* ─── The ledger: the four problems, and which of them is settled ─────────── */

const PROBLEMS = ['chat-only UX', 'ticks cost tokens', 'context fills up', 'one model'] as const;
type Problem = (typeof PROBLEMS)[number];

function Ledger({ fixed = [], now = [] }: { fixed?: Problem[]; now?: Problem[] }) {
  return (
    <div className="ww-imp__ledger">
      {PROBLEMS.map((problem) => {
        const state = fixed.includes(problem) ? 'fixed' : now.includes(problem) ? 'now' : 'open';
        return (
          <span key={problem} className={`ww-imp__problem ww-imp__problem--${state}`}>
            {state === 'fixed' && <span aria-hidden="true">✓ </span>}
            {problem}
          </span>
        );
      })}
    </div>
  );
}

/** A browser window: the web app is the point of slides 1–4. */
export function Browser({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div className="ww-imp__browser">
      <div className="ww-imp__chrome">
        <span className="ww-dot ww-dot--red" />
        <span className="ww-dot ww-dot--amber" />
        <span className="ww-dot ww-dot--green" />
        <span className="ww-imp__url">{url}</span>
      </div>
      <div className="ww-imp__page">{children}</div>
    </div>
  );
}

/* ─── 1 · A web UI for the tasks ──────────────────────────────────────────── */

/*
 * The first view is the INBOX, and the inbox is a queue for the human — the rule is
 * read off the product (selectInboxCards in juggernaut's apps/web/src/routes/board.tsx,
 * 13.11.2026): a task is in it when it is assigned to ME, in any open status, or when
 * it sits with an agent in a status only a human can clear (blocked here). An agent
 * quietly working its task is NOT in it. Order: priority, then the newest.
 * So the car errand is NOT in the list while the agent has it, and lands on top only
 * when the agent has finished and handed it back (paused, on me) — see TaskLife.
 */
const CAR: Task = {
  title: 'Book the car service',
  status: 'paused',
  who: '@me',
  high: true,
  age: 'now',
};
const GYM: Task = {
  title: 'Cancel the old gym membership',
  status: 'blocked',
  who: 'Claude Code',
  age: '1d',
};
const BOILER: Task = {
  title: 'Call the landlord about the boiler',
  status: 'todo',
  who: '@me',
  age: '2d',
};
const NAS: Task = {
  title: 'Plan: move photos off the old NAS',
  status: 'plan',
  who: '@me',
  age: '2h',
};
const WATER: Task = {
  title: 'Pay the water bill',
  status: 'input',
  who: '@me',
  high: true,
  age: '3d',
};
const INBOX = [WATER, NAS, GYM, BOILER];

/**
 * The task page plays the task's whole life by itself, no clicks — three moments,
 * each as the app would show it (timeline newest first):
 *   1. I create the task: one sentence and a photo, assigned to the agent;
 *   2. the agent picks it up: «moved todo → in progress», a session in flight;
 *   3. the agent answers: the report with the files it made, and the task is
 *      handed back — paused, on me — so only NOW does it land in my inbox, on top.
 * While the agent holds it the task is not in the list at all: that is the inbox
 * rule above, and the reason the list does not move until the last moment.
 */
export const STREAM_MS = 750; // one line of the session per this long
/** What the session is doing while it is in flight, streamed into the task page a
 *  line at a time. NOT the product yet — the page says «Session is still running»
 *  today; this is where it is going (Yarik, 13.11.2026), so the notes say so. The
 *  calls are the ones the session slide already showed for this errand. */
const STREAM = [
  'Read(dash-light.jpg)',
  'Skill(user-information)',
  "Bash(curl -s '…/api/tasks?q=service&status=done')",
  'WebSearch(car service Podil, Thursday morning)',
  'Google Calendar - create_event("Car service") (MCP)',
  'Write(booking-confirmation.pdf)',
];
const STREAM_WINDOW = 4; // the lines the card shows; older ones scroll off its top
const PICKED_MS = 2600;
const LIFE_MS = [0, PICKED_MS, PICKED_MS + (STREAM.length + 1) * STREAM_MS] as const; // created · picked up · answered
type Moment = 0 | 1 | 2;

/** The second round, a click of its own: I ask a follow-up in a comment, the agent
 *  takes the task back, works — and answers with a map it WROTE, not a paragraph. */
const MAP_STREAM = [
  'Skill(user-information)',
  'WebSearch(AutoHub Podil → the office, Thursday 10:00)',
  'Write(routes.html)',
];
const MAP_PICKED_MS = 1800;
const MAP_ANSWERED_MS = MAP_PICKED_MS + (MAP_STREAM.length + 1) * STREAM_MS;
/** …and the answer is an ARTIFACT, not a picture: a pointer comes in and clicks the
 *  taxi row, and the map re-draws for it. POINTER_DELAY_MS / POINTER_MS are the
 *  pointer's wait and travel — the same numbers as the CSS animation that moves it
 *  (`ww-jg-point` in slide-layouts.css). */
const POINTER_DELAY_MS = 1400;
const POINTER_MS = 900;
// asked · picked up · answered · clicked
const MAP_MS = [0, MAP_PICKED_MS, MAP_ANSWERED_MS, MAP_ANSWERED_MS + POINTER_DELAY_MS + POINTER_MS] as const;

/** A session in flight: its tool calls, the newest at the foot. */
export function InFlight({ lines, since, t }: { lines: string[]; since: number; t: number }) {
  const streamed = Math.max(1, Math.min(lines.length, Math.floor((t - since) / STREAM_MS) + 1));
  return (
    <div className="ww-jg__arrive">
      <Comment who="Claude Code" tag="In flight" when="now">
        <span className="ww-jg__stream">
          {lines.slice(Math.max(0, streamed - STREAM_WINDOW), streamed).map((line) => (
            <span key={line} className="ww-jg__streamline">
              <span aria-hidden="true">⏺</span>
              {line}
            </span>
          ))}
        </span>
      </Comment>
    </div>
  );
}

function TaskLife({ withMap }: { withMap: boolean }) {
  const t = useClock(0);
  const tMap = useClock(withMap ? 1 : 0); // restarts on the map click
  // landing on the map reveal directly (a link, the PDF) shows the first round
  // finished, not replaying under the second one
  const moment: Moment = withMap || t >= LIFE_MS[2] ? 2 : t >= LIFE_MS[1] ? 1 : 0;
  const mapMoment = !withMap ? -1 : tMap >= MAP_MS[3] ? 3 : tMap >= MAP_MS[2] ? 2 : tMap >= MAP_MS[1] ? 1 : 0;
  const picked = mapMoment === 3 ? 1 : 0; // the row the pointer has clicked
  // with the agent: from the ask until its answer, in either round
  const agentHasIt = moment < 2 || (withMap && mapMoment < 2);
  // busy until the answer is in, so the PDF and the ready mark wait for the last moment
  useAnimating(agentHasIt || mapMoment === 2);
  const status =
    moment === 0
      ? ({ label: 'Status', value: 'Todo' } as const)
      : agentHasIt
        ? ({ label: 'Status', value: 'In progress', tone: 'time' } as const)
        : ({ label: 'Status', value: 'Paused', tone: 'hold' } as const);
  return (
    <div className="ww-jg__split ww-jg__split--inbox">
      <div className="ww-jg__list">
        {!agentHasIt && (
          <div className="ww-jg__arrive" key={withMap ? 'again' : 'first'}>
            <TaskCard task={CAR} withStatus selected />
          </div>
        )}
        {INBOX.map((task) => (
          <TaskCard key={task.title} task={task} withStatus />
        ))}
      </div>
      <div className="ww-jg__detail">
        <span className="ww-jg__title">{CAR.title}</span>
        <span className="ww-jg__label">ID 5d1e07b2</span>
        <Fields
          fields={[
            status,
            { label: 'Priority', value: 'High', tone: 'danger' },
            { label: 'Assignee', value: agentHasIt ? 'Claude Code' : '@me' },
            { label: 'Created', value: 'Nov 17, 09:02' },
          ]}
        />
        <div className={`ww-jg__timeline${withMap ? ' ww-jg__timeline--fade' : ''}`}>
          {mapMoment === 1 && <InFlight key="mapflight" lines={MAP_STREAM} since={MAP_PICKED_MS} t={tMap} />}
          {mapMoment >= 2 && (
            <div className="ww-jg__arrive" key="map">
              <Comment who="Claude Code" tag="Session report" when="now">
                <p>Three ways — I would take the metro.</p>
                <div className="ww-jg__mapreply">
                  <div className="ww-jg__artifactmap">
                    <RouteMap bare pick={picked} />
                  </div>
                  <div className="ww-jg__routes">
                    {ROUTES.map((route, i) => (
                      <div key={route.mode} className={`ww-jg__route${i === picked ? ' ww-jg__route--on' : ''}`}>
                        <span className="ww-jg__routeno">{i + 1}</span>
                        <span className="ww-jg__routename">{route.mode}</span>
                        <span className="ww-jg__routetime">{route.time}</span>
                      </div>
                    ))}
                  </div>
                  {/* the deck's own actor: a pointer that comes in and clicks the second row */}
                  <svg className="ww-jg__pointer" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 3l14 8-6.5 1.6L10 19z" />
                  </svg>
                  {mapMoment === 3 && <span className="ww-jg__click" aria-hidden="true" />}
                </div>
              </Comment>
            </div>
          )}
          {withMap && (
            <div className="ww-jg__arrive" key="ask">
              <Comment who="@me" when={mapMoment >= 2 ? '2m ago' : 'now'} plain>
                <p>How do I get from the service to the office after I drop the car?</p>
              </Comment>
            </div>
          )}
          {moment === 1 && <InFlight key="flight" lines={STREAM} since={PICKED_MS} t={t} />}
          {moment === 2 && (
            <div className="ww-jg__arrive" key="report">
              <Comment who="Claude Code" tag="Session report" when="now">
                <p>
                  Booked: AutoHub Podil, Thursday 19 November, 9:40. I told them about the tyre-pressure
                  light.
                </p>
                <span className="ww-jg__chips">
                  <Chip>booking-confirmation.pdf</Chip>
                  <Chip>car-service.ics</Chip>
                </span>
                <SessionFoot>Opus 5.5 · 310K tok · ~$0.84</SessionFoot>
              </Comment>
            </div>
          )}
          {moment >= 1 && (
            <div className="ww-jg__arrive" key={`event${moment}`}>
              <Event when="now">
                {moment === 1
                  ? 'Claude Code moved todo → in progress'
                  : 'Claude Code moved in progress → paused'}
              </Event>
            </div>
          )}
          <Comment who="@me" when={moment === 0 ? 'now' : moment === 1 ? '1m ago' : '12m ago'} plain>
            <p>Book a car service this week — a morning, in Podil. Tell them about this light:</p>
            <Thumb src={dashLight} alt="A dashboard with the tyre-pressure light on" />
          </Comment>
        </div>
      </div>
    </div>
  );
}

export const TaskBoardSlide: SlideDefinition = {
  id: 'improve-board',
  maxRevealStages: 3,
  initialRevealStage: 1,
  content: ({ revealStage }) => (
    <>
      <CornerRings corner="top-right" />
      <div className="ww-imp ww-imp--claim">
        {/* no title band: the headline is the session slide's verdict line, turned over */}
        <div className="ww-asst__claim ww-asst__claim--great">
          <span className="ww-asst__verdict">
            <span aria-hidden="true">✓</span>
            fixed
          </span>
          <span key={revealStage >= 3 ? 'ui' : 'web'} className="ww-jg__arrive">
            {revealStage >= 3 ? 'the agent answers with an artifact' : 'a web UI for the tasks'}
          </span>
        </div>
        <Browser url="myclaw.app">
          <App active="Tasks" pages={['Tasks']}>
            <TaskBar view="Inbox" switcher={false} />
            {revealStage < 2 ? (
              <div className="ww-jg__split ww-jg__split--inbox">
                <div className="ww-jg__list">
                  {INBOX.map((task) => (
                    <TaskCard key={task.title} task={task} withStatus />
                  ))}
                </div>
                <div className="ww-jg__empty ww-jg__label">Select a task</div>
              </div>
            ) : (
              <TaskLife key="life" withMap={revealStage >= 3} />
            )}
          </App>
        </Browser>
      </div>
    </>
  ),
  notes:
    'How do we improve it? Four problems on the table — we take them one by one. ' +
    'First, the obvious one. Instead of creating tasks in a chat and asking the chat what is in ' +
    'the queue, I write a web UI for the tasks: I can browse them like in Jira — what is in ' +
    'progress, what is waiting, what is done, who has it. ' +
    'What is on the screen is MY queue: the tasks assigned to me, plus the ones an agent is ' +
    'blocked on — an agent quietly working is not my problem and is not here. ' +
    'Click — and it plays by itself, three moments, talk over it: I create a task — one sentence ' +
    'and a photo, assigned to the agent. The agent picks it up: in progress, a session in flight — ' +
    'and its tool calls stream into the page as it works (honest: today the page only says the ' +
    'session is running; the live stream is where it is going) — ' +
    'and notice it is NOT in my list, it is not my problem yet. Then the agent answers: the report, ' +
    'the files it made, and the task comes back to me, on top of my queue. ' +
    'Click — the headline changes, and it plays again: I ask a follow-up right there, in a ' +
    'comment — how do I get from the service to the office? The task goes back to the agent (it ' +
    'leaves my list again), it works — the last line is Write(routes.html) — and it answers with ' +
    'what it wrote: a map and the three routes, not a wall of text. And it is not a picture — ' +
    'watch the pointer: I click «Taxi» and the map re-draws. An artifact is a small live UI. ' +
    'Nobody designed a «directions» feature: the agent decided what the most convenient UX for ' +
    'this answer is, and wrote it. Next task, a different UI: a table to tick, a chart, a form. ' +
    '(In the product it is one tool call — set_task_artifact with the HTML in two versions, wide ' +
    'and narrow — and the page pins it at the very top; here it is drawn inside the answer.) ' +
    'A task is a page, not a paragraph in a scrollback: what I asked, what the agent ' +
    'answered, the files it attached. And the session itself is attached back to the task — ' +
    'every agent run, uploaded, so three weeks later I can open what it actually did. ' +
    'Honest about the picture: a recreation of the real board, with illustrative tasks.',
};

/* ─── 5 · The runner: plain code, a pane per task ─────────────────────────── */

type Run = 'working' | 'idle' | 'done';
type Space = { name: string; state: Run; focused?: boolean };
type Agent = { title: string; role: string; state: string; run: Run; focused?: boolean; model?: string };
type PaneLine = { kind: 'you' | 'tool' | 'say' | 'dim'; text: string };

/**
 * herdr, drawn after the running app (13.11.2026): on the left «spaces» — the
 * runner's own space first, carrying the status lines it keeps there, then one
 * space per task, named after the task, with a dot for its state (amber working,
 * hollow idle, teal done) — and under it «agents», each with its role, its tool and
 * its state. On the right the focused space: a tab strip and its pane(s).
 * `model` on an agent row is the deck's addition (the real sidebar does not print
 * it) — it is how the slide puts two tasks' models side by side.
 */
function Herdr({
  status,
  spaces,
  agents,
  hotModel = false,
  children,
}: {
  status: string[];
  spaces: Space[];
  agents: Agent[];
  hotModel?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="ww-hd">
      <div className="ww-hd__side">
        <span className="ww-hd__head">spaces</span>
        <span className="ww-hd__space">
          <span className="ww-hd__dot ww-hd__dot--none" />
          myclaw
        </span>
        {status.map((line) => (
          <span key={line} className="ww-hd__status">
            {line}
          </span>
        ))}
        {spaces.map((space) => (
          <span key={space.name} className={`ww-hd__space${space.focused ? ' ww-hd__space--on' : ''}`}>
            <span className={`ww-hd__dot ww-hd__dot--${space.state}`} />
            <span className="ww-hd__clip">{space.name}</span>
          </span>
        ))}
        <span className="ww-hd__head ww-hd__head--agents">
          <span>agents</span>
          <span>grouped</span>
        </span>
        {agents.map((agent) => (
          <span key={agent.title + agent.role} className={`ww-hd__agent${agent.focused ? ' ww-hd__agent--on' : ''}`}>
            <span className="ww-hd__space">
              <span className={`ww-hd__dot ww-hd__dot--${agent.run}`} />
              <span className="ww-hd__clip">{agent.title}</span>
            </span>
            <span className="ww-hd__status">{agent.role}</span>
            <span className="ww-hd__status">
              {agent.state}
              {agent.model && (
                <span className={hotModel ? 'ww-hd__model ww-hd__model--hot' : 'ww-hd__model'}> · {agent.model}</span>
              )}
            </span>
          </span>
        ))}
      </div>
      <div className="ww-hd__main">
        <span className="ww-hd__tabs">
          <span className="ww-hd__tab">1</span>
          <span>+</span>
        </span>
        <div className="ww-hd__panes">{children}</div>
      </div>
    </div>
  );
}

function HPane({ lines }: { lines: PaneLine[] }) {
  return (
    <div className="ww-hd__pane">
      {lines.map((line) => (
        <span key={line.text} className={`ww-hd__line ww-hd__line--${line.kind}`}>
          {line.kind === 'you' && <span className="ww-hd__caret">&gt; </span>}
          {(line.kind === 'tool' || line.kind === 'say') && <span className="ww-hd__bullet">⏺ </span>}
          {line.text}
        </span>
      ))}
    </div>
  );
}

const DAEMON_PANE: PaneLine[] = [
  { kind: 'dim', text: '$ myclaw start' },
  { kind: 'dim', text: '23:41:07  GET /api/tasks/next → none' },
  { kind: 'dim', text: '23:42:07  GET /api/tasks/next → none' },
  { kind: 'dim', text: '23:43:07  GET /api/tasks/next → none' },
];
const CAR_PANE: PaneLine[] = [
  { kind: 'you', text: 'Work the task «Book the car service»' },
  { kind: 'tool', text: 'Skill(do-task)' },
  { kind: 'tool', text: 'Read(car/history.md)' },
  { kind: 'say', text: 'Three quotes against six years of history…' },
];
const RUN_SPACES: Space[] = [
  { name: 'Book the car service', state: 'working', focused: true },
  { name: 'Put the service in the calendar', state: 'working' },
  { name: 'Summarise the building chat', state: 'done' },
];
const RUN_AGENTS: Agent[] = [
  { title: 'Book the car service', role: 'autonomous · Claude Code', state: 'in progress', run: 'working', focused: true, model: 'opus · high' },
  { title: 'Put the service in the calendar', role: 'autonomous · Claude Code', state: 'in progress', run: 'working', model: 'haiku · low' },
  { title: 'Summarise the building chat', role: 'autonomous · Claude Code', state: 'finished', run: 'done', model: 'sonnet · low' },
];

/** The loop, as code: each line tagged with the beat that lights it. */
const RUNNER_CODE: { text: string; at?: number; also?: number }[] = [
  { text: 'while (true) {' },
  { text: "  task = await fetch('/api/tasks/next')", at: 1, also: 4 },
  { text: '  if (task) {' },
  { text: "    herdr('workspace create')", at: 2 },
  { text: "    herdr('agent start', task.id," },
  { text: "      '--model', task.model,", at: 3 },
  { text: "      '--effort', task.effort)", at: 3 },
  { text: '  }' },
  { text: '  await sleep(60_000)', at: 1 },
  { text: '}' },
];

const RUNNER_BEATS: { claim: string; fixed: Problem[] }[] = [
  { claim: 'Plain code polls the queue — an empty tick costs nothing', fixed: ['ticks cost tokens'] },
  { claim: 'Every task gets its own pane — a fresh context', fixed: ['ticks cost tokens', 'context fills up'] },
  {
    claim: 'Model and effort are picked per task',
    fixed: ['ticks cost tokens', 'context fills up', 'one model'],
  },
  {
    claim: 'And the queue paces the work to the subscription',
    fixed: ['ticks cost tokens', 'context fills up', 'one model'],
  },
];

/** The pace rule, as the server applies it when the daemon asks for the next task
 *  (juggernaut apps/api/src/services/tasks.ts): utilization of the 7-day window minus
 *  the share of the window already elapsed. Above pace → low-priority work waits;
 *  more than 3 points above → only high is served. The two figures are illustrative;
 *  the card is the app's own, off its Agents page: the week's usage as a line against
 *  the dotted diagonal of an even pace. */
const PACE = { used: 62, elapsed: 58 };
/** Usage over the week so far, as (share of the week, share of the limit). */
const USAGE: [number, number][] = [
  [0, 0], [6, 3], [10, 3], [14, 11], [20, 14], [24, 22], [31, 26], [36, 37], [43, 41], [47, 50], [52, 54], [58, 62],
];

function PaceCard() {
  const x = (v: number) => 20 + v * 5.6;
  const y = (v: number) => 150 - v * 1.3;
  return (
    <div className="ww-jg ww-jg--card">
      <div className="ww-jg__pace">
        <span className="ww-jg__pacehead">
          <span className="ww-jg__panelname">Anthropic personal</span>
          <span className="ww-jg__label">used {PACE.used}%</span>
          <span className="ww-jg__label ww-jg__label--danger">
            +{PACE.used - PACE.elapsed}% above pace
          </span>
          <span className="ww-jg__label">resets in 3d</span>
        </span>
        <svg className="ww-jg__pacechart" viewBox="0 0 600 160" preserveAspectRatio="none" aria-hidden="true">
          <path className="ww-jg__paceeven" d={`M${x(0)} ${y(0)} L${x(100)} ${y(100)}`} />
          <path className="ww-jg__paceline" d={`M${USAGE.map(([a, b]) => `${x(a)} ${y(b)}`).join(' L')}`} />
          <path className="ww-jg__pacenow" d={`M${x(PACE.elapsed)} ${y(0)} L${x(PACE.elapsed)} ${y(PACE.used)}`} />
        </svg>
        <span className="ww-jg__paceverdict">above pace → only high priority</span>
      </div>
    </div>
  );
}

export const RunnerSlide: SlideDefinition = {
  id: 'improve-runner',
  title: (
    <>
      A daemon instead of /loop <span className="ww-llm__titlesub">— just plain code</span>
    </>
  ),
  maxRevealStages: RUNNER_BEATS.length,
  initialRevealStage: 1,
  content: ({ revealStage }) => {
    const stage = Math.min(Math.max(revealStage, 1), RUNNER_BEATS.length);
    const beat = RUNNER_BEATS[stage - 1];
    const running = stage >= 2;
    return (
      <>
        <CornerRings corner="top-right" />
        <div className="ww-imp">
          <div className="ww-imp__claim" key={stage}>
            {beat.claim}
          </div>
          <div className="ww-imp__runner">
            <div className="ww-imp__runnerleft">
              <pre className="ww-imp__code">
                {RUNNER_CODE.map((line) => (
                  <span
                    key={line.text}
                    className={line.at === stage || line.also === stage ? 'ww-imp__codeline--hot' : undefined}
                  >
                    {line.text}
                    {'\n'}
                  </span>
                ))}
              </pre>
            </div>
            <div className="ww-imp__runnerright">
            <Herdr
              status={running ? ['inbox: 3', 'in work: 2', 'Claude 7d 62%'] : ['inbox: 3', 'queue: empty', 'Claude 7d 62%']}
              spaces={running ? RUN_SPACES : []}
              agents={running ? RUN_AGENTS : []}
              hotModel={stage === 3}
            >
              <HPane lines={running ? CAR_PANE : DAEMON_PANE} />
            </Herdr>
            {/* the web app's own card, held over the terminal: what the server looks at */}
            <Reveal at={4} stage={revealStage}>
              <PaceCard />
            </Reveal>
            </div>
          </div>
          <Ledger fixed={['chat-only UX', ...beat.fixed]} />
        </div>
      </>
    );
  },
  notes:
    'Fifth — the three problems left, and one move takes all of them. We drop /loop. Instead a '
    + 'daemon runs the cycle, and the cycle is just plain code — a while loop. It uses herdr, a '
    + 'terminal multiplexer for agents: it can open a pane, start an agent in it, prompt it, and '
    + 'tell whether it is working. '
    + 'Beat 1 — the poll is an HTTP call. No model is involved in asking «is there work?», so an '
    + 'empty queue costs exactly nothing. Every sixty seconds instead of every ten minutes, and '
    + 'still free. '
    + 'Beat 2 — when there IS a task, the daemon opens a new pane for it and starts a fresh '
    + 'agent there. A fresh context for every task: nothing to compact, nothing left over from '
    + 'the previous eleven. And when the same task comes back from my queue, it goes to the SAME '
    + 'pane — so the agent still remembers that one. '
    + 'Beat 3 — and since the daemon starts the agent, it chooses the flags: the model and the '
    + 'reasoning effort, per task. The plan for a migration goes to the biggest model on high; '
    + 'the typo goes to the smallest on low. I can set it on the task; an agent filing a task can '
    + 'suggest it. '
    + 'Beat 4 — one more thing the queue can do once it, and not the agent, decides what runs '
    + 'next: it paces the work to my subscription. The server knows how much of the weekly limit '
    + 'is used and how much of the week is gone. Ahead of pace — low-priority tasks wait; more '
    + 'than a few points ahead — only high priority is served. So the limit lasts the week and '
    + 'none of it is left unused at the reset: the best utilization of a subscription I am '
    + 'paying for anyway. '
    + 'And what we lose from the «great» list: nothing. Each pane IS Claude Code — every feature '
    + 'it ships still arrives for free, and the panes start with remote control on, so the phone '
    + 'still works. '
    + 'Honest about the picture: the terminal is drawn after my real herdr, with one addition — '
    + 'the model beside each agent, which the real sidebar does not print. The usage card is the '
    + 'app\'s own, with illustrative figures. '
    + 'Honest about the code: it is the idea in ten lines. The real one, `juggernaut start`, is '
    + 'about five thousand, because it also heartbeats, reaps dead panes, uploads the transcript '
    + 'and survives a sleeping laptop. The server resolves the model — task override, then the '
    + 'agent\'s default, then a built-in — and hands the daemon two finished strings.',
};

/* ─── 6 · Any agent — and they talk ───────────────────────────────────────── */

const FLEET_SPACES: Space[] = [
  { name: 'Add priorities to tasks', state: 'working', focused: true },
  { name: 'Renew the car insurance', state: 'working' },
];
const FLEET_AGENTS: Agent[] = [
  { title: 'Add priorities to tasks', role: 'autonomous · Claude Code', state: 'in progress', run: 'working', focused: true },
  { title: 'Add priorities to tasks', role: 'review · Codex', state: 'finished', run: 'done' },
  { title: 'Renew the car insurance', role: 'autonomous · OpenCode', state: 'in progress', run: 'working' },
];
const AUTHOR_PANE: PaneLine[] = [
  { kind: 'you', text: 'Work the task «Add priorities to tasks»' },
  { kind: 'tool', text: 'Bash(pnpm test) — 17 passed' },
  { kind: 'tool', text: 'Bash(myclaw review)' },
  { kind: 'say', text: 'Codex found two things. Fixing the index first.' },
];
const REVIEW_PANE: PaneLine[] = [
  { kind: 'you', text: 'Review the uncommitted changes' },
  { kind: 'tool', text: 'git diff' },
  { kind: 'say', text: '2 findings: no index on status; a migration without a default.' },
];

const TALK = [
  { verb: 'review', what: 'the other vendor reads my diff before every commit' },
  { verb: 'consult', what: 'a second opinion on a plan — read-only' },
  { verb: 'delegate', what: 'hand over a frozen spec, keep the judgement' },
];

export const AnyAgentSlide: SlideDefinition = {
  id: 'improve-any-agent',
  title: (
    <>
      Not only Claude Code <span className="ww-llm__titlesub">— and they talk</span>
    </>
  ),
  maxRevealStages: 2,
  initialRevealStage: 1,
  content: ({ revealStage }) => (
    <>
      <CornerRings corner="bottom-left" />
      <div className="ww-imp">
        <div className="ww-imp__fleet">
          <Herdr status={['inbox: 3', 'in work: 2', 'Codex 7d 3%']} spaces={FLEET_SPACES} agents={FLEET_AGENTS}>
            <HPane lines={AUTHOR_PANE} />
            <HPane lines={REVIEW_PANE} />
          </Herdr>
          <div className="ww-imp__fleetside">
            <code className="ww-imp__call">herdr agent start --kind …</code>
            <div className="ww-imp__kinds">
              {['claude', 'codex', 'opencode', 'cursor', 'gemini', 'copilot', '+18'].map((kind) => (
                <span key={kind} className="ww-imp__kind">
                  {kind}
                </span>
              ))}
            </div>
            <div className="ww-imp__free">
              codex and opencode also run <strong>OpenRouter</strong> models — the{' '}
              <strong>free</strong> ones included
            </div>
            <Reveal at={2} stage={revealStage}>
              <div className="ww-imp__talk">
                {TALK.map((item) => (
                  <div key={item.verb} className="ww-imp__talkrow">
                    <code>{item.verb}</code>
                    <span>{item.what}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
        <Ledger fixed={[...PROBLEMS]} />
      </div>
    </>
  ),
  notes:
    'Sixth — a bonus we did not ask for. The daemon does not care WHAT it starts in the pane. '
    + 'herdr knows two dozen agent CLIs — Claude Code, Codex, OpenCode, Cursor, Gemini, Copilot '
    + 'and so on — and starting another one is the same line with another --kind. No additional '
    + 'effort: a task is assigned to an agent, the daemon starts that agent. I run three kinds '
    + 'every day; when one vendor is out of credits, the queue keeps moving on the others. '
    + 'And the model does not have to come from a subscription at all: Codex and OpenCode can be '
    + 'pointed at OpenRouter, which also lists free models — so the cheap, boring tasks can run on '
    + 'a model that costs nothing. '
    + 'Click — and once they sit in neighbouring panes, we can teach them to talk to one another. '
    + 'Three verbs. Review: before every commit, an agent of the OTHER vendor reads the diff — an '
    + 'author and a reviewer that share a model share their blind spots. Consult: a second '
    + 'opinion on a plan, read-only. Delegate: one writes the spec and keeps the judgement, the '
    + 'other does the typing. '
    + 'And look at the foot of the slide: all four are green. '
    + 'Honest about the picture: the window is drawn after my real herdr — spaces named after '
    + 'tasks, an agent list with roles — but these panes are staged; the commands are the real ones.',
};
