import { ReactNode, useEffect, useRef, useState } from 'react';
import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';
import { useAnimating } from '../components/frameSettled';
import { GAP_MS, Line, Played, Row, played, useClock } from './BootstrapSlide';
import dashLight from '../assets/assistant/dash-light.jpg';
import { MapsWindow } from './RouteMap';

/**
 * «Our barebones AI assistant is ready» — the ledger of the Loops arc, PLAYED
 * instead of listed: one Claude Code session, eight clicks, and ONE errand
 * running through all of them — the car is due for a service. The first three
 * beats are what you get for free (you talk to it, it reads the photo of the
 * dashboard, you carry on from the phone); the rest is what it costs (chat
 * answers «how do I get there» with a paragraph where a map would do — the map
 * is its own click, over the paragraph — the model is fixed, the context fills
 * and compacts — and forgets the very photo of beat 2 — and every tick is paid
 * for).
 *
 * One errand end to end is Yarik's call (13.11.2026): the beats used to be six
 * unrelated errands, so nothing paid anything off. The session is a
 * reconstruction for the stage — ids, sums, the service and the car are
 * illustrative — but every line the CLI
 * prints BY ITSELF is read off the installed binary (2.1.322), not memory:
 *   «[Image #1]» · «/remote-control is active · Continue here, on your phone,
 *   or at <url>» · «Context low (N% remaining) · Run /compact to compact &
 *   continue» · «Compacting conversation…» · «Conversation compacted» ·
 *   «Claude resuming /loop wakeup (<when>)» · an MCP call as «<server> - <tool>(args) (MCP)»
 *   (that one re-read on 2.1.323).
 * Two things are stage devices and NOT the CLI: the fast-forwarded three hours (beat 4),
 * and the status line (model · context · cost) — Claude Code draws whatever
 * your own `statusLine` command prints, and this is one such command's output.
 * The phone is drawn after the session view at claude.ai/code (the mobile app's
 * web twin, read live) — not a capture of the app itself.
 */

const EXPORT_MODE =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('export') === '1';

const API = 'https://myclaw-api.up.railway.app';
const CAL_ID = '5d1e07b2';
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
  /** Written in the prompt box and sent when finished — and its first `box` characters
   *  are there at once, the way a dropped file lands as «[Image #1]» in one piece. */
  box?: number;
  /** Time passing with nothing printed (the drag itself). */
  silent?: boolean;
};

type Prop = 'talk' | 'photo' | 'phone' | 'ctx' | 'cost' | 'model' | 'map';
type Step = { great: boolean; claim: string; prop: Prop; lines: Beat[] };

/** The queue poll the loop makes on every tick — the one line the session repeats. */
const curl = `Bash(curl -s '${API}/api/tasks?status=todo')`;

const tick = (when: string, cost: number, ms = 700): Beat[] => [
  { kind: 'you', text: '', fired: when },
  {
    kind: 'tool',
    text: curl,
    result: '[]',
    ms,
    fx: { cost, at: 'done', over: Math.min(500, ms) },
  },
];

/** The cost beat does not end: /loop keeps waking up, every tick on an empty queue,
 *  until the speaker moves on. One tick every TICK_EVERY ms of slide time, ten minutes
 *  apart on the clock; the PDF keeps the beat's three fixed ticks. */
const TICK_EVERY = 1400;
/** The empty-queue curl, sped up to match. */
const TICK_CURL_MS = 300;
const ENDLESS_FROM = 14 * 60 + 10; // 2:10pm, in minutes
const clockAt = (minutes: number) => {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')}${h < 12 ? 'am' : 'pm'}`;
};
/** One tick plays as: wakeup (0) · gap · curl (700) · gap · silence · gap — the silence
 *  is whatever makes the whole thing exactly TICK_EVERY long. */
const TICK_PAUSE = TICK_EVERY - (3 * GAP_MS + TICK_CURL_MS);
/** Only the last few ticks are generated (and the newest rows drawn): however long the
 *  speaker talks, the work per frame stays the same. */
