import { ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';
import { ROUTES, RouteMap } from './RouteMap';
import { useClock } from './BootstrapSlide';
import { useAnimating } from '../components/frameSettled';
import dashLight from '../assets/assistant/dash-light.jpg';
import herdrLogo from '../assets/herdr/logo.svg';
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
 * beats of the session slide before them, and say so in their headline: the
 * session slide's verdict line turned over, «✓ fixed …». (The LEDGER of problem
 * pills that every slide carried at its foot was taken off on 16.11.2026.)
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

/** The board and the artifact are two slides now, with the architecture between them
 *  (Yarik, 16.11.2026): `stage` 1–2 is the web UI for the tasks, 3 the agent's artifact. */
function BoardFrame({ revealStage }: { revealStage: number }) {
  return (
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
  );
}

export const TaskBoardSlide: SlideDefinition = {
  id: 'improve-board',
  maxRevealStages: 2,
  initialRevealStage: 1,
  content: ({ revealStage }) => <BoardFrame revealStage={revealStage} />,
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
    'the files it made, and the task comes back to me, on top of my queue. ',
};

export const ArtifactSlide: SlideDefinition = {
  id: 'improve-artifact',
  content: () => <BoardFrame revealStage={3} />,
  notes:
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
/** `sub` is a tool's result line (⎿), `plain` unbulleted output, `banner` Claude
 *  Code's start screen (text = the model line), `box` its empty composer, `ask` a
 *  prompt as Codex prints it (›). */
type PaneLine = { kind: 'you' | 'tool' | 'say' | 'dim' | 'sub' | 'plain' | 'banner' | 'box' | 'ask'; text: string };

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
  big = false,
  home = false,
  cols = false,
  children,
}: {
  status: string[];
  spaces: Space[];
  agents: Agent[];
  hotModel?: boolean;
  /** drawn larger, with a narrower sidebar: the walk-through, where it is read line by line */
  big?: boolean;
  /** the runner's own space is the focused one */
  home?: boolean;
  /** the panes stand side by side (a split to the right), not one above the other */
  cols?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={big ? 'ww-hd ww-hd--big' : 'ww-hd'}>
      <div className="ww-hd__side">
        <span className="ww-hd__head">spaces</span>
        <span className={home ? 'ww-hd__space ww-hd__space--on' : 'ww-hd__space'}>
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
                <span className={hotModel ? 'ww-hd__model ww-hd__model--hot' : 'ww-hd__model'}>
                  {agent.state ? ' · ' : ''}
                  {agent.model}
                </span>
              )}
            </span>
          </span>
        ))}
        {/* herdr's own mark, from its repository (assets/logo.svg) — Yarik, 16.11.2026 */}
        <span className="ww-hd__brand">
          <img src={herdrLogo} alt="" />
          herdr
        </span>
      </div>
      <div className="ww-hd__main">
        <span className="ww-hd__tabs">
          <span className="ww-hd__tab">1</span>
          <span>+</span>
        </span>
        <div className={cols ? 'ww-hd__panes ww-hd__panes--cols' : 'ww-hd__panes'}>{children}</div>
      </div>
    </div>
  );
}

function HPane({ lines }: { lines: PaneLine[] }) {
  return (
    <div className="ww-hd__pane">
      {lines.map((line, i) => {
        if (line.kind === 'banner')
          return (
            <span key={i} className="ww-hd__line ww-hd__banner">
              <span className="ww-hd__mascot">{' ▐▛███▛█ \n▝▜██████▀\n ▝▝   ▝▝ '}</span>
              <span>
                Claude Code v2.1{'\n'}
                <span className="ww-hd__line--dim">
                  {line.text}
                  {'\n'}~/src · /rc
                </span>
              </span>
            </span>
          );
        if (line.kind === 'box')
          return (
            <span key={i} className="ww-hd__line ww-hd__box">
              <span className="ww-hd__boxin">❯</span>
              <span className="ww-hd__line--dim">  ⏵⏵ auto mode on</span>
            </span>
          );
        return (
          <span key={i} className={`ww-hd__line ww-hd__line--${line.kind}`}>
            {line.kind === 'you' && <span className="ww-hd__caret">❯ </span>}
            {line.kind === 'ask' && <span className="ww-hd__caret">› </span>}
            {(line.kind === 'tool' || line.kind === 'say') && <span className="ww-hd__bullet">⏺ </span>}
            {line.kind === 'sub' && ' ⎿ '}
            {line.text}
          </span>
        );
      })}
    </div>
  );
}

/** The loop, as code. `run` is not
 *  awaited — every task works in its own pane while the loop keeps polling. The whole
 *  life of a task is here (Yarik, 16.11.2026): a pane, an agent, the prompt that starts
 *  it, the wait for it to finish, the session log (Claude Code's own .jsonl transcript)
 *  sent to the server. The herdr verbs are its real ones: workspace create · agent
 *  start / prompt / wait. */
const RUNNER_CODE: { text: string }[] = [
  { text: 'while (true) {' },
  { text: "  task = await fetch('/api/tasks/next')" },
  { text: '  if (task) run(task)' },
  { text: '  await sleep(60_000)' },
  { text: '}' },
  { text: '' },
  { text: 'async function run(task) {' },
  { text: "  herdr('workspace create')" },
  { text: "  herdr('agent start', task.agent," },
  { text: "    '--model', task.model," },
  { text: "    '--effort', task.effort)" },
  { text: "  herdr('agent prompt', task.prompt)" },
  { text: "  await herdr('agent wait')" },
  { text: "  upload(task, 'session.jsonl')" },
  { text: '} ' },
];

