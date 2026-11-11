import { useEffect, useRef, useState } from 'react';
import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';
import { useAnimating } from '../components/frameSettled';
import { Line, Played, Row, played, useClock } from './BootstrapSlide';

/**
 * «Our barebones AI assistant is ready» — the ledger of the Loops arc, PLAYED
 * instead of listed: one Claude Code session, seven clicks. The first three are
 * what you get for free (you talk to it, it reads a photo, you carry on from
 * the phone); the last four are what it costs (the
 * context fills and compacts, every tick is paid for, the model is fixed, and
 * chat is the wrong tool for a place on a map).
 *
 * Yarik's own script (12.11.2026). The session is a reconstruction for the
 * stage — ids, sums and the bill are illustrative — but every line the CLI
 * prints BY ITSELF is read off the installed binary (2.1.322), not memory:
 *   «[Image #1]» · «/remote-control is active · Continue here, on your phone,
 *   or at <url>» · «Context low (N% remaining) · Run /compact to compact &
 *   continue» · «Compacting conversation…» · «Conversation compacted» ·
 *   «Claude resuming /loop wakeup (<when>)».
 * Two things are stage devices and NOT the CLI: the «three hours later» line,
 * and the status line (model · context · cost) — Claude Code draws whatever
 * your own `statusLine` command prints, and this is one such command's output.
 * The phone is drawn after the session view at claude.ai/code (the mobile app's
 * web twin, read live) — not a capture of the app itself.
 */

const EXPORT_MODE =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('export') === '1';

const API = 'myclaw-api.up.railway.app';
const TYPO_ID = '5d1e07b2';
/** The one model the whole loop runs on — the name to swap when the line-up moves. */
const MODEL = 'Opus 5.5';
/** An illustrative step, not a measurement: the sum only has to GROW on every tick. */
const TICK_COST = 0.22;
/** How long the file takes to travel from Finder to the prompt. */
const DRAG_MS = 1900;
const REMOTE_URL = 'https://claude.ai/code/session_01Hq7…';

/** What a line does to the status line, and when. */
type Fx = { ctx?: number; cost?: number; at?: 'start' | 'done'; over?: number };
type Beat = Line & {
  fx?: Fx;
  /** Typed on the phone: it lands in the terminal whole, once sent. */
  phone?: boolean;
  /** Still being written: it stays in the prompt box and is never sent. */
  draft?: boolean;
  /** Written in the prompt box and sent when finished — and its first `box` characters
   *  are there at once, the way a dropped file lands as «[Image #1]» in one piece. */
  box?: number;
  /** Time passing with nothing printed (the drag itself). */
  silent?: boolean;
};

type Prop = 'recipe' | 'bill' | 'phone' | 'ctx' | 'cost' | 'model' | 'map';
type Step = { great: boolean; claim: string; prop: Prop; lines: Beat[] };

const tick = (when: string, cost: number): Beat[] => [
  { kind: 'you', text: '', fired: when },
  {
    kind: 'tool',
    text: `Bash(curl -s '${API}/api/tasks?status=todo')`,
    result: '[]',
    ms: 700,
    fx: { cost, at: 'done', over: 500 },
  },
];