const ENDLESS_KEEP = 14;
const ENDLESS_ROWS = 40;
/** The ticks from `first` on, and the beat time to play them at. */
function endlessTicks(t: number, from: number): { lines: Beat[]; first: number; at: number } {
  const first = Math.max(0, Math.floor(t / TICK_EVERY) - ENDLESS_KEEP);
  const n = Math.floor(t / TICK_EVERY) + 2;
  const lines: Beat[] = [];
  for (let i = first; i < n; i++) {
    lines.push(...tick(clockAt(ENDLESS_FROM + 10 * i), from + (i + 1) * TICK_COST, TICK_CURL_MS));
    // the wait until the next wakeup: nothing printed
    lines.push({ kind: 'note', text: '', ms: TICK_PAUSE, silent: true });
  }
  return { lines, first, at: t - first * TICK_EVERY };
}
/** How many ticks the endless beat really ran — the beats after it carry on from there
 *  (later on the clock, dearer), instead of rewinding to the scripted three. */
const SCRIPTED_TICKS = 3;
let ticksRun = SCRIPTED_TICKS;

/** Three hours of the SAME errand, fast-forwarded (each line lands whole): the
 *  small print of one car service — the insurance, the quotes, the morning it
 *  eats, the tyres. Four ticks, four tasks, and every word of it stays in the
 *  context, which is the point of the beat it belongs to. */
const FF = 420;
const LATER: Beat[] = [
  { kind: 'you', text: '', fired: '10:40am', fx: { ctx: 93, cost: 4.58, at: 'start', over: 12500 } },
  { kind: 'tool', text: curl, result: '[{"id":"a41c9e03","title":"What does the insurance cover?"}]', ms: 300 },
  { kind: 'say', text: 'Casco covers the suspension, not the consumables — oil, filters and pads are yours.', ms: FF },
  { kind: 'you', text: 'and if they find something with the steering rack?', ms: FF },
  { kind: 'say', text: 'Covered, but only on a report from an approved service. AutoHub is one. a41c9e03 is closed.', ms: FF },
  { kind: 'you', text: '', fired: '11:50am' },
  { kind: 'tool', text: curl, result: '[{"id":"c7d20f11","title":"Compare the three quotes"}]', ms: 300 },
  { kind: 'say', text: 'The cheapest is 4,200 UAH less — aftermarket parts throughout, brakes included.', ms: FF },
  { kind: 'you', text: 'original for the brakes, aftermarket for the filters', ms: FF },
  { kind: 'say', text: 'That lands between the two: 11,800 UAH. c7d20f11 is closed.', ms: FF },
  { kind: 'you', text: '', fired: '12:30pm' },
  { kind: 'tool', text: curl, result: '[{"id":"e902bb5a","title":"Clear Thursday morning"}]', ms: 300 },
  { kind: 'say', text: 'The standup is at 9:30 and it clashes. Draft: «moving to 11, car service».', ms: FF },
  { kind: 'you', text: 'just move it, no explanation', ms: FF },
  { kind: 'say', text: 'Moved to 11:00, nothing in the body. e902bb5a is closed.', ms: FF },
  { kind: 'you', text: '', fired: '1:20pm' },
  { kind: 'tool', text: curl, result: '[{"id":"f1c3a8d0","title":"Winter tyres — swap at the same visit?"}]', ms: 300 },
  { kind: 'say', text: 'They can, 900 UAH, and they store the summer set until spring.', ms: FF },
  { kind: 'you', text: 'I have my own set in the garage, tell them that', ms: FF },
  { kind: 'say', text: 'Noted on the booking: own tyres, fitting only. f1c3a8d0 is closed.', ms: FF },
];

/** ONE errand, eight beats: the car is due, the dashboard is photographed, the
 *  slot is taken from the phone, the way back is a paragraph and then a map, the
 *  calendar entry runs on the biggest model there is, three hours of
 *  small print fill the context — and compaction loses the photo from beat 2. */