/**
 * Frame 1: the code runs, line by line, for one real task, and the terminal shows
 * what each line did (Yarik, 16.11.2026: «покажемо анімацією покроково що робить
 * кожен рядок коду для реальної задачі і відповідно що відбувається на ui»).
 * Each step lights the line(s) of RUNNER_CODE it stands on; everything the terminal
 * shows is derived from the step's number, so the export (the clock at its end)
 * lands on the last step with the whole story on screen.
 */
const WALK_MS = 2400;
/** The tasks the walk-through runs. The first is followed line by line; the next two
 *  arrive faster and make the title's point — a model, an effort and an agent per task
 *  (Yarik, 16.11.2026: «продовж анімацію ще декількома задачами, кожна з яких
 *  використовує різні моделі, а деякі — codex»). Which model goes with which task
 *  follows the routing table the real system files tasks by (its create-task skill):
 *  complex agentic work → opus · medium; a trivial action → sonnet · medium; image
 *  generation is Codex's lane, simple agentic work → gpt-6-luna · high. `open`/`start`/`prompt`/`done` are the
 *  steps at which the space, the agent, its first prompt and its last word appear. */
type WalkTask = {
  title: string;
  tool: 'Claude Code' | 'Codex';
  /** as the queue names it in the runner's log */
  pick: string;
  model: string;
  /** the shell line `agent start` types into the pane */
  cmd: string;
  /** the model line of the agent's start screen */
  banner: string;
  /** its closing message */
  said: string;
  open: number;
  start: number;
  prompt: number;
  done: number;
};
const WALK_TASKS: WalkTask[] = [
  {
    title: 'Book the car service',
    tool: 'Claude Code',
    pick: 'claude · opus · medium',
    model: 'opus · medium',
    cmd: '$ claude --remote-control --model opus --effort medium',
    banner: 'Opus 5.5 · medium',
    said: 'The car service is booked; the report is on the task.',
    open: 2,
    start: 3,
    prompt: 4,
    done: 8,
  },
  {
    title: 'Put the service in the calendar',
    tool: 'Claude Code',
    pick: 'claude · sonnet · medium',
    model: 'sonnet · medium',
    cmd: '$ claude --remote-control --model sonnet --effort medium',
    banner: 'Sonnet 5.5 · medium',
    said: 'It is in the calendar; the report is on the task.',
    open: 11,
    start: 11,
    prompt: 11,
    done: 13,
  },
  {
    title: 'Draw a cover for the playlist',
    tool: 'Codex',
    pick: 'codex · gpt-6-luna · high',
    model: 'gpt-6-luna · high',
    cmd: '$ codex -m gpt-6-luna -c model_reasoning_effort="high"',
    banner: 'gpt-6-luna',
    said: 'The cover is on the playlist; the report is on the task.',
    open: 13,
    start: 13,
    prompt: 13,
    done: 14,
  },
];
/** The lines of RUNNER_CODE each step stands on. The walk opens on a poll that
 *  finds a task: the empty queue is another slide's subject (Yarik, 16.11.2026). */
const WALK: number[][] = [
  [1], // 0 · the poll: a task
  [2], // 1 · run(task), not awaited
  [7], // 2 · a space of its own
  [8, 9, 10], // 3 · the agent, its model and effort
  [11], // 4 · the prompt starts the work
  [12], // 5 · wait: the agent works…
  [12], // 6
  [12], // 7
  [12], // 8 · …and finishes
  [13], // 9 · the session log goes to the server
  [1, 2], // 10 · the next task: another model
  [7, 8, 9, 10, 11], // 11
  [1, 2], // 12 · and one for another agent
  [7, 8, 9, 10, 11], // 13
  [12, 13], // 14 · all three done
];
/** Which pane is focused at each step: -1 the runner's own, else a task's. */
const WALK_FOCUS = [-1, -1, 0, 0, 0, 0, 0, 0, 0, -1, -1, 1, -1, 2, 2];