const STEPS: Step[] = [
  {
    great: true,
    claim: 'Open Claude Code and just talk to it',
    prop: 'recipe',
    lines: [
      { kind: 'you', text: 'morning. what is in my queue?' },
      {
        kind: 'tool',
        text: `Bash(curl -s '${API}/api/tasks?status=todo')`,
        result: '[]',
        ms: 700,
      },
      {
        kind: 'say',
        text: 'Good morning. The queue is empty — nothing is waiting on me. What do you need?',
        fx: { ctx: 4, cost: 0.06, at: 'done' },
      },
    ],
  },
  {
    great: true,
    claim: 'It reads images, out of the box',
    prop: 'bill',
    lines: [
      // the drag: the file leaves Finder and lands on the prompt (see `.ww-asst__ghost`)
      { kind: 'note', text: '', ms: DRAG_MS, silent: true },
      { kind: 'you', text: '[Image #1] how much is this, and when is it due?', box: '[Image #1] '.length },
      {
        kind: 'say',
        text: 'A water bill for October: 412.80 UAH, due on 20 November.',
        fx: { ctx: 6, cost: 0.14, at: 'done' },
      },
    ],
  },
  {
    great: true,
    claim: 'Walk away and carry on from your phone',
    prop: 'phone',
    lines: [
      { kind: 'you', text: '/remote-control' },
      {
        kind: 'note',
        text: `/remote-control is active · Continue here, on your phone, or at ${REMOTE_URL}`,
        ms: 900,
      },
      { kind: 'you', text: 'I am out. Can it wait until Friday?', phone: true },
      {
        kind: 'say',
        text: 'Yes — it is due on the 20th, so Friday is fine.',
        fx: { ctx: 7, cost: 0.19, at: 'done' },
      },
    ],
  },
  {
    great: false,
    claim: 'The context fills up — and compaction forgets',
    prop: 'ctx',
    lines: [
      {
        kind: 'note',
        text: '· · · three hours and eleven tasks later · · ·',
        ms: 2600,
        fx: { ctx: 93, cost: 4.58, at: 'start', over: 2600 },
      },
      { kind: 'note', tone: 'error', text: 'Context low (7% remaining) · Run /compact to compact & continue', ms: 900 },
      {
        kind: 'note',
        busy: 'Compacting conversation…',
        text: 'Conversation compacted (ctrl+o for history)',
        ms: 2200,
        fx: { ctx: 12, cost: 4.8, at: 'done', over: 600 },
      },
      { kind: 'you', text: 'so when is that water bill due?' },
      {
        kind: 'say',
        text: 'I no longer have the bill itself — only a summary of what we said about it. Can you send the photo again?',
      },
    ],
  },
  {
    great: false,
    claim: 'Every tick costs tokens — empty queue or not',
    prop: 'cost',
    lines: [
      ...tick('2:10pm', 4.8 + TICK_COST),
      ...tick('2:20pm', 4.8 + 2 * TICK_COST),
      ...tick('2:30pm', 4.8 + 3 * TICK_COST),
    ],
  },
  {
    great: false,
    claim: 'One model for every task',
    prop: 'model',
    lines: [
      { kind: 'you', text: '', fired: '2:40pm' },
      {
        kind: 'tool',
        text: `Bash(curl -s '${API}/api/tasks?status=todo')`,
        result: `[{"id":"${TYPO_ID}","title":"Fix a typo in the README"}]`,
        ms: 700,
      },
      { kind: 'tool', text: 'Update(README.md)', result: 'Added 1 line, removed 1 line', ms: 900 },
      {
        kind: 'say',
        text: `Fixed the typo. ${TYPO_ID} is closed.`,
        fx: { ctx: 15, cost: 5.71, at: 'done' },
      },
    ],
  },
  {
    great: false,
    claim: 'Chat is the most generic UX — not the handiest',
    prop: 'map',
    lines: [
      {
        kind: 'you',
        draft: true,
        text:
          'book a table at that place — past the bridge, the second one, on the corner with the '
          + 'green awning, next to the pharmacy, no, the other pharmacy, across from the',
      },
    ],
  },
];

type Status = { ctx: number; cost: number; ctxOver: number; costOver: number };

/** The status line once every beat before `upTo` has played out. */
function settled(upTo: number): Status {
  const status: Status = { ctx: 2, cost: 0, ctxOver: 0, costOver: 0 };
  STEPS.slice(0, upTo).forEach((step) =>
    step.lines.forEach((line) => {
      if (line.fx?.ctx !== undefined) status.ctx = line.fx.ctx;
      if (line.fx?.cost !== undefined) status.cost = line.fx.cost;
    })
  );
  return status;
}

/** …and with the live beat's lines applied, as far as they have got. */
function statusAt(beat: number, rows: Played[]): Status {
  const status = settled(beat);
  rows.forEach((row) => {
    const fx = (row.line as Beat).fx;
    if (!fx) return;
    if (!(fx.at === 'start' ? row.started : row.done)) return;
    if (fx.ctx !== undefined) {
      status.ctx = fx.ctx;
      status.ctxOver = fx.over ?? 400;
    }
    if (fx.cost !== undefined) {
      status.cost = fx.cost;
      status.costOver = fx.over ?? 400;
    }
  });
  return status;
}

/** A number that walks to its target instead of jumping — a meter, not a label. */
function useTween(target: number, over: number): number {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    if (EXPORT_MODE || over <= 0) {
      from.current = target;
      setValue(target);
      return;
    }
    const start = performance.now();
    const origin = from.current;
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / over);
      const next = origin + (target - origin) * k;
      from.current = next;
      setValue(next);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, over]);
  return value;
}

const money = (value: number) => `$${value.toFixed(2)}`;

/* ─── The props beside the terminal: the one thing to look at this beat ──── */

