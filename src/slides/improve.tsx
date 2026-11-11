import { ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';
import { CornerRings, Reveal } from '../components/wawtech';
import { MapWindow } from './AssistantSessionSlide';

/**
 * «How do we improve it?» — six slides that answer the four «not so great»
 * beats of the session slide before them, and say so: every slide carries the
 * same LEDGER at its foot — the four problems as pills, grey while open,
 * magenta while this slide is working on one, mint once it is fixed. By the
 * last slide all four are mint, which is the answer to «does it cover them?».
 *
 * Yarik's outline (12.11.2026), drawn from what juggernaut actually is — the
 * project is aliased «myclaw» throughout the deck. The interfaces are
 * RECREATIONS for the stage (tasks, sums and names are illustrative), but the
 * mechanics are read off the code, not memory:
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

type Status = 'doing' | 'todo' | 'you' | 'done';
const STATUS_LABEL: Record<Status, string> = {
  doing: 'in progress',
  todo: 'to do',
  you: 'needs you',
  done: 'done',
};
const TASKS: { status: Status; title: string; who: string; high?: boolean }[] = [
  { status: 'doing', title: 'Pay the water bill', who: 'claude', high: true },
  { status: 'you', title: 'Plan: move photos off the old NAS', who: 'you' },
  { status: 'todo', title: 'Renew the car insurance', who: 'codex' },
  { status: 'todo', title: 'Find a dentist slot next week', who: 'claude' },
  { status: 'done', title: 'Fix a typo in the README', who: 'claude' },
  { status: 'done', title: 'Add priorities to tasks', who: 'claude' },
];

function TaskRow({ task, selected = false }: { task: (typeof TASKS)[number]; selected?: boolean }) {
  return (
    <div className={`ww-imp__row${selected ? ' ww-imp__row--selected' : ''}`}>
      <span className={`ww-imp__dot ww-imp__dot--${task.status}`} />
      <span className={`ww-imp__rowtitle${task.status === 'done' ? ' ww-imp__rowtitle--done' : ''}`}>
        {task.title}
      </span>
      {task.high && <span className="ww-imp__high">high</span>}
      <span className={`ww-imp__who ww-imp__who--${task.who}`}>{task.who}</span>
    </div>
  );
}

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
          <div className="ww-imp__board">
            <div className="ww-imp__list">
              <div className="ww-imp__filters">
                <span className="ww-imp__filter ww-imp__filter--on">Actual</span>
                <span className="ww-imp__filter">Parked</span>
                <span className="ww-imp__filter">Closed</span>
                <span className="ww-imp__new">+ New task</span>
              </div>
              {TASKS.map((task, i) => (
                <TaskRow key={task.title} task={task} selected={revealStage >= 2 && i === 0} />
              ))}
            </div>
            <Reveal at={2} stage={revealStage}>
              <div className="ww-imp__detail">
                <div className="ww-imp__detailtitle">Pay the water bill</div>
                <div className="ww-imp__meta">
                  <span className="ww-imp__dot ww-imp__dot--doing" /> {STATUS_LABEL.doing} · high · claude
                </div>
                <div className="ww-imp__comment ww-imp__comment--you">
                  <span className="ww-imp__author">you</span>
                  Pay the water bill on Friday.
                </div>
                <div className="ww-imp__comment">
                  <span className="ww-imp__author">claude</span>
                  On it: 412.80 UAH, due on the 20th. Paying on Friday.
                  <span className="ww-imp__chips">
                    <span className="ww-imp__chip">water-bill.jpg</span>
                    <span className="ww-imp__chip">session · 3 min</span>
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
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

const ROUNDS: { side: 'agent' | 'you'; status: string; who: string; text: string }[] = [
  { side: 'agent', status: 'in progress', who: 'you', text: 'Pay the water bill on Friday.' },
  { side: 'you', status: 'needs you', who: 'claude', text: 'Two cards on file. Utilities or main?' },
  { side: 'agent', status: 'in progress', who: 'you', text: 'Utilities.' },
  { side: 'you', status: 'needs you', who: 'claude', text: 'Paid 412.80 UAH. Receipt attached — close it?' },
];

export const AttentionQueueSlide: SlideDefinition = {
  id: 'improve-queue',
  title: 'Two queues: one for agents, one for me',
  maxRevealStages: ROUNDS.length,
  initialRevealStage: 1,
  content: ({ revealStage }) => {
    const stage = Math.min(Math.max(revealStage, 1), ROUNDS.length);
    const round = ROUNDS[stage - 1];
    return (
      <>
        <CornerRings corner="bottom-left" />
        <div className="ww-imp">
          <div className="ww-imp__queues">
            <div className="ww-imp__queue">
              <span className="ww-imp__queuename">Agent queue</span>
              <span className="ww-imp__queuehint">picked up by the loop</span>
              <div className="ww-imp__ghost">Renew the car insurance</div>
              <div className="ww-imp__ghost">Find a dentist slot</div>
            </div>
            <div className="ww-imp__lane">
              <span className={`ww-imp__hop${round.side === 'you' ? ' ww-imp__hop--on' : ''}`}>
                it reports →
              </span>
              <span className={`ww-imp__hop${round.side === 'agent' && stage > 1 ? ' ww-imp__hop--on' : ''}`}>
                ← my answer hands it back
              </span>
            </div>
            <div className="ww-imp__queue ww-imp__queue--you">
              <span className="ww-imp__queuename">My queue</span>
              <span className="ww-imp__queuehint">one by one, when I have a minute</span>
              <div className="ww-imp__ghost">Approve the plan: photo migration</div>
              <div className="ww-imp__ghost">Dentist: Tue 9:00 or Thu 17:30?</div>
            </div>
            {/* the one task we follow: it crosses over on every click */}
            <div className={`ww-imp__ticket ww-imp__ticket--${round.side}`}>
              <div className="ww-imp__tickethead">
                <span>Pay the water bill</span>
                <span className={`ww-imp__state ww-imp__state--${round.side}`}>{round.status}</span>
              </div>
              <div className="ww-imp__thread">
                {ROUNDS.slice(0, stage).map((r, i) => (
                  <div key={i} className={`ww-imp__line${i === stage - 1 ? ' ww-imp__line--new' : ''}`}>
                    <span className="ww-imp__author">{r.who}</span>
                    {r.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
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

const PLACES = [
  { name: 'Zelena', where: '600 m past the bridge', slots: ['19:00', '20:30'] },
  { name: 'Awning & Co', where: 'on the corner', slots: ['19:30'] },
  { name: 'Verde', where: 'by the pharmacy', slots: ['18:30', '21:00'] },
];

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
        <Browser url="myclaw.app/tasks/book-a-table">
          <div className="ww-imp__task">
            <div className="ww-imp__detailtitle">Book a table at the place with the green awning</div>
            {revealStage < 2 ? (
              <div className="ww-imp__comment ww-imp__wall" key="text">
                <span className="ww-imp__author">claude</span>
                I found three places that match. 1) Zelena — 600 m past the second bridge, on the left,
                tables at 19:00 and 20:30. 2) Awning & Co — on the corner across from the first pharmacy,
                one table at 19:30. 3) Verde — next to the other pharmacy, 18:30 or 21:00. Reply with the
                number of the place and the time, and I will book it.
              </div>
            ) : (
              <div className="ww-imp__artifact" key="artifact">
                <span className="ww-imp__artifacttag">
                  artifact · <code>set_task_artifact(task_id, html_wide, html_narrow)</code>
                </span>
                <div className="ww-imp__artifactmap">
                  <MapWindow search="green awning" pins={3} />
                </div>
                <div className="ww-imp__places">
                  {PLACES.map((place, i) => (
                    <div key={place.name} className="ww-imp__place">
                      <span className="ww-imp__placename">
                        <span className="ww-imp__pinno">{i + 1}</span>
                        {place.name}
                      </span>
                      <span className="ww-imp__placewhere">{place.where}</span>
                      <span className="ww-imp__slots">
                        {place.slots.map((slot) => (
                          <span key={slot} className="ww-imp__slot">
                            {slot}
                          </span>
                        ))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Browser>
        <Ledger now={['chat-only UX']} />
      </div>
    </>
  ),
  notes:
    'Third — the word from the title: ARTIFACTS. Remember the place past the second bridge with '
    + 'the green awning. With a task queue the agent can find it — and answers like this: three '
    + 'places, in a paragraph, reply with a number and a time. That is still chat. '
    + 'Click. So we allow the agent to put into a task not only text but dynamic HTML it '
    + 'generates for THIS case: a map with the three pins, and the free tables as buttons. One '
    + 'tap. Nobody designed a «restaurant booking» feature; the agent decided what the most '
    + 'convenient UX for this answer is, and wrote it. '
    + 'Mechanically it is one tool call: set_task_artifact with the HTML in two versions, wide '
    + 'and narrow, and the task page renders it at the very top. Next task, a different UI: a '
    + 'table to tick, a chart, a form with three fields. '
    + 'Honest about the picture: this booking artifact is staged for the talk.',
};

/* ─── 4 · …and stable pages ───────────────────────────────────────────────── */

type Tile = { name: string; figure: string; note: string; viz: 'spark' | 'bars' | 'dots' | 'meter' };
const TILES: Tile[] = [
  { name: 'Money', figure: '+2.4%', note: 'net worth, this month', viz: 'spark' },
  { name: 'Smart home', figure: '21.5°', note: '3 lights on · power: on', viz: 'dots' },
  { name: 'Movies', figure: '4 picks', note: 'recommended for tonight', viz: 'bars' },
  { name: 'Books & songs', figure: 'top 10', note: 'my own ratings', viz: 'bars' },
  { name: 'Nanny', figure: '32 h', note: 'this week · to pay Friday', viz: 'meter' },
  { name: 'Coffee', figure: '2 bags', note: 'left · reorder in 9 days', viz: 'dots' },
  { name: 'Threat alerts', figure: 'medium', note: 'tonight, by weapon class', viz: 'bars' },
  { name: 'Sleep', figure: '7 h 12 m', note: 'last night · forecast 23:40', viz: 'spark' },
];

function Viz({ kind, seed }: { kind: Tile['viz']; seed: number }) {
  if (kind === 'spark') {
    const points = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `${i * 20},${34 - ((i * 7 + seed * 5) % 13) - i * 2}`);
    return (
      <svg className="ww-imp__viz" viewBox="0 0 140 40" aria-hidden="true">
        <polyline className="ww-imp__spark" points={points.join(' ')} />
      </svg>
    );
  }
  if (kind === 'bars') {
    return (
      <span className="ww-imp__viz ww-imp__bars" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span key={i} style={{ height: `${30 + ((i * 37 + seed * 23) % 70)}%` }} />
        ))}
      </span>
    );
  }
  if (kind === 'dots') {
    return (
      <span className="ww-imp__viz ww-imp__dots" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={(i + seed) % 3 === 0 ? undefined : 'ww-imp__dots--on'} />
        ))}
      </span>
    );
  }
  return (
    <span className="ww-imp__viz ww-imp__meter" aria-hidden="true">
      <span style={{ width: '64%' }} />
    </span>
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
        <div className="ww-imp__tiles">
          {TILES.map((tile, i) => (
            <div key={tile.name} className="ww-imp__tile" style={{ animationDelay: `${i * 70}ms` }}>
              <span className="ww-imp__tilename">{tile.name}</span>
              <span className="ww-imp__tilefigure">{tile.figure}</span>
              <Viz kind={tile.viz} seed={i} />
              <span className="ww-imp__tilenote">{tile.note}</span>
            </div>
          ))}
        </div>
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
    + 'Honest about the picture: tiles with illustrative numbers, not my real ones.',
};

