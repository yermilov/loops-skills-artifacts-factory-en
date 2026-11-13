import { ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';
import { CornerRings, Reveal } from '../components/wawtech';
import { ROUTES, RouteMap } from './RouteMap';
import {
  App,
  Chip,
  Comment,
  Fields,
  Ico,
  IconName,
  STATUS,
  Status,
  StatusMark,
  Task,
  TaskBar,
  TaskCard,
  Verdict,
  Who,
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
function Browser({ url, children }: { url: string; children: ReactNode }) {
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

const CAR: Task = { title: 'Book the car service', status: 'doing', who: 'My Claude Code', high: true, age: '12m' };
const NAS: Task = { title: 'Plan: move photos off the old NAS', status: 'plan', who: '@me', age: '2h' };
const INSURANCE: Task = { title: 'Renew the car insurance', status: 'todo', who: 'My Codex CLI', age: '1d' };
const DENTIST: Task = { title: 'Find a dentist slot next week', status: 'todo', who: 'My Claude Code', age: '2d' };
const WATER: Task = { title: 'Pay the water bill', status: 'input', who: '@me', high: true, age: '3d' };
const INBOX = [CAR, NAS, INSURANCE, DENTIST, WATER];

export const TaskBoardSlide: SlideDefinition = {
  id: 'improve-board',
  title: 'First: a web UI for the tasks',
  maxRevealStages: 2,
  initialRevealStage: 1,
  content: ({ revealStage }) => (
    <>
      <CornerRings corner="top-right" />
      <div className="ww-imp">
        <Browser url="myclaw.app">
          <App active="Tasks">
            <TaskBar view="Inbox" />
            <div className="ww-jg__split">
              <div className="ww-jg__list">
                {INBOX.map((task, i) => (
                  <TaskCard key={task.title} task={task} withStatus selected={revealStage >= 2 && i === 0} />
                ))}
              </div>
              {revealStage < 2 ? (
                <div className="ww-jg__empty ww-jg__label">Select a task</div>
              ) : (
                <div className="ww-jg__detail" key="detail">
                  <span className="ww-jg__title">{CAR.title}</span>
                  <span className="ww-jg__label">ID 5d1e07b2</span>
                  <Fields
                    fields={[
                      { label: 'Status', value: 'In progress', tone: 'time' },
                      { label: 'Priority', value: 'High', tone: 'danger' },
                      { label: 'Assignee', value: 'Claude Code' },
                      { label: 'Model', value: 'Opus 5.5' },
                    ]}
                  />
                  <div className="ww-jg__timeline">
                    <Comment who="My Claude Code" tag="Session report" when="12m ago">
                      <p>
                        Booked: AutoHub Podil, Thursday 19 November, 9:40. I told them about the
                        tyre-pressure light.
                      </p>
                      <span className="ww-jg__chips">
                        <Chip>dash-light.jpg</Chip>
                        <Chip>session-5d1e07b2.jsonl</Chip>
                      </span>
                    </Comment>
                    <Comment who="@me" when="1h ago">
                      <p>Thursday morning, Podil. Mention the light.</p>
                    </Comment>
                  </div>
                </div>
              )}
            </div>
          </App>
        </Browser>
        <Ledger now={['chat-only UX']} />
      </div>
    </>
  ),
  notes:
    'How do we improve it? Four problems on the table — they stay at the foot of every slide '
    + 'from here, and we tick them off. '
    + 'First, the obvious one. Instead of creating tasks in a chat and asking the chat what is in '
    + 'the queue, I write a web UI for the tasks: I can browse them like in Jira — what is in '
    + 'progress, what is waiting, what is done, who has it. '
    + 'Click — and a task is a page, not a paragraph in a scrollback: what I asked, what the agent '
    + 'answered, the files it attached. And the session itself is attached back to the task — '
    + 'every agent run, uploaded, so three weeks later I can open what it actually did. '
    + 'It is a start on the «chat-only UX» problem — magenta, not mint yet. '
    + 'Honest about the picture: a recreation of the real board, with illustrative tasks.',
};

/* ─── 2 · A queue for the human, too ──────────────────────────────────────── */

const COLUMNS: { status: Status; cards: Task[] }[] = [
  { status: 'todo', cards: [INSURANCE, DENTIST] },
  { status: 'doing', cards: [] },
  { status: 'plan', cards: [NAS] },
  { status: 'input', cards: [] },
];

/** The one task we follow, a click at a time: where it sits, and what was just said. */
const ROUNDS: { side: 'agent' | 'you'; who: Who; text: string; proposal?: boolean }[] = [
  { side: 'agent', who: '@me', text: 'Pay the water bill on Friday.' },
  { side: 'you', who: 'My Claude Code', text: 'Two cards on file. Utilities or main?' },
  { side: 'agent', who: '@me', text: 'Utilities.' },
  { side: 'you', who: 'My Claude Code', text: 'Paid 412.80 UAH, receipt attached.', proposal: true },
];

export const AttentionQueueSlide: SlideDefinition = {
  id: 'improve-queue',
  title: 'Two queues: one for agents, one for me',
  maxRevealStages: ROUNDS.length,
  initialRevealStage: 1,
  content: ({ revealStage }) => {
    const stage = Math.min(Math.max(revealStage, 1), ROUNDS.length);
    const round = ROUNDS[stage - 1];
    const ticket: Task = {
      title: 'Pay the water bill',
      status: round.side === 'agent' ? 'doing' : 'input',
      who: round.side === 'agent' ? 'My Claude Code' : '@me',
      high: true,
      age: 'now',
    };
    return (
      <>
        <CornerRings corner="bottom-left" />
        <div className="ww-imp">
          <Browser url="myclaw.app">
            <App active="Tasks">
              <TaskBar
                view="Board"
                filters={
                  <>
                    <span className="ww-jg__filter ww-jg__filter--on">Actual</span>
                    <span className="ww-jg__filter">Done / cancelled</span>
                    <span className="ww-jg__filter ww-jg__filter--unread">Unread · 3</span>
                    <span className="ww-jg__filter">@me</span>
                  </>
                }
              />
              {/* the deck's own annotation: which columns are whose */}
              <div className="ww-jg__owners">
                <span className={round.side === 'agent' ? 'ww-jg__owner ww-jg__owner--on' : 'ww-jg__owner'}>
                  the agents' queue
                </span>
                <span className={round.side === 'you' ? 'ww-jg__owner ww-jg__owner--on' : 'ww-jg__owner'}>
                  my queue
                </span>
              </div>
              <div className="ww-jg__board">
                {COLUMNS.map((column) => (
                  <div key={column.status} className="ww-jg__column">
                    <span className="ww-jg__columnhead">
                      <StatusMark status={column.status} />
                      {STATUS[column.status]}
                    </span>
                    {column.cards.map((task) => (
                      <TaskCard key={task.title} task={task} />
                    ))}
                  </div>
                ))}
                {/* the one task we follow: it crosses over on every click */}
                <div className={`ww-jg__ticket ww-jg__ticket--${round.side}`}>
                  <TaskCard task={ticket} selected>
                    <span className="ww-jg__thread">
                      {ROUNDS.slice(0, stage).map((r, i) => (
                        <span key={i} className={`ww-jg__line${i === stage - 1 ? ' ww-jg__line--new' : ''}`}>
                          <span className={`ww-jg__label ww-jg__label--${r.who === '@me' ? 'ink' : 'agent'}`}>
                            {r.who === '@me' ? 'me' : 'claude'}
                          </span>
                          {r.text}
                        </span>
                      ))}
                      {round.proposal && <Verdict />}
                    </span>
                  </TaskCard>
                </div>
              </div>
            </App>
          </Browser>
          <Ledger now={['chat-only UX']} />
        </div>
      </>
    );
  },
  notes:
    'Second — look at the queue differently. The board is really TWO queues. The agents have '
    + 'theirs: tasks the loop picks up. And I have mine: everything that needs a human. '
    + 'Follow one task. Click — the agent gets stuck on a real question, so it does not guess and '
    + 'it does not block a terminal: it puts the task in MY queue with the question. I go through '
    + 'my queue one by one, when I have a minute — on the phone, in a lift. '
    + 'Click — I answer in a comment, and the answer itself assigns the task back to the agent '
    + 'that asked. No dragging cards around. '
    + 'Click — it executes, and puts the task back in my queue with the result. I close it. '
    + 'That is the whole protocol: the agent works, the human answers, and nobody waits on a '
    + 'blinking cursor. I am not the operator of a chat any more — I am one more worker with a '
    + 'queue.',
};

/* ─── 3 · Artifacts ───────────────────────────────────────────────────────── */

export const ArtifactsSlide: SlideDefinition = {
  id: 'improve-artifacts',
  title: (
    <>
      Artifacts: <span className="ww-llm__titlesub">the agent answers with a UI</span>
    </>
  ),
  maxRevealStages: 2,
  initialRevealStage: 1,
  content: ({ revealStage }) => (
    <>
      <CornerRings corner="top-right" />
      <div className="ww-imp">
        <Browser url="myclaw.app/tasks/8b3f61e4">
          <App active="Tasks">
            <div className="ww-jg__page">
              <span className="ww-jg__back ww-jg__label">
                <Ico name="back" />
                Back to board
              </span>
              <span className="ww-jg__title">How do I get from the service to the office?</span>
              {revealStage >= 2 && (
                <div className="ww-jg__artifact" key="artifact">
                  <span className="ww-imp__artifacttag">
                    artifact · <code>set_task_artifact(task_id, html_wide, html_narrow)</code>
                  </span>
                  <div className="ww-jg__artifactmap">
                    <RouteMap bare />
                  </div>
                  <div className="ww-jg__routes">
                    {ROUTES.map((route, i) => (
                      <div key={route.mode} className={`ww-jg__route${i === 0 ? ' ww-jg__route--on' : ''}`}>
                        <span className="ww-jg__routeno">{i + 1}</span>
                        <span className="ww-jg__routename">
                          {route.mode}
                          <span className="ww-jg__label">{route.detail}</span>
                        </span>
                        <span className="ww-jg__routetime">{route.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Fields
                fields={[
                  { label: 'Status', value: 'Needs your input', tone: 'hold' },
                  { label: 'Priority', value: 'Med' },
                  { label: 'Assignee', value: '@me' },
                  { label: 'Created', value: 'Nov 17 · 10:21' },
                ]}
              />
              {revealStage < 2 && (
                <div className="ww-jg__timeline" key="text">
                  <Comment who="My Claude Code" tag="Session report" when="2m ago">
                    <p>
                      Three ways. By metro: walk 650 m down Kyrylivska to Tarasa Shevchenka, take the blue
                      line five stops to Olimpiiska, then 300 m up Velyka Vasylkivska — 24 minutes. By taxi:
                      along the embankment, up Volodymyrskyi Descent and across Khreshchatyk — 16 minutes
                      now, closer to 30 at ten, about 190 UAH. On foot: up Andriivskyi Descent and along
                      Volodymyrska — 5.6 km, an hour and ten. I would take the metro.
                    </p>
                  </Comment>
                </div>
              )}
            </div>
          </App>
        </Browser>
        <Ledger now={['chat-only UX']} />
      </div>
    </>
  ),
  notes:
    'Third — the word from the title: ARTIFACTS. Remember the paragraph about getting from the '
    + 'service to the office. In a task it is the same paragraph: three routes, street by street. '
    + 'That is still chat. '
    + 'Click. So we allow the agent to put into a task not only text but dynamic HTML it '
    + 'generates for THIS case: the map with the three routes, and each one as a row to pick. One '
    + 'glance. Nobody designed a «directions» feature; the agent decided what the most '
    + 'convenient UX for this answer is, and wrote it. '
    + 'Mechanically it is one tool call: set_task_artifact with the HTML in two versions, wide '
    + 'and narrow, and the task page renders it at the very top. Next task, a different UI: a '
    + 'table to tick, a chart, a form with three fields. '
    + 'Honest about the picture: this booking artifact is staged for the talk.',
};

/* ─── 4 · …and stable pages ───────────────────────────────────────────────── */

/** The 21-day ribbon of the threat page: one cell a slot, coloured by what happened. */
const RIBBON = 'mmmmommmmmmmoomvmmmmmmmmommmoommmmmmvommmmmmmmomm'.split('');

function Panel({ name, icon, note, children }: { name: string; icon: IconName; note: string; children: ReactNode }) {
  return (
    <div className="ww-jg__panel">
      <span className="ww-jg__panelhead">
        <Ico name={icon} />
        <span className="ww-jg__panelname">{name}</span>
        <span className="ww-jg__label">{note}</span>
      </span>
      {children}
    </div>
  );
}

export const ArtifactPagesSlide: SlideDefinition = {
  id: 'improve-pages',
  title: (
    <>
      Artifacts that stay: <span className="ww-llm__titlesub">pages</span>
    </>
  ),
  content: () => (
    <>
      <CornerRings corner="bottom-right" />
      <div className="ww-imp">
        <Browser url="myclaw.app/coffee">
          <App active="" lit={['Coffee', 'Health', 'Movies', 'Threat forecast']}>
            <div className="ww-jg__panels">
              <Panel name="Coffee" icon="coffee" note="2 bags open">
                <div className="ww-jg__item">
                  <span className="ww-jg__swatch ww-jg__swatch--bag" aria-hidden="true" />
                  <span className="ww-jg__itemtext">
                    <span className="ww-jg__itemname">Guatemala, Nuevo Oriente</span>
                    <span className="ww-jg__label">Washed · filter · opened 12 Nov</span>
                  </span>
                </div>
                <span className="ww-jg__seg">
                  <span>Sealed</span>
                  <span className="ww-jg__seg--on">Open</span>
                  <span>Finished</span>
                </span>
                <span className="ww-jg__seg ww-jg__seg--soft">
                  <span>Love</span>
                  <span>OK</span>
                  <span className="ww-jg__seg--pick">Not really</span>
                  <span>No</span>
                </span>
              </Panel>
              <Panel name="Health" icon="health" note="today">
                {[
                  { name: 'Vitamin D', note: '2000 IU · last taken Tuesday', doses: [false] },
                  { name: 'Magnesium', note: '2 tablets · 9 h ago', doses: [true, false, false] },
                ].map((pill) => (
                  <div key={pill.name} className="ww-jg__item ww-jg__item--row">
                    <span className="ww-jg__itemtext">
                      <span className="ww-jg__itemname">{pill.name}</span>
                      <span className="ww-jg__label">{pill.note}</span>
                    </span>
                    <span className="ww-jg__doses" aria-hidden="true">
                      {pill.doses.map((taken, i) => (
                        <span key={i} className={taken ? 'ww-jg__dose ww-jg__dose--taken' : 'ww-jg__dose'} />
                      ))}
                    </span>
                  </div>
                ))}
              </Panel>
              <Panel name="Movies" icon="movies" note="watching now">
                <div className="ww-jg__item">
                  <span className="ww-jg__swatch ww-jg__swatch--poster" aria-hidden="true" />
                  <span className="ww-jg__itemtext">
                    <span className="ww-jg__itemname">Severance</span>
                    <span className="ww-jg__label">2022 · Apple TV+ · 7 of 20 left</span>
                  </span>
                </div>
                <span className="ww-jg__episode">
                  <span className="ww-jg__box" aria-hidden="true" />
                  <span className="ww-jg__label">S02E03</span>
                  Who Is Alive?
                </span>
                <span className="ww-jg__stars">
                  <span className="ww-jg__label">Would watch again</span>
                  <span aria-hidden="true">★★★★☆</span>
                </span>
              </Panel>
              <Panel name="Threat forecast" icon="alert" note="no alert · 34 min">
                <span className="ww-jg__ribbon" aria-hidden="true">
                  {RIBBON.map((cell, i) => (
                    <span key={i} className={`ww-jg__cell ww-jg__cell--${cell}`} />
                  ))}
                </span>
                <span className="ww-jg__ribbonlegend ww-jg__label">
                  <span>21 days ago</span>
                  <span>now</span>
                </span>
                <div className="ww-jg__item ww-jg__item--row">
                  <span className="ww-jg__itemtext">
                    <span className="ww-jg__itemname">Drones, the next 24 hours</span>
                    <span className="ww-jg__label">19 channels read · rated 23:52</span>
                  </span>
                  <span className="ww-jg__pill ww-jg__pill--time">Medium</span>
                </div>
              </Panel>
            </div>
          </App>
        </Browser>
        <Ledger fixed={['chat-only UX']} />
      </div>
    </>
  ),
  notes:
    'Fourth — an artifact does not have to belong to one task. The same trick gives me STABLE '
    + 'pages, each the best UX for one corner of my life, each written and kept up by the agents '
    + 'working the queue. Obviously finances. The smart home. Movie recommendations. My own '
    + 'ratings of the top books and songs. The nanny\'s hours and what to pay her on Friday. '
    + 'Coffee — how many bags are left and when to reorder. Threat alerts for tonight. Sleep. And '
    + 'a dozen more: pills, routes, shopping, a family tree. '
    + 'None of them is a chat. Every one of them started as a task. '
    + 'And that is the first problem ticked: chat is no longer the only UX — it is the one I use '
    + 'when nothing better exists yet. '
    + 'Honest about the picture: four of the pages, each cut down to one corner, drawn after the '
    + 'real ones — with invented data, because the real ones hold my real life.',
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