/** What «barebones» means: the three parts, and nothing else. */
function Recipe() {
  return (
    <div className="ww-asst__recipe">
      <span className="ww-asst__part">Claude Code</span>
      <span className="ww-asst__plus">+</span>
      <span className="ww-asst__part">/loop</span>
      <span className="ww-asst__plus">+</span>
      <span className="ww-asst__part">a task queue</span>
    </div>
  );
}

/** The photo behind «[Image #1]» — the CLI shows only the placeholder. */
function Bill() {
  return (
    <div className="ww-asst__bill">
      <div className="ww-asst__billhead">Water · October</div>
      <div className="ww-asst__billrow">
        <span>water</span>
        <span>268.40</span>
      </div>
      <div className="ww-asst__billrow">
        <span>sewerage</span>
        <span>144.40</span>
      </div>
      <div className="ww-asst__billtotal">
        <span>to pay</span>
        <span>412.80 ₴</span>
      </div>
      <div className="ww-asst__billdue">due 20 Nov</div>
    </div>
  );
}

/** Where the photo comes from: a Finder window, the bill selected in it. The CLI
 *  shows only «[Image #1]»; this is the file behind it. */
function Finder() {
  return (
    <div className="ww-asst__finder">
      <div className="ww-asst__finderbar">
        <span className="ww-dot ww-dot--red" />
        <span className="ww-dot ww-dot--amber" />
        <span className="ww-dot ww-dot--green" />
        <span className="ww-asst__findertitle">Downloads</span>
      </div>
      <div className="ww-asst__files">
        <div className="ww-asst__file ww-asst__file--picked">
          <div className="ww-asst__thumb">
            <Bill />
          </div>
          <span className="ww-asst__filename">water-bill.jpg</span>
        </div>
        <div className="ww-asst__file">
          <div className="ww-asst__thumb ww-asst__thumb--blank" />
          <span className="ww-asst__filename">IMG_2291.jpg</span>
        </div>
      </div>
    </div>
  );
}

/**
 * The same session, in the pocket: the Claude app's view of a Remote Control
 * session, since the phone took over. Drawn after the real thing — the session
 * view at claude.ai/code, read live on 12.11.2026 (dark theme): the title on
 * top with «Remote Control» under it, MY messages as rounded bubbles on the
 * right, Claude's as plain text with no bubble, a tool call as one dim row with
 * a chevron, and a composer with «+» and a round send button in Claude's clay.
 * It is the web twin of the mobile app, not a capture of the app itself.
 */