/* ─── 5 · The runner: plain code, a pane per task ─────────────────────────── */

type Pane = { name: string; legend: string; task: string; lines: string[] };

/** A herdr window, drawn after the real one: spaces and agents on the left,
 *  bordered panes with their agent in the legend. */
function Herdr({ panes, highlight }: { panes: Pane[]; highlight?: 'legend' }) {
  return (
    <div className="ww-imp__herdr">
      <div className="ww-imp__side">
        <span className="ww-imp__sidehead">agents</span>
        {panes.map((pane) => (
          <span key={pane.name} className="ww-imp__agent">
            <span className="ww-imp__agentdot" />
            {pane.name}
          </span>
        ))}
      </div>
      <div className="ww-imp__panes">
        {panes.map((pane) => (
          <div key={pane.name} className="ww-imp__pane">
            <span className={`ww-imp__legend${highlight === 'legend' ? ' ww-imp__legend--hot' : ''}`}>
              {pane.legend}
            </span>
            <div className="ww-imp__panetask">&gt; {pane.task}</div>
            {pane.lines.map((line) => (
              <div key={line} className="ww-imp__paneline">
                <span className="ww-imp__panebullet">⏺</span> {line}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const RUNNER_PANES: Pane[] = [
  {
    name: 'jg-7f3a',
    legend: 'claude · opus · high',
    task: 'Plan: move photos off the NAS',
    lines: ['Read(docs/storage.md)', 'Comparing three paths…'],
  },
  {
    name: 'jg-5d1e',
    legend: 'claude · haiku · low',
    task: 'Fix a typo in the README',
    lines: ['Update(README.md)', 'Done — closing the task.'],
  },
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
 *  more than 3 points above → only high is served. The two figures are illustrative. */
const PACE = { used: 62, elapsed: 58 };

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
            <Reveal at={4} stage={revealStage}>
              <div className="ww-imp__pace">
                <span className="ww-imp__pacehead">
                  <span>weekly limit</span>
                  <span className="ww-imp__paceverdict">
                    +{PACE.used - PACE.elapsed}% above pace → only high priority
                  </span>
                </span>
                <span className="ww-imp__pacebar">
                  <span className="ww-imp__paceused" style={{ width: `${PACE.used}%` }} />
                  <span className="ww-imp__pacenow" style={{ left: `${PACE.elapsed}%` }} />
                </span>
                <span className="ww-imp__pacelegend">
                  <span>{PACE.used}% used</span>
                  <span>{PACE.elapsed}% of the week gone</span>
                </span>
              </div>
            </Reveal>
            </div>
            <Herdr
              panes={stage >= 2 ? RUNNER_PANES : []}
              highlight={stage === 3 ? 'legend' : undefined}
            />
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
    + 'Honest about the code: it is the idea in ten lines. The real one, `juggernaut start`, is '
    + 'about five thousand, because it also heartbeats, reaps dead panes, uploads the transcript '
    + 'and survives a sleeping laptop. The server resolves the model — task override, then the '
    + 'agent\'s default, then a built-in — and hands the daemon two finished strings.',
};

/* ─── 6 · Any agent — and they talk ───────────────────────────────────────── */

const FLEET_PANES: Pane[] = [
  {
    name: 'jg-7f3a',
    legend: 'claude',
    task: 'Add priorities to tasks',
    lines: ['Bash(pnpm test) — 17 passed', 'Bash(juggernaut review)'],
  },
  {
    name: 'rv-myclaw',
    legend: 'codex · reviewer',
    task: '/review the uncommitted diff',
    lines: ['2 findings · no index on status…'],
  },
  {
    name: 'jg-b81c',
    legend: 'opencode · openrouter · free',
    task: 'Renew the car insurance',
    lines: ['Comparing three quotes…'],
  },
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
          <Herdr panes={FLEET_PANES} />
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
    + 'Honest about the picture: the three panes are staged; the commands are the real ones.',
};