function RunnerWalk() {
  const t = useClock(0);
  const all = t >= Number.MAX_SAFE_INTEGER;
  const last = WALK.length - 1;
  // one pass, a pause on the last step, then again
  const step = all ? last : Math.min(Math.floor(t / WALK_MS) % (WALK.length + 2), last);
  useAnimating(!all && t < WALK.length * WALK_MS);

  const focus = WALK_FOCUS[step];
  const runOf = (task: WalkTask): Run => (step >= task.done ? 'done' : step >= task.prompt ? 'working' : 'idle');
  const open = WALK_TASKS.filter((task) => step >= task.open);
  const working = open.filter((task) => runOf(task) === 'working').length;
  const queued = step <= 1 || step === 10 || step === 12;
  // Both panes are a real night session, shortened (Yarik, 16.11.2026: «має виглядати
  // як спрощена версія реальної сесії» — Claude Code's UI, the commands herdr runs,
  // the session log). Read off a finished pane with `herdr pane read`, 16.11.2026:
  // the shell line `agent start` types, the agent's start screen, the runner's first
  // prompt (firstPrompt in the real runner — its first sentence, without the id), the
  // skill loading, the collapsed «Called … N times» lines, the closing message, the
  // «✻ … for» line and the empty composer. The runner's log names its real herdr calls
  // and the transcript it uploads. The product is «myclaw» on every slide.
  const at = (from: number, ...lines: PaneLine[]): PaneLine[] => (step >= from ? lines : []);
  const picked = (from: number, task: WalkTask): PaneLine[] =>
    at(
      from,
      { kind: 'dim', text: 'GET /api/tasks/next' },
      { kind: 'plain', text: `  «${task.title}»` },
      { kind: 'dim', text: `  ${task.pick}` },
    );
  const ran = (from: number, task: WalkTask): PaneLine[] =>
    at(
      from,
      { kind: 'dim', text: 'herdr workspace create' },
      { kind: 'dim', text: `herdr agent start --kind ${task.tool === 'Codex' ? 'codex' : 'claude'}` },
      { kind: 'dim', text: 'herdr agent prompt' },
    );
  const daemon: PaneLine[] = [
    { kind: 'plain', text: '$ myclaw start' },
    ...picked(0, WALK_TASKS[0]),
    ...ran(9, WALK_TASKS[0]),
    ...at(
      9,
      { kind: 'dim', text: 'herdr agent wait → idle' },
      { kind: 'plain', text: 'PUT session.jsonl.gz' },
      { kind: 'plain', text: '  transcript uploaded ✓' },
    ),
    ...picked(10, WALK_TASKS[1]),
    ...ran(12, WALK_TASKS[1]),
    ...picked(12, WALK_TASKS[2]),
  ];
  const paneOf = (task: WalkTask): PaneLine[] => {
    const prompt: PaneLine = {
      kind: 'you',
      text: `Follow the "myclaw:do-task" skill to do task ("${task.title}") end to end.`,
    };
    if (task.tool === 'Codex')
      return [
        { kind: 'dim', text: task.cmd },
        { kind: 'plain', text: '>_ OpenAI Codex' },
        { kind: 'dim', text: `   model: ${task.banner}` },
        { kind: 'dim', text: '   directory: ~/src' },
        ...at(task.prompt, prompt),
        ...at(task.done, { kind: 'say', text: task.said }),
      ];
    return [
      ...at(task.start, { kind: 'dim', text: task.cmd }, { kind: 'banner', text: task.banner }),
      ...at(task.prompt, prompt),
      ...at(
        task.prompt + 1,
        { kind: 'tool', text: 'Skill(myclaw:do-task)' },
        { kind: 'sub', text: 'Successfully loaded skill' },
      ),
      ...at(task.prompt + 2, { kind: 'plain', text: '  Called myclaw 2 times' }),
      ...at(task.prompt + 3, { kind: 'plain', text: '  Read 1 file, ran 2 commands' }),
      ...at(
        task.done,
        { kind: 'say', text: task.said },
        { kind: 'dim', text: '✻ Cogitated for 4m 12s' },
      ),
      ...at(task.start, { kind: 'box', text: '' }),
    ];
  };
  const state = { idle: 'idle', working: 'working', done: 'finished' };
  return (
    <>
      {/* no title band: the same «✓ fixed» verdict line as the board slide. It names what
          the walk is showing: first a task gets a pane and a context of its own, then —
          from the second task on — a model of its own (Yarik, 16.11.2026) */}
      <div className="ww-asst__claim ww-asst__claim--great">
        <span className="ww-asst__verdict">
          <span aria-hidden="true">✓</span>
          fixed
        </span>
        <span key={step >= 10 ? 'models' : 'context'}>
          {step >= 10 ? 'different models/agents for different types of tasks' : 'fresh context for each task'}
        </span>
      </div>
    <div className="ww-imp__runner ww-imp__runner--full">
      <div className="ww-imp__runnerleft">
        <RunnerCode hot={(i) => WALK[step].includes(i)} />
      </div>
      <div className="ww-imp__runnerright">
        <Herdr
          status={[queued ? 'queue: 1' : `in work: ${working}`]}
          spaces={open.map((task, i) => ({ name: task.title, state: runOf(task), focused: focus === i }))}
          agents={open
            .filter((task) => step >= task.start)
            .map((task, i) => ({
              title: task.title,
              role: `${task.tool} · ${state[runOf(task)]}`,
              state: '',
              run: runOf(task),
              focused: focus === i,
              model: task.model,
            }))}
          hotModel={step === 3 || step >= 11}
          big
          home={focus < 0}
        >
          <HPane key={focus} lines={focus < 0 ? daemon : paneOf(WALK_TASKS[focus])} />
        </Herdr>
      </div>
    </div>
    </>
  );
}

function RunnerCode({
  hot,
  code = RUNNER_CODE,
}: {
  hot: (index: number) => boolean;
  code?: { text: string }[];
}) {
  return (
    <pre className="ww-imp__code">
      {code.map((line, i) => (
        <span key={line.text} className={hot(i) ? 'ww-imp__codeline--hot' : undefined}>
          {line.text}
          {'\n'}
        </span>
      ))}
    </pre>
  );
}