function Phone({ rows }: { rows: Played[] }) {
  const typing = rows.find((row) => (row.line as Beat).phone && row.typing);
  const shown = rows.filter(
    (row) => row.line.kind !== 'note' && row.done && row.line.text !== '' && row.line.text !== '/remote-control'
  );
  return (
    <div className="ww-asst__phonewrap">
      <div className="ww-asst__phone">
        <div className="ww-asst__phonehead">
          <span className="ww-asst__phoneback" aria-hidden="true">‹</span>
          <span className="ww-asst__phonetitle">
            <span className="ww-asst__phonename">myclaw</span>
            <span className="ww-asst__phonetag">Remote Control</span>
          </span>
          <span className="ww-asst__phonemore" aria-hidden="true">···</span>
        </div>
        <div className="ww-asst__phonebody">
          {shown.slice(-5).map((row, i) =>
            row.line.kind === 'tool' ? (
              <div key={`${i}-${row.line.text}`} className="ww-asst__toolrow">
                <span>{row.line.text.replace(/\(.*$/, '')}</span>
                <span aria-hidden="true">›</span>
              </div>
            ) : (
              <div
                key={`${i}-${row.line.text}`}
                className={`ww-asst__bubble ww-asst__bubble--${row.line.kind === 'you' ? 'you' : 'say'}`}
              >
                {row.line.text}
              </div>
            )
          )}
        </div>
        <div className="ww-asst__composer">
          <span className="ww-asst__plus" aria-hidden="true">+</span>
          <span className="ww-asst__phoneinput">
            {typing ? typing.shown : <span className="ww-asst__placeholder">Reply to Claude</span>}
          </span>
          <span className={`ww-asst__send${typing ? ' ww-asst__send--on' : ''}`} aria-hidden="true">↑</span>
        </div>
      </div>
    </div>
  );
}

function Gauge({ label, value, note, bar }: { label: string; value: string; note: string; bar?: number }) {
  return (
    <div className="ww-asst__gauge">
      <span className="ww-asst__gaugelabel">{label}</span>
      <span className="ww-asst__gaugevalue">{value}</span>
      {bar !== undefined && (
        <span className="ww-asst__bar">
          <span className="ww-asst__barfill" style={{ width: `${Math.round(bar)}%` }} />
        </span>
      )}
      <span className="ww-asst__gaugenote">{note}</span>
    </div>
  );
}

/** One search and a tap — against the paragraph being typed on the left. Reused
 *  by the Artifacts slide, where the agent draws this very map as its answer. */
const PINS: [number, number][] = [
  [262, 300],
  [104, 262],
  [356, 398],
];
export function MapWindow({ search = 'green awning café', pins = 1 }: { search?: string; pins?: number }) {
  return (
    <div className="ww-asst__map">
      <div className="ww-asst__mapsearch">{search}</div>
      <svg className="ww-asst__mapart" viewBox="0 0 400 420" aria-hidden="true">
        <path className="ww-asst__river" d="M-20 150 C 90 110, 150 230, 250 200 S 380 110, 430 140 L 430 215 C 370 190, 330 280, 240 275 S 100 190, -20 230 Z" />
        <path className="ww-asst__road" d="M70 -10 L 110 430" />
        <path className="ww-asst__road" d="M225 -10 L 265 430" />
        <path className="ww-asst__road" d="M-10 330 L 410 290" />
        <path className="ww-asst__road ww-asst__road--minor" d="M-10 60 L 410 40" />
        <path className="ww-asst__road ww-asst__road--minor" d="M340 -10 L 360 430" />
        {PINS.slice(0, pins).map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <g className="ww-asst__pin" style={{ animationDelay: `${700 + i * 160}ms` }}>
              <path d="M0 0 C -26 -34, -30 -52, -30 -64 A 30 30 0 1 1 30 -64 C 30 -52, 26 -34, 0 0 Z" />
              {pins > 1 ? (
                <text className="ww-asst__pinno" y="-54" textAnchor="middle">
                  {i + 1}
                </text>
              ) : (
                <circle cy="-64" r="11" />
              )}
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}

function Scene({ stage }: { stage: number }) {
  const beat = stage - 1;
  const step = STEPS[beat] ?? STEPS[0];
  const t = useClock(stage);
  const live = played(step.lines, t);
  useAnimating(live.some((row) => !row.done));

  const earlier = STEPS.slice(0, beat).flatMap((s) => s.lines);
  const draft = live.find((row) => (row.line as Beat).draft);
  // a line being written in the prompt box: its dropped part is there in one piece
  const boxed = live.find((row) => (row.line as Beat).box !== undefined && row.started && !row.done);
  const inBox =
    draft?.shown
    ?? (boxed && boxed.line.text.slice(0, Math.max(boxed.shown.length, (boxed.line as Beat).box ?? 0)));
  const compacted = live.some((row) => row.line.kind === 'note' && row.line.busy !== undefined && row.done);
  const status = statusAt(beat, live);
  const ctx = useTween(status.ctx, status.ctxOver);
  const cost = useTween(status.cost, status.costOver);

  // The phone shows the conversation since it took over (beat 3 onward).
  const phoneRows: Played[] = [
    ...STEPS.slice(2, Math.max(2, beat))
      .flatMap((s) => s.lines)
      .map((line) => ({ line, shown: line.text, started: true, done: true, typing: false })),
    ...(beat >= 2 ? live : []),
  ];

  return (
    <div className="ww-asst">
      <div className={`ww-asst__claim ww-asst__claim--${step.great ? 'great' : 'not'}`} key={beat}>
        <span className="ww-asst__verdict">{step.great ? 'great' : 'not so great'}</span>
        <span>{step.claim}</span>
      </div>

      <div className="ww-asst__scene">
        <div className="ww-boot__term ww-asst__term">
          <div className="ww-boot__chrome">
            <span className="ww-dot ww-dot--red" />
            <span className="ww-dot ww-dot--amber" />
            <span className="ww-dot ww-dot--green" />
            <span className="ww-boot__title">~/src/myclaw — claude</span>
          </div>

          <div className="ww-boot__body">
            {earlier.map(
              (line, i) => !line.silent && <Row key={`p${i}`} line={line} shown={line.text} done />
            )}
            {live.map((row, i) => {
              const line = row.line as Beat;
              if (line.draft || line.silent) return null;
              // a message typed on the phone — or in the prompt box — arrives whole, when sent
              const visible = line.phone || line.box !== undefined ? row.done : row.started;
              return (
                visible && (
                  <Row key={`l${i}`} line={row.line} shown={row.shown} done={row.done} typing={row.typing} />
                )
              );
            })}
          </div>

          <div className="ww-boot__prompt">
            <div className="ww-boot__input ww-asst__input">
              <span className="ww-boot__caret">&gt;</span>
              <span className={inBox ? 'ww-asst__draft' : undefined}>
                {inBox}
                <span className="ww-boot__cursor" />
              </span>
            </div>
            <div className="ww-asst__status">
              <span>? for shortcuts</span>
              <span className="ww-asst__statusline">
                <span className={step.prop === 'model' ? 'ww-asst__hot' : undefined}>{MODEL}</span>
                {' · '}
                <span className={step.prop === 'ctx' ? 'ww-asst__hot' : undefined}>
                  {Math.round(ctx)}% context
                </span>
                {' · '}
                <span className={step.prop === 'cost' ? 'ww-asst__hot' : undefined}>{money(cost)}</span>
              </span>
            </div>
          </div>
        </div>

        {/* the file in flight, Finder → prompt; it is gone by the time «[Image #1]» lands */}
        {step.prop === 'bill' && (
          <div className="ww-asst__ghost" key={`ghost-${stage}`} aria-hidden="true">
            <Bill />
          </div>
        )}
        <div className="ww-asst__side" key={step.prop}>
          {step.prop === 'recipe' && <Recipe />}
          {step.prop === 'bill' && <Finder />}
          {step.prop === 'phone' && <Phone rows={phoneRows} />}
          {step.prop === 'ctx' && (
            <Gauge
              label="context"
              value={`${Math.round(ctx)}%`}
              bar={ctx}
              note={
                compacted
                  ? 'compacted — what it knew is now a summary'
                  : 'full of the last eleven tasks — nothing clears it between them'
              }
            />
          )}
          {step.prop === 'cost' && (
            <Gauge label="this session" value={money(cost)} note="every tick adds to it — empty queue or not" />
          )}
          {step.prop === 'model' && (
            <Gauge label="model" value={MODEL} note="for a typo and for a schema alike" />
          )}
          {step.prop === 'map' && <MapWindow />}
        </div>
      </div>
    </div>
  );
}

export const AssistantSessionSlide: SlideDefinition = {
  id: 'assistant-session',
  title: 'Our barebones AI assistant is ready',
  maxRevealStages: STEPS.length,
  initialRevealStage: 1,
  content: ({ revealStage }) => (
    <>
      <CornerRings corner="top-right" />
      <Scene stage={Math.min(Math.max(revealStage, 1), STEPS.length)} />
    </>
  ),
  notes:
    'The assistant is done, and it is barely any code: Claude Code, a loop, a task queue. Seven '
    + 'clicks, one session — three that are great, four that are not. '
    + '1 — I open Claude Code and talk to it. It is my assistant already: it knows the queue. '
    + '2 — it supports everything Claude Code supports out of the box. A photo of a bill: it '
    + 'reads it. New models the day they land, the same way. '
    + '3 — remote control: I leave the laptop and carry on from the phone, in the SAME session. '
    + 'Even greater — and I did not write a line of that. Every feature Claude Code ever ships, '
    + 'this assistant gets for free. '
    + 'Now the other four — keep them, because the rest of the talk is these. '
    + '4 — three hours later the context is full of the previous tasks, and I cannot clear it '
    + 'automatically between them. It compacts, and what it knew becomes a summary: ask about the '
    + 'bill and it has to ask for the photo again. '
    + '5 — the loop ticks every ten minutes and every tick costs tokens, even when the queue is '
    + 'empty. Watch the cost in the status line. And it gets worse as the session goes on: a tick '
    + 'sends the whole conversation again, so the bigger the context, the more an EMPTY tick '
    + 'costs. (The sum on screen is illustrative — say so if asked; I did not measure a tick.) '
    + '6 — the model in the status line is fixed. One model executes everything: a typo in a '
    + 'README runs on the biggest one. I can change it by hand; the loop cannot pick per task. '
    + '7 — and chat is the most generic UX, not the most convenient: I am stuck describing a place '
    + 'in words when opening a map and searching would take one tap. '
    + 'Honest about the replay: rebuilt for the stage — the bill, the ids and the sums are '
    + 'illustrative, the «three hours later» line is mine, and the status line is a custom one '
    + '(Claude Code draws whatever your statusLine command prints). The lines the CLI prints '
    + 'itself — image placeholder, remote-control, context low, compaction, loop wakeup — are read '
    + 'off the 2.1.322 binary. The phone is drawn after the Claude app\'s session view as claude.ai/code '
    + 'shows it — a recreation, not a capture.',
};