const CHAT_CLAIM = 'Chat is the most generic UX — not the handiest';
const STEPS: Step[] = [
  {
    great: true,
    claim: 'Open Claude Code and just talk to it',
    prop: 'talk',
    lines: [
      { kind: 'you', text: 'morning. when was the car last serviced?' },
      // who «I» is — what I drive, how often it goes in — comes from the user-information
      // skill; «Successfully loaded skill» is the CLI's own result line. WHEN comes from
      // the only API this assistant has: its own task queue, where last year's booking
      // sits closed. The queue is its memory — no endpoint here that was never built.
      {
        kind: 'tool',
        text: 'Skill(user-information)',
        result: 'Successfully loaded skill',
        ms: 600,
      },
      {
        kind: 'tool',
        text: `Bash(curl -s '${API}/api/tasks?q=service&status=done')`,
        result: '[{"id":"b7c41d02","title":"Book the car service","closedAt":"2025-09-18"}]',
        ms: 700,
      },
      {
        kind: 'say',
        text: 'September 2025 — fourteen months ago, and you service it yearly. Want me to find a slot this week?',
        fx: { ctx: 4, cost: 0.06, at: 'done' },
      },
    ],
  },
  {
    great: true,
    claim: 'It reads images, out of the box',
    prop: 'photo',
    lines: [
      // the drag: the file leaves Finder and lands on the prompt (see `.ww-asst__ghost`)
      { kind: 'note', text: '', ms: DRAG_MS, silent: true },
      { kind: 'you', text: '[Image #1] yes. and this lit up on the way home — part of the same thing?', box: '[Image #1] '.length },
      {
        kind: 'say',
        text: 'No — that is tyre pressure, not the service light. Different problem, same visit: say it when you book.',
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
      { kind: 'you', text: 'they called back — Thursday 9:40 or Friday 17:00?', phone: true },
      {
        kind: 'say',
        text: 'Thursday. On Friday you are at the station by four — the Warsaw train.',
        fx: { ctx: 7, cost: 0.19, at: 'done' },
      },
    ],
  },
  {
    great: false,
    claim: CHAT_CLAIM,
    prop: 'talk',
    lines: [
      { kind: 'you', text: 'thursday 9:40 works. how do I get from the service to the office after I drop the car?' },
      // the answer is correct, complete — and a wall: three routes that are one glance on a map
      {
        kind: 'say',
        text:
          'Three ways. By metro: walk 650 m down Kyrylivska to Tarasa Shevchenka, take the blue line '
          + 'five stops to Olimpiiska — past Kontraktova, Poshtova, Maidan and Ploshcha Ukrainskykh '
          + 'Heroiv — then 300 m up Velyka Vasylkivska: 24 minutes door to door. By taxi: along the '
          + 'embankment, up Volodymyrskyi Descent, across Khreshchatyk and down Velyka Vasylkivska — '
          + '16 minutes now, closer to 30 at ten in the morning, about 190 UAH. On foot: Kyrylivska, '
          + 'Kostiantynivska, up Andriivskyi Descent, along Volodymyrska past the Opera, then down to '
          + 'Velyka Vasylkivska — 5.6 km, an hour and ten. I would take the metro.',
        fx: { ctx: 8, cost: 0.27, at: 'done' },
      },
    ],
  },
  // the same beat, one more click: what that paragraph should have been
  { great: false, claim: CHAT_CLAIM, prop: 'map', lines: [] },
  {
    great: false,
    claim: 'One model for all tasks — no switching',
    prop: 'model',
    lines: [
      // the loop wakes up and takes the smallest task there is: one connector call. The
      // model in the status line is the same one that will read contracts and plan a week —
      // and the bill moves for a calendar entry
      { kind: 'you', text: '', fired: '10:20am' },
      {
        kind: 'tool',
        text: curl,
        result: `[{"id":"${CAL_ID}","title":"Put the service in the calendar"}]`,
        ms: 700,
      },
      // a connector, not an API of ours: the Google Calendar MCP server Claude Code already
      // has. The line's shape — «<server> - <tool>(args) (MCP)» — is the CLI's own (2.1.323)
      {
        kind: 'tool',
        text: 'claude.ai Google Calendar - create_event(summary: "Car service", start: "2026-11-19T09:40") (MCP)',
        result: '{"status":"confirmed","htmlLink":"https://calendar.google.com/…"}',
        ms: 900,
      },
      {
        kind: 'say',
        text: `In the calendar: Thursday 9:40, Car service. ${CAL_ID} is closed.`,
        fx: { ctx: 9, cost: 0.41, at: 'done', over: 900 },
      },
    ],
  },
  {
    great: false,
    claim: 'One context for all tasks — mid-task compaction',
    prop: 'ctx',
    lines: [
      // three hours of the same errand, fast-forwarded: four ticks, four tasks, and the
      // back-and-forth each one takes — every line of it stays in the context
      ...LATER,
      { kind: 'note', tone: 'error', text: 'Context low (7% remaining) · Run /compact to compact & continue', ms: 900 },
      {
        kind: 'note',
        busy: 'Compacting conversation…',
        text: 'Conversation compacted (ctrl+o for history)',
        ms: 2200,
        fx: { ctx: 12, cost: 4.8, at: 'done', over: 600 },
      },
      { kind: 'you', text: 'on that dashboard photo — was the engine light on as well?' },
      {
        kind: 'say',
        text: 'I no longer have the photo — only a note that the tyre-pressure light was on. Can you send it again?',
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
];

const COST_BEAT = STEPS.findIndex((s) => s.prop === 'cost');
const shiftClock = (label: string, minutes: number) => {
  const m = /^(\d+):(\d+)(am|pm)$/.exec(label);
  if (!m) return label;
  const h = (Number(m[1]) % 12) + (m[3] === 'pm' ? 12 : 0);
  return clockAt(h * 60 + Number(m[2]) + minutes);
};
/** A line as a beat after the endless one shows it. */
function carried(line: Beat, stepIndex: number): Beat {
  const extra = ticksRun - SCRIPTED_TICKS;
  if (stepIndex < COST_BEAT || extra <= 0) return line;
  let out = line;
  // the endless beat's own scripted ticks keep their clock (they are history), but the
  // bill they leave behind is the real one — the next beat starts from it
  if (stepIndex > COST_BEAT && out.kind === 'you' && out.fired) {
    out = { ...out, fired: shiftClock(out.fired, 10 * extra) };
  }
  if (out.fx?.cost !== undefined) out = { ...out, fx: { ...out.fx, cost: out.fx.cost + extra * TICK_COST } };
  return out;
}
const linesOf = (stepIndex: number) => STEPS[stepIndex].lines.map((line) => carried(line, stepIndex));

type Status = { ctx: number; cost: number; ctxOver: number; costOver: number };

/** The status line once every beat before `upTo` has played out. */
function settled(upTo: number): Status {
  const status: Status = { ctx: 2, cost: 0, ctxOver: 0, costOver: 0 };
  STEPS.slice(0, upTo).forEach((_, i) =>
    linesOf(i).forEach((line) => {
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
/** `initial`: where the figure stood when this beat began — a beat whose first line
 *  moves it at t = 0 still climbs from there instead of starting at the end. */
function useTween(target: number, over: number, initial = target): number {
  const [value, setValue] = useState(EXPORT_MODE ? target : initial);
  const from = useRef(EXPORT_MODE ? target : initial);
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

/**
 * The photo behind «[Image #1]»: the instrument cluster with the tyre-pressure
 * lamp lit. The CLI shows only the placeholder — this is the picture it stands
 * in for. It is a GENERATED image (gpt-image-2 via Codex, 13.11.2026), not a
 * photograph of a real car: no make, no logo, and the notes say so.
 */
function Photo() {
  return <img className="ww-asst__photo" src={dashLight} alt="" />;
}

/** Where the photo comes from: a Finder window in gallery view — the selected
 *  shot large, the rest of the folder as a strip under it. The CLI shows only
 *  «[Image #1]»; this is the file behind it. */
function Finder() {
  return (
    <div className="ww-asst__finder">
      <div className="ww-asst__finderbar">
        <span className="ww-dot ww-dot--red" />
        <span className="ww-dot ww-dot--amber" />
        <span className="ww-dot ww-dot--green" />
        <span className="ww-asst__findertitle">Downloads</span>
      </div>
      <div className="ww-asst__preview">
        <img
          className="ww-asst__photo"
          src={dashLight}
          alt="A car's instrument cluster with the amber tyre-pressure lamp lit"
        />
      </div>
      <div className="ww-asst__filename">dash-light.jpg</div>
      <div className="ww-asst__strip" aria-hidden="true">
        <span className="ww-asst__mini ww-asst__mini--picked">
          <Photo />
        </span>
        <span className="ww-asst__mini" />
        <span className="ww-asst__mini" />
        <span className="ww-asst__mini" />
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

/**
 * One figure of the status line. `hot` marks the one this beat is about; `loupe`
 * also holds a magnifying glass over it — the same text, twice the size — because
 * a status line is the smallest type on the slide and the whole beat is that
 * number. One loupe per beat: the model, then the context, then the cost.
 */
function Figure({ hot, loupe, children }: { hot: boolean; loupe: boolean; children: ReactNode }) {
  return (
    <span className={hot ? 'ww-asst__hot' : undefined}>
      {children}
      {loupe && (
        <span className="ww-asst__loupe" aria-hidden="true">
          {children}
        </span>
      )}
    </span>
  );
}

/** The beats whose point is one figure of the status line: it gets the loupe. */
const LOUPE: Prop[] = ['model', 'ctx', 'cost'];

function Scene({ stage }: { stage: number }) {
  const beat = stage - 1;
  const step = STEPS[beat] ?? STEPS[0];
  const t = useClock(stage);
  const endless = step.prop === 'cost' && !EXPORT_MODE;
  const ticks = endless ? endlessTicks(t, settled(beat).cost) : null;
  const live = ticks ? played(ticks.lines, ticks.at) : played(linesOf(Math.max(0, beat)), t);
  // an endless beat is ambient for the ready mark, like any loop
  useAnimating(!endless && live.some((row) => !row.done));
  // only rows that have arrived — never a window of rows still to come
  const drawn = endless ? live.filter((row) => row.started).slice(-ENDLESS_ROWS) : live;
  const ticksDone = ticks ? ticks.first + live.filter((row) => row.line.kind === 'tool' && row.done).length : 0;
  useEffect(() => {
    if (endless) ticksRun = Math.max(SCRIPTED_TICKS, ticksDone);
  }, [endless, ticksDone]);

  const earlier = STEPS.slice(0, beat).flatMap((_, i) => linesOf(i));
  // a line being written in the prompt box: its dropped part is there in one piece
  const boxed = live.find((row) => (row.line as Beat).box !== undefined && row.started && !row.done);
  const inBox = boxed && boxed.line.text.slice(0, Math.max(boxed.shown.length, (boxed.line as Beat).box ?? 0));
  const status = statusAt(beat, live);
  const before = settled(beat);
  const ctx = useTween(status.ctx, status.ctxOver, before.ctx);
  const cost = useTween(status.cost, status.costOver, before.cost);

  // The phone shows the conversation since it took over (beat 3 onward).
  const phoneRows: Played[] = [
    ...STEPS.slice(2, Math.max(2, beat))
      .flatMap((s) => s.lines)
      .map((line) => ({ line, shown: line.text, started: true, done: true, typing: false })),
    ...(beat >= 2 ? live : []),
  ];

  return (
    <div className="ww-asst">
      <div className={`ww-asst__claim ww-asst__claim--${step.great ? 'great' : 'not'}`} key={step.claim}>
        <span className="ww-asst__verdict">
          <span aria-hidden="true">{step.great ? '✓' : '✕'}</span>
          {step.great ? 'great' : 'not so great'}
        </span>
        <span>{step.claim}</span>
      </div>

      <div className="ww-asst__scene">
        <div className={`ww-boot__term ww-asst__term${LOUPE.includes(step.prop) ? ' ww-asst__term--loupe' : ''}`}>
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
            {drawn.map((row, i) => {
              const line = row.line as Beat;
              if (line.silent) return null;
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
                <Figure hot={step.prop === 'model'} loupe={step.prop === 'model'}>
                  {MODEL}
                </Figure>
                {' · '}
                <Figure hot={step.prop === 'ctx'} loupe={step.prop === 'ctx'}>
                  {Math.round(ctx)}% context
                </Figure>
                {' · '}
                <Figure hot={step.prop === 'cost' || step.prop === 'model'} loupe={step.prop === 'cost'}>
                  {money(cost)}
                </Figure>
              </span>
            </div>
          </div>
        </div>

        {/* the file in flight, Finder → prompt; it is gone by the time «[Image #1]» lands */}
        {step.prop === 'photo' && (
          <div className="ww-asst__ghost" key={`ghost-${stage}`} aria-hidden="true">
            <Photo />
          </div>
        )}
        {/* only real interfaces here — Finder, the phone, a map; the rest is narrated,
            and the figures that matter are already in the status line */}
        <div className={`ww-asst__side${step.prop === 'map' ? ' ww-asst__side--wide' : ''}`} key={step.prop}>
          {step.prop === 'photo' && <Finder />}
          {step.prop === 'phone' && <Phone rows={phoneRows} />}
          {step.prop === 'map' && <MapsWindow />}
        </div>
      </div>
    </div>
  );
}

export const AssistantSessionSlide: SlideDefinition = {
  id: 'assistant-session',
  // no title band: «Our barebones AI assistant is ready» is the slide BEFORE this one
  // (AssistantReadySlide), and the room goes to the terminal and to the verdict line
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
    + 'ONE session, and one errand running through all of it — my car is due for a service. '
    + 'Eight clicks: three things about it are great, four are not (the first of the four takes '
    + 'two clicks). '
    + '1 — I open Claude Code and just talk to it: when was the car last serviced? First it loads '
    + 'my user-information skill — what I drive, that I service it yearly — then asks the only API '
    + 'it has, its own task queue: last year\'s «Book the car service» sits there, closed. The '
    + 'queue is its memory — say that out loud, it comes back later. (The dates are illustrative.) '
    + '2 — it supports everything Claude Code supports out of the box. I drag the photo of the '
    + 'dashboard onto the prompt and it reads it: that lamp is tyre pressure, not the service '
    + 'light. New models the day they land, the same way. '
    + '3 — remote control: I leave the laptop, the service calls back, and I take the slot from '
    + 'the phone — in the SAME session. Even greater — and I wrote not a line of it. Every feature '
    + 'Claude Code ever ships, this assistant gets for free. '
    + 'Now the other four — keep them, because the rest of the talk is these four. '
    + '4 — chat is the most generic UX, not the most convenient. I ask how to get from the '
    + 'service to the office, and the answer is correct, complete — and a paragraph: three routes, '
    + 'street by street. Let them start reading it. Click — THIS is what I wanted: the same three '
    + 'routes on a map, one glance. Claude Code cannot show me that; a terminal has only words. '
    + '(The routes and times are illustrative; the map is a sketch of Kyiv, not a real app.) '
    + '5 — the model in the status line is fixed. The loop wakes up and takes the smallest task '
    + 'there is: «put the service in the calendar» — one call to the Google Calendar connector. '
    + 'And it is done by Opus, at Opus prices, with the whole conversation sent along. Look at '
    + 'the status line: the biggest model, and the bill moved for one calendar entry. A model ten '
    + 'times cheaper would have done it; the hard tasks do need the big one — and the loop '
    + 'cannot pick per task, it runs whatever the session was started with. (Sums illustrative.) '
    + '6 — and then three hours of the small print of that ONE errand: what the insurance covers, '
    + 'comparing the quotes, clearing Thursday morning, the winter tyres. Four ticks, and every '
    + 'word of it stays in the context. I cannot clear it automatically between tasks. It '
    + 'compacts — and what it knew becomes a summary: it still «knows» the tyre-pressure light was '
    + 'on, because that was SAID; ask anything else about the photo from beat 2 and it has to ask '
    + 'for the photo again. '
    + '7 — the loop ticks every ten minutes and every tick costs tokens, even when the queue is '
    + 'empty. Watch the cost in the status line. And it gets worse as the session goes on: a tick '
    + 'sends the whole conversation again, so the bigger the context, the more an EMPTY tick '
    + 'costs. (The sum on screen is illustrative — say so if asked; I did not measure a tick.) '
    + 'Honest about the replay: rebuilt for the stage — the car, the service, the ids and the '
    + 'sums are illustrative, the dashboard photo is a generated image and not a real car, the fast-forwarded three hours are a device, and the status line is '
    + 'a custom one (Claude Code draws whatever your statusLine command prints). The lines the CLI '
    + 'prints itself — image placeholder, remote-control, context low, compaction, loop wakeup — '
    + 'are read off the 2.1.322 binary. The phone is drawn after the Claude app\'s session view as '
    + 'claude.ai/code shows it — a recreation, not a capture.',
};