/** The pace rule, as the server applies it when the daemon asks for the next task
 *  (juggernaut apps/api/src/services/tasks.ts): utilization of the 7-day window minus
 *  the share of the window already elapsed. Above pace → low-priority work waits;
 *  more than 3 points above → only high is served. The two figures are illustrative;
 *  the card is the app's own, off its Agents page: the week's usage as a line against
 *  the dotted diagonal of an even pace. */
/** One week of the subscription, played tick by tick (Yarik, 16.11.2026: «після кожної
 *  задачі додається витрата, якщо ми понад норму то видача задач зупиняється»). Every
 *  tick is a poll: under the even pace the server hands out a task and its cost lands on
 *  the chart; above it the poll comes back empty until the week catches up. The numbers
 *  are illustrative. */
const PACE_MS = 900;
/** how much of the week one tick is, in % */
const PACE_TICK = 4;
// eight tasks that add up to exactly the week's limit: the walk ends at the reset with
// all of it used and none of it early
const PACE_TASKS: [string, number][] = [
  ['Book the car service', 12], ['Sort the photo archive', 17], ['Put the service in the calendar', 9],
  ['Plan the weekend trip', 15], ['Draw a cover for the playlist', 13], ['Renew the insurance', 18],
  ['Summarise the building chat', 8], ['Compare the internet plans', 8],
];
type PaceTick = { elapsed: number; before: number; used: number; task?: [string, number]; left: number; end?: boolean };
const PACE_TICKS: PaceTick[] = (() => {
  const ticks: PaceTick[] = [];
  let used = 0;
  let next = 0;
  // a task costs three or four ticks of the week, so every one is followed by a run of
  // empty polls until the week catches up
  for (let i = 1; i <= 25; i += 1) {
    const elapsed = i * PACE_TICK;
    const before = used;
    // the rule: a task goes out only while the usage is not ahead of the week
    const task = used <= elapsed ? PACE_TASKS[next] : undefined;
    if (task) {
      used += task[1];
      next += 1;
    }
    ticks.push({ elapsed, before, used, task, left: PACE_TASKS.length - next, end: elapsed >= 100 });
  }
  return ticks;
})();

function PaceWalk() {
  const t = useClock(0);
  const all = t >= Number.MAX_SAFE_INTEGER;
  const last = PACE_TICKS.length - 1;
  const step = all ? last : Math.min(Math.floor(t / PACE_MS) % (PACE_TICKS.length + 4), last);
  useAnimating(!all && t < PACE_TICKS.length * PACE_MS);

  const seen = PACE_TICKS.slice(0, step + 1);
  const now = PACE_TICKS[step];
  const hold = !now.task;
  const over = now.used - now.elapsed;
  const x = (v: number) => 20 + v * 5.6;
  const y = (v: number) => 150 - v * 1.3;
  // a stair: flat while the week goes by, a jump where a task's cost lands
  const line = seen.map((tick) => `H${x(tick.elapsed)} V${y(tick.used)}`).join(' ');
  const log = seen.slice(-5).flatMap((tick): PaneLine[] => [
    { kind: 'dim', text: 'GET /api/tasks/next' },
    tick.task
      ? { kind: 'plain', text: `  «${tick.task[0]}» · +${tick.task[1]}%` }
      : { kind: 'plain', text: tick.end ? '  week over · the limit resets' : '  204 · no task · above pace' },
  ]);
  // no code on this one: the loop is known by now. herdr in one column, the chart in the other (Yarik, 16.11.2026)
  return (
    <div className="ww-imp__runner ww-imp__runner--full ww-imp__runner--pace">
      <div className="ww-imp__runnerright">
        <Herdr
          status={[`queue: ${now.left}`, now.end ? 'week over · reset' : hold ? 'on hold · above pace' : 'in work: 1', `Claude 7d ${now.used}%`]}
          spaces={now.task ? [{ name: now.task[0], state: 'working' }] : []}
          agents={
            now.task
              ? [{ title: now.task[0], role: 'autonomous · Claude Code', state: 'in progress', run: 'working' }]
              : []
          }
          home
        >
          <HPane lines={log} />
        </Herdr>
      </div>
      {/* the web app's own usage card, in a column of its own: what the server looks at */}
      <div className="ww-imp__runnerright">
        <div className="ww-jg ww-jg--pacecol">
          <div className="ww-jg__pace">
            <span className="ww-jg__pacehead">
              <span className="ww-jg__panelname">Anthropic personal</span>
              <span className="ww-jg__label">used {now.used}%</span>
              <span className={over > 0 ? 'ww-jg__label ww-jg__label--danger' : 'ww-jg__label'}>
                {over > 0 ? `+${over}% above pace` : over < 0 ? `${-over}% under pace` : 'on pace'}
              </span>
              <span className="ww-jg__label">week {now.elapsed}% gone</span>
            </span>
            <svg className="ww-jg__pacechart" viewBox="0 0 600 160" preserveAspectRatio="none" aria-hidden="true">
              <path className="ww-jg__paceeven" d={`M${x(0)} ${y(0)} L${x(100)} ${y(100)}`} />
              <path className="ww-jg__paceline" d={`M${x(0)} ${y(0)} ${line}`} />
              <path className="ww-jg__pacenow" d={`M${x(now.elapsed)} ${y(0)} L${x(now.elapsed)} ${y(now.used)}`} />
            </svg>
            <span className={hold && !now.end ? 'ww-jg__paceverdict' : 'ww-jg__paceverdict ww-jg__paceverdict--ok'}>
              {/* a served tick shows the usage AFTER the task, so it says what was just added */}
              {now.end ? 'the week is over → all of it used, none early' : hold ? 'above pace → the queue holds' : `task served → +${now.task?.[1]}% used`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The empty queue, on the same code and the same herdr window as the runner walk:
 *  the loop asks, gets nothing, sleeps — and no model is involved in any of it. Only the
 *  poll that returns a task opens an agent (Yarik, 16.11.2026: «слайд на основі 91 який
 *  покаже що пофіксили проблему з тим що пуста черга витрачає гроші»). It answers the
 *  session slide's claim «Every tick costs tokens — empty queue or not». */
const IDLE_MS = 1100;
/** how many polls come back empty before one brings a task */
const IDLE_POLLS = 5;
/** the lines of RUNNER_CODE one round of the loop stands on: ask, check, sleep */
const IDLE_ROUND = [1, 2, 3];

function IdleWalk() {
  const t = useClock(0);
  const all = t >= Number.MAX_SAFE_INTEGER;
  // the empty rounds, then: the poll that finds a task, run(task), the agent starts
  const last = IDLE_POLLS * IDLE_ROUND.length + 2;
  const step = all ? last : Math.min(Math.floor(t / IDLE_MS) % (last + 5), last);
  useAnimating(!all && t < (last + 1) * IDLE_MS);

  const round = Math.min(Math.floor(step / IDLE_ROUND.length), IDLE_POLLS);
  const found = round === IDLE_POLLS;
  const started = step >= last;
  const hot = found ? (started ? [7, 8, 9, 10, 11] : [step === last - 2 ? 1 : 2]) : [IDLE_ROUND[step % IDLE_ROUND.length]];
  const task = WALK_TASKS[0];
  const at = (n: number) => `03:0${n}`;
  const polls = Array.from({ length: Math.min(round + 1, IDLE_POLLS) }, (_, n): PaneLine[] => [
    { kind: 'dim', text: `${at(n)}  GET /api/tasks/next` },
    { kind: 'plain', text: '       204 · no task · 0 tokens' },
  ]).flat();
  const got: PaneLine[] = found
    ? [
        { kind: 'dim', text: `${at(IDLE_POLLS)}  GET /api/tasks/next` },
        { kind: 'plain', text: `       «${task.title}»` },
        { kind: 'dim', text: `       ${task.pick}` },
      ]
    : [];
  const daemon: PaneLine[] = [{ kind: 'plain' as const, text: '$ myclaw start' }, ...polls, ...got].slice(-11);
  return (
    <>
      <div className="ww-asst__claim ww-asst__claim--great">
        <span className="ww-asst__verdict">
          <span aria-hidden="true">✓</span>
          fixed
        </span>
        <span>an empty queue costs nothing</span>
      </div>
      <div className="ww-imp__runner ww-imp__runner--full">
        <div className="ww-imp__runnerleft">
          <RunnerCode hot={(i) => hot.includes(i)} />
        </div>
        <div className="ww-imp__runnerright">
          <Herdr
            status={[found ? 'queue: 1' : 'queue: 0', started ? 'agents: 1' : 'agents: 0 · tokens: 0']}
            spaces={started ? [{ name: task.title, state: 'working', focused: false }] : []}
            agents={
              started
                ? [{ title: task.title, role: `${task.tool} · working`, state: '', run: 'working', focused: false, model: task.model }]
                : []
            }
            big
            home
          >
            <HPane lines={daemon} />
          </Herdr>
        </div>
      </div>
    </>
  );
}

export const IdleSlide: SlideDefinition = {
  id: 'improve-idle',
  content: () => (
    <>
      <CornerRings corner="top-right" />
      <div className="ww-imp ww-imp--claim">
        <IdleWalk />
      </div>
    </>
  ),
  notes:
    'And the last of the three: the empty queue. With /loop every tick was a model turn — it '
    + 'woke up, read the context, asked «is there work?», and I paid for that whether or not '
    + 'there was any. Now look at the same code. The poll is an HTTP call. It comes back empty, '
    + 'the if does nothing, the loop sleeps a minute. No pane, no agent, no tokens — all night if '
    + 'need be. Only when a task does come back does the daemon open a pane and start a model, '
    + 'and that is the first token spent.',
};

/** Free models, with no code walk and no terminal (Yarik, 16.11.2026: «давай без кода і
 *  панелі, просто як налаштувати кодекс і твій вердикт по моделям які ми тестували»).
 *  Left: what it takes to point Codex at OpenRouter — one provider block and three flags
 *  (the real runner passes the same settings as `-c` overrides and reads the key through a
 *  command; `web_search="disabled"` is needed because OpenRouter rejects Codex's built-in
 *  web-search tool). Right: every free model trialled on Codex, 16.10–14.11.2026, with
 *  the grade it got — off the free-model-trial skill's ledger, one small agentic task
 *  each (locate / fix / table). */
const FREE_SETUP: { text: string }[] = [
  { text: '# ~/.codex/config.toml' },
  { text: '[model_providers.openrouter]' },
  { text: 'name = "OpenRouter"' },
  { text: 'base_url = "https://openrouter.ai/api/v1"' },
  { text: 'wire_api = "responses"' },
  { text: 'env_key = "OPENROUTER_API_KEY"' },
  { text: '' },
  { text: '# any vendor/model:free' },
  { text: '$ codex -c model_provider="openrouter" \\' },
  { text: '    -c web_search="disabled" \\' },
  { text: '    -m nvidia/nemotron-3.5-super-vl:free' },
];
type Grade = 'good' | 'ok' | 'bad';
const FREE_GRADES: [string, Grade][] = [
  ['nemotron-3.5-super-vl', 'good'],
  ['minimax-m3.1-flash', 'good'],
  ['crouton-alpha', 'good'],
  ['nemotron-3-nano-omni', 'good'],
  ['inkling-2-small', 'good'],
  ['ernie-5.5-flash-preview', 'good'],
  ['ling-3.2-flash', 'good'],
  ['nemotron-3.5-lightning', 'ok'],
  ['dots-3-note-preview', 'bad'],
  ['particle-1', 'bad'],
  ['north-mini-code', 'bad'],
];
const GRADE_MARK: Record<Grade, string> = { good: '✓', ok: '~', bad: '✕' };

export const FreeModelsSlide: SlideDefinition = {
  id: 'improve-free',
  content: () => (
    <>
      <CornerRings corner="top-right" />
      <div className="ww-imp ww-imp--claim">
        <div className="ww-asst__claim ww-asst__claim--great">
          <span className="ww-asst__verdict">
            <span aria-hidden="true">✓</span>
            bonus
          </span>
          <span>free OpenRouter models, on the same Codex</span>
        </div>
        <div className="ww-imp__runner ww-imp__runner--full ww-imp__runner--free">
          <div className="ww-imp__runnerleft">
            <RunnerCode code={FREE_SETUP} hot={() => false} />
          </div>
          <div className="ww-imp__grades">
            {FREE_GRADES.map(([model, grade]) => (
              <div key={model} className={`ww-imp__grade ww-imp__grade--${grade}`}>
                <span className="ww-imp__grademark">
                  <span aria-hidden="true">{GRADE_MARK[grade]}</span>
                  {grade}
                </span>
                <span>{model}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  ),
  notes:
    'And when the subscription is above pace, or the task is not worth it, there are models that '
    + 'cost nothing. OpenRouter lists free variants of new models, and Codex can talk to any '
    + 'provider. On the left is all the setup: one provider block in the config, and three flags '
    + 'on launch — the provider, web search off, because OpenRouter rejects that tool, and the '
    + 'model. My daemon passes the same thing per task, so the other panes stay on the '
    + 'subscription. '
    + 'On the right is what I found. Every new free model gets one small task with a known '
    + 'answer — find a function, fix one bug, build a table. Eleven models on Codex in a month: '
    + 'seven did it cleanly, most in under a minute. One was right but sloppy. Three failed — and '
    + 'look why: not wrong answers, broken rules. They wrote outside their folder, or tried to '
    + 'commit. So my verdict: good for small chores where I can check the result, not for real '
    + 'tickets — the one time I gave a free model a real one, it did not converge.',
};

export const RunnerSlide: SlideDefinition = {
  id: 'improve-runner',
  content: () => (
    <>
      <CornerRings corner="top-right" />
      <div className="ww-imp ww-imp--claim">
        <RunnerWalk />
      </div>
    </>
  ),
  notes:
    'The three problems left, and one move takes all of them. We drop /loop. Instead a daemon '
    + 'runs the cycle, and the cycle is just plain code — a while loop. It uses herdr, a terminal '
    + 'multiplexer for agents: it can open a pane, start an agent in it, prompt it, and tell '
    + 'whether it is working. '
    + 'Frame 1 plays by itself — follow the highlighted line. The poll is an HTTP call: no model '
    + 'is involved in asking «is there work?». A task comes back, and run() is not awaited, so '
    + 'the loop keeps polling. herdr opens a space for the task — a fresh context, nothing left '
    + 'over from the previous eleven. It starts the agent the task names, with the model and the '
    + 'effort the task names. It sends the prompt — follow the do-task skill. It waits until the '
    + 'agent is done, and uploads the session log to the server. '
    + 'Then two more tasks arrive, and that is the point of the headline: booking the car '
    + 'service is complex agentic work — Opus, medium effort. Putting it in the calendar is '
    + 'trivial — Sonnet. And a cover for a playlist is image generation, which goes to Codex. '
    + 'I can set the model on the task; an agent filing a task picks it from a table. '
    + 'And what we lose from the «great» list: nothing. Each pane IS Claude Code — every feature '
    + 'it ships still arrives for free, and the panes start with remote control on, so the phone '
    + 'still works. '
    + 'Honest about the picture: the terminal is a shortened real session — the prompt and the '
    + 'herdr calls are the real ones, the tasks are staged; the model beside each agent is the '
    + 'deck\'s addition, the real sidebar does not print it. The real daemon, `myclaw start`, is about five thousand lines, '
    + 'because it also heartbeats, reaps dead panes and survives a sleeping laptop.',
};

/* ─── 6 · Any agent — and they talk ───────────────────────────────────────── */

/**
 * Codex's pane, drawn after Codex's own TUI rather than with Claude Code's marks
 * (Yarik, 16.11.2026: «щось кодекс не дуже реалістично виглядає»): the start screen
 * in a box with the labels dim and the values bright, each prompt on a grey row with
 * the slash command coloured, each answer under a small grey dot with a finding's
 * priority coloured and its text hanging under it, then the empty composer and the
 * status line with the model and the folder.
 */
function CodexPane({ step }: { step: number }) {
  const ask = (from: number, text: ReactNode) =>
    step >= from && (
      <div className="ww-cx__row ww-cx__in ww-cx__ask">
        <span className="ww-cx__dim">›</span>
        <span>{text}</span>
      </div>
    );
  const answer = (from: number, body: ReactNode) =>
    step >= from && (
      <div className="ww-cx__row ww-cx__in">
        <span className="ww-cx__dot" />
        <span className="ww-cx__answer">{body}</span>
      </div>
    );
  const finding = (priority: 'p1' | 'p2', text: string) => (
    <span className="ww-cx__finding">
      <span>-</span>
      <span>
        <span className={`ww-cx__${priority}`}>[{priority.toUpperCase()}]</span> {text}
      </span>
    </span>
  );
  return (
    <div className="ww-hd__pane ww-cx">
      {step >= 2 && (
      <div className="ww-cx__box">
        <span>
          <span className="ww-cx__dim">&gt;_ </span>
          <strong>OpenAI Codex</strong>
        </span>
        <span>
          <span className="ww-cx__dim">model: </span>gpt-6-sol high
        </span>
        <span>
          <span className="ww-cx__dim">directory: </span>~/src/myclaw
        </span>
      </div>
      )}
      {ask(
        3,
        <>
          <span className="ww-cx__cmd">/review</span> review the uncommitted changes in ~/src/myclaw. Context from
          the author: added tasks.priority …
        </>,
      )}
      {answer(
        4,
        <>
          <strong>Review comment:</strong>
          {finding('p1', 'No index on tasks.priority — 0042_priority.sql:7: the board sorts by it on every load')}
          {finding('p2', 'Migration has no default — 0042_priority.sql:3: existing rows fail NOT NULL')}
        </>,
      )}
      {ask(7, 'P2: line 3 has no NOT NULL, the column is nullable. Answer in writing. If you now agree the finding does not hold, say so plainly …')}
      {answer(8, <>Agreed: P2 does not hold, priority is nullable. P1 stands.</>)}
      {ask(10, 'Re-review. Since your last verdict I changed: added the index. Re-check only what changed …')}
      {answer(11, <strong>No findings.</strong>)}
      {step >= 2 && (
        <>
          <div className="ww-cx__row ww-cx__ask ww-cx__prompt">
            <span className="ww-cx__dim">›</span>
          </div>
          <span className="ww-cx__status">gpt-6-sol high · ~/src/myclaw</span>
        </>
      )}
    </div>
  );
}

const REVIEW_TASK = 'Add priorities to tasks';
/**
 * Agents talking to one another ABOUT a review — not one question and one answer but
 * the whole exchange the development process asks for (its «adversarial review»
 * step, read 16.11.2026): the author treats the findings as advice, checks each
 * against the code, accepts one, argues the other in writing (`review ask`), and
 * after the fix asks the SAME reviewer to look again, until it returns no findings —
 * only then the commit. The layout is the «Claude Strangelove» deck's «Рецепт 5:
 * авторев'ю» (two panes side by side, the author on the left); the three prompts are
 * the real ones, shortened (kickoff, ask, re-review); the task and its findings are
 * staged. The product is «myclaw» here, as everywhere in the deck.
 */
const REVIEW_STEPS = 13;
/** When the reviewer is thinking, and from when it has answered. */
const REVIEWER_BUSY = [3, 7, 10];

function ReviewWalk() {
  const t = useClock(0);
  const all = t >= Number.MAX_SAFE_INTEGER;
  const last = REVIEW_STEPS - 1;
  const step = all ? last : Math.min(Math.floor(t / WALK_MS) % (REVIEW_STEPS + 2), last);
  useAnimating(!all && t < REVIEW_STEPS * WALK_MS);

  const at = (from: number, ...lines: PaneLine[]): PaneLine[] => (step >= from ? lines : []);
  const reviewer: Run = REVIEWER_BUSY.includes(step) ? 'working' : step >= 4 ? 'done' : 'idle';
  // The author drives the reviewer with herdr's own commands, one per turn of the
  // conversation (Yarik, 16.11.2026: «замість myclaw review використовуй herdr команди
  // напряму») — the same calls the review command makes for it.
  const author: PaneLine[] = [
    { kind: 'tool', text: 'Bash(pnpm lint && pnpm test)' },
    { kind: 'sub', text: '✔ 0 problems · 17 passed' },
    ...at(1, { kind: 'tool', text: 'Bash(herdr pane split --direction right)' }, { kind: 'sub', text: 'pane w1:p2' }),
    ...at(
      2,
      { kind: 'tool', text: 'Bash(herdr agent start rv-tasks --kind codex)' },
      { kind: 'sub', text: 'rv-tasks ready · gpt-6-sol high' },
    ),
    ...at(3, { kind: 'tool', text: 'Bash(herdr agent prompt rv-tasks "/review …" --wait)' }),
    ...at(
      5,
      { kind: 'sub', text: '2 findings' },
      { kind: 'dim', text: '    [P1] 0042_priority.sql:7 · no index' },
      { kind: 'dim', text: '    [P2] 0042_priority.sql:3 · no default' },
    ),
    ...at(
      6,
      { kind: 'say', text: 'P1 is real. P2 is not: the column is nullable.' },
      { kind: 'tool', text: 'Bash(herdr agent prompt rv-tasks "P2: line 3 has no NOT NULL …" --wait)' },
    ),
    ...at(8, { kind: 'sub', text: 'P2 withdrawn · P1 stands' }),
    ...at(
      9,
      { kind: 'tool', text: 'Update(0042_priority.sql)' },
      { kind: 'sub', text: 'Added 1 line' },
      { kind: 'tool', text: 'Bash(herdr agent prompt rv-tasks "Re-review … added the index" --wait)' },
    ),
    ...at(11, { kind: 'sub', text: 'no findings' }),
    ...at(12, { kind: 'tool', text: 'Bash(git commit -m "Add priorities to tasks")' }),
    { kind: 'box', text: '' },
  ];
  const state = { idle: 'idle', working: 'working', done: 'done' };
  return (
    <div className="ww-imp__runner ww-imp__runner--full ww-imp__runner--solo">
      <div className="ww-imp__runnerright">
        <Herdr
          status={['in work: 1']}
          spaces={[{ name: REVIEW_TASK, state: 'working', focused: true }]}
          agents={[
            {
              title: REVIEW_TASK,
              role: 'Claude Code · working',
              state: '',
              run: 'working',
              focused: reviewer !== 'working',
            },
            ...(step >= 2
              ? [
                  {
                    title: 'rv-tasks',
                    role: `Codex · ${state[reviewer]}`,
                    state: '',
                    run: reviewer,
                    focused: reviewer === 'working',
                  },
                ]
              : []),
          ]}
          big
          cols
        >
          <HPane lines={author} />
          {step >= 1 && <CodexPane step={step} />}
        </Herdr>
      </div>
    </div>
  );
}

export const AnyAgentSlide: SlideDefinition = {
  id: 'improve-any-agent',
  content: () => (
    <>
      <CornerRings corner="bottom-left" />
      <div className="ww-imp ww-imp--claim">
        <div className="ww-asst__claim ww-asst__claim--great">
          <span className="ww-asst__verdict">
            <span aria-hidden="true">✓</span>
            bonus
          </span>
          <span>agents of different vendors argue over a review</span>
        </div>
        <ReviewWalk />
      </div>
    </>
  ),
  notes:
    'A bonus we did not ask for. The daemon does not care WHAT it starts in the pane — and once '
    + 'agents can open panes themselves, they can talk to one another. One case, the one I use '
    + 'on every commit: the review. On the left is the author, Claude Code. Lint and tests pass, '
    + 'and it drives herdr itself: split the pane, start an agent of the OTHER vendor in it — '
    + 'Codex — and prompt it with the diff, waiting for the answer. Two findings come back, each with a '
    + 'priority. Now the part that makes it a conversation. A review is advice, not an edit '
    + 'script: the author checks each finding against the code. The first is real. The second is '
    + 'not — the column is nullable — so it says so, in writing, with another prompt. Codex answers: '
    + 'agreed, the second does not hold, the first stands. The author fixes the first and asks '
    + 'the SAME reviewer to look again — it still has the whole argument in its context. No '
    + 'findings. Only then the commit. Why the other vendor: an author and a reviewer that share '
    + 'a model share their blind spots. The same mechanism gives two more verbs — consult, a '
    + 'second opinion on a plan, and delegate, hand over a frozen spec. '
    + 'Honest about the picture: the three prompts are the real ones, shortened; the task and '
    + 'its findings are staged.',
};

/* ─── The queue paces the work ────────────────────────────────────────────── */

/** Stood as the runner slide's last frame until 16.11.2026; Yarik moved it after the
 *  slide where the agents review one another. Same picture: the poll is the line that
 *  matters, and the web app's own usage card is held over the terminal. */
export const PaceSlide: SlideDefinition = {
  id: 'improve-pace',
  content: () => (
    <>
      <CornerRings corner="top-right" />
      <div className="ww-imp ww-imp--claim">
        <div className="ww-asst__claim ww-asst__claim--great">
          <span className="ww-asst__verdict">
            <span aria-hidden="true">✓</span>
            bonus
          </span>
          <span>the queue paces the work to the subscription</span>
        </div>
        <PaceWalk />
      </div>
    </>
  ),
  notes:
    'One more thing the queue can do once it, and not the agent, decides what runs next: it '
    + 'paces the work to my subscription. Watch the chart: the dotted line is an even week, the '
    + 'red one is what I have used. Every task that finishes adds its cost. While the red line '
    + 'is not above the dotted one, the next poll gets a task. The moment it is above — the poll '
    + 'comes back empty, same as an empty queue, and the daemon just sleeps until the week '
    + 'catches up. So the limit lasts the week and none of it is left unused at the reset: the '
    + 'best utilization of a subscription I am paying for anyway. '
    + 'Honest about the picture: the usage card is the app\'s own, with illustrative numbers, and '
    + 'the real rule is softer — above pace it still serves high-priority tasks.',
};
