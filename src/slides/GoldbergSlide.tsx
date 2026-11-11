import { useLayoutEffect, useMemo, useState } from 'react';
import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';
import { EXPORT_MODE, clamp01, lerp, seg } from '../components/ctxScene';

/**
 * How it works — the self-learning system as a Rube Goldberg machine: a Jira
 * board on the left, the agent in the middle, the skills marketplace on the right,
 * joined by a ramp, a pneumatic tube, a return belt and a spring. No beats: it
 * runs by itself, cycle after cycle, for as long as the slide is up.
 *
 * One cycle: the head of TO DO slides down the ramp into the agent (the board
 * shows it in progress); skills shoot down the tube; the gears turn; a used skill
 * goes back up one version better, sometimes with a brand-new skill; the agent
 * prints the session log onto the card; the card rides out and the gate decides —
 * done (it joins DONE, the oldest done card slides off, and a new ticket drops
 * into TO DO) or not yet (the spring flings it back to the end of TO DO, log
 * attached). Then «/loop» waits, and it starts again.
 *
 * Tickets arrive on their own random clock (TO DO stays between 0 and 3; with
 * none, /loop says «no tasks…» and waits); the first three cycles are scripted (a
 * done with a new skill, a «not yet», a done with another new skill), the rest are
 * rolled. `user-information` is pinned on top of the marketplace and goes into
 * every task; now and then it comes back better too. Each showing rolls new dice;
 * the PDF uses a fixed seed and one moment of cycle two. An endless loop is ambient
 * for the ready mark (frameSettled.ts), so the mark still lights. No title, no
 * beats — the canvas is the whole stage. Plain SVG; styles are `.ww-gb…`.
 *
 * The task keys, the skill versions and the new skills are made up for the
 * picture; the skills the marketplace starts with are the ones this talk built.
 */

type P = [number, number];
type Span = { start: number; dur: number };

// ── the machine's moves ────────────────────────────────────────────────────
const PHASES = ['pick', 'pull', 'work', 'update', 'add', 'log', 'decide', 'gate'] as const;
type Phase = (typeof PHASES)[number];
const SPEED = 0.8;
const BASE: Record<Phase, number> = {
  pick: 1600, pull: 2000, work: 1200, update: 1400, add: 1400, log: 1400, decide: 1000, gate: 1600,
};
/** «/loop» waiting for its next tick, between two cycles. */
const IDLE = 900;
/** The first tick, a moment after the slide appears. */
const FIRST = 600;

// ── the world ───────────────────────────────────────────────────────────────
/** `special`: the one every task reads — what the agent knows about me. */
type Skill = { name: string; ver: number; special?: boolean };
const SKILLS: Skill[] = [
  { name: 'user-information', ver: 9, special: true },
  { name: 'development-process', ver: 4 },
  { name: 'skill-authoring', ver: 3 },
  { name: 'research', ver: 2 },
  { name: 'marketplace-dev', ver: 2 },
  { name: 'plugin-dev', ver: 1 },
  { name: 'do-task', ver: 1 },
];
/** The marketplace has room for twelve; once full, skills only get better. */
const MAX_SKILLS = 12;
const NEW_SKILLS = ['fill-pdf-forms', 'book-a-doctor', 'pay-the-bills', 'plan-a-trip', 'renew-passport', 'track-parcels'];
const TODO = ['LIFE-7', 'LIFE-8', 'LIFE-9']; // head first
const DONE = ['LIFE-5', 'LIFE-6'];
const FIRST_NEW_TICKET = 10;

type Plan = { pull: number[]; update: number; add?: string; done: boolean };
/** The film's opening: what the talk narrates. Every cycle after it is rolled. */
const SCRIPT: Plan[] = [
  { pull: [0, 1, 3], update: 1, add: 'fill-pdf-forms', done: true },
  { pull: [0, 2, 7], update: 0, done: false },
  { pull: [0, 1, 3], update: 3, add: 'book-a-doctor', done: true },
];
/** TO DO never holds more than this — a ticket that would not fit never arrives. */
const TODO_MAX = 3;
/** A new ticket's fall onto the board, and the breath before the agent may take it. */
const DROP = 700;
const SETTLE = 1000;
/** Time between two new tickets: at least 1.5 s, 6 s on average — sometimes a
 *  queue builds up, sometimes the agent waits on an empty board. */
const ARRIVAL_MIN = 1500;
const ARRIVAL_MEAN = 4500;

/** mulberry32: a tiny seeded generator. */
function dice(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function plan(n: number, seed: number, skills: Skill[], card: string, returned: Set<string>): Plan {
  if (n < SCRIPT.length) return SCRIPT[n];
  const roll = dice(seed ^ Math.imul(n + 1, 0x9e3779b1));
  // user-information (slot 0) goes into every task; then one or two of the others
  const others = skills.length - 1;
  const first = 1 + Math.floor(roll() * others);
  const second = 1 + ((first - 1 + 1 + Math.floor(roll() * (others - 1))) % others);
  const pull = roll() < 0.6 ? [0, first, second] : [0, first];
  const update = roll() < 0.25 ? 0 : pull[1 + Math.floor(roll() * (pull.length - 1))];
  const unused = NEW_SKILLS.filter((s) => !skills.some((k) => k.name === s));
  const add = skills.length < MAX_SKILLS && unused.length && roll() < 0.4 ? unused[0] : undefined;
  // nobody is sent back twice
  const done = returned.has(card) || roll() < 0.7;
  return { pull, update, add, done };
}

function timeline(start: number, hasAdd: boolean): { tl: Record<Phase, Span>; end: number } {
  let t = start;
  const tl = {} as Record<Phase, Span>;
  for (const ph of PHASES) {
    const dur = ph === 'add' && !hasAdd ? 0 : BASE[ph] * SPEED;
    tl[ph] = { start: t, dur };
    t += dur;
  }
  return { tl, end: t + IDLE };
}

/** One cycle of the machine, with the board and the marketplace as it found them. */
type Run = Plan & {
  tl: Record<Phase, Span>;
  end: number; // the gate has shut and /loop has paused
  card: string;
  d: string[]; // DONE, oldest first (the board shows the last three)
  skills: Skill[];
  addSlot: number;
  backSlot: number; // where a «not yet» lands in TO DO
  busyBefore: number; // ms of work in every earlier cycle — the gears pick up from there
};
/** TO DO as it stands from moment `t`: each ticket's slot, and how it got there
 *  (`from` a slot it slides over from, or a 'drop' from above, over `at`…`at + dur`). */
type Item = { key: string; slot: number; from?: number | 'drop'; at: number; dur: number };
type Snap = { t: number; items: Item[] };

/**
 * The machine's world, simulated forward on demand and kept: tickets arrive on
 * their own random clock (refused while TO DO + the ticket in the machine is
 * full); the agent takes the head as soon as it is free, or waits for one. An
 * arrival never lands mid-shuffle: one during a pick waits for the pick, one
 * during the gate waits for a «not yet» to land first.
 */
class World {
  readonly runs: Run[] = [];
  readonly snaps: Snap[] = [];
  /** When each ticket got its session log (the first time). */
  readonly logAt = new Map<string, number>();
  private readonly roll: () => number;
  private queue = [...TODO];
  private done = [...DONE];
  private skills = SKILLS;
  private returned = new Set<string>();
  private nextKey = FIRST_NEW_TICKET;
  private arrival: number;
  private lastDrop = -Infinity;
  private nextStart = FIRST;
  /** ms the machine has spent working, over every finished cycle (the gears' odometer). */
  private busy = 0;

  constructor(private readonly seed: number) {
    this.roll = dice(seed);
    DONE.forEach((k) => this.logAt.set(k, -Infinity));
    this.snaps.push({ t: -Infinity, items: this.layout() });
    this.arrival = FIRST + this.gap();
  }

  /** The cycle under way at `g` (its pick has started), or -1 before the first. */
  cycleAt(g: number): number {
    while (this.nextStart <= g) this.startRun(this.nextStart);
    let n = this.runs.length - 1;
    while (n >= 0 && this.runs[n].tl.pick.start > g) n--;
    return n;
  }
  run(n: number): Run {
    while (this.runs.length <= n) this.startRun(this.nextStart);
    return this.runs[n];
  }
  /** TO DO at `g` (call cycleAt(g) first, so the world has been simulated that far). */
  todoAt(g: number): Snap {
    let i = this.snaps.length - 1;
    while (i > 0 && this.snaps[i].t > g) i--;
    return this.snaps[i];
  }

  private gap(): number {
    return ARRIVAL_MIN - Math.log(1 - this.roll()) * ARRIVAL_MEAN;
  }
  private layout(): Item[] {
    return this.queue.map((key, i) => ({ key, slot: queueSlot(i), at: 0, dur: 0 }));
  }
  private snap(t: number, items: Item[]) {
    // a ticket still falling or sliding keeps doing so through the next change
    const prev = this.snaps[this.snaps.length - 1];
    this.snaps.push({
      t,
      items: items.map((it) => {
        const old = prev.items.find((o) => o.key === it.key);
        return it.from === undefined && old?.from !== undefined && old.slot === it.slot && old.at + old.dur > t
          ? { ...it, from: old.from, at: old.at, dur: old.dur }
          : it;
      }),
    });
  }
  private arrive(t: number) {
    this.queue.push(`LIFE-${this.nextKey++}`);
    const items = this.layout();
    items[items.length - 1] = { ...items[items.length - 1], from: 'drop', at: t, dur: DROP };
    this.snap(t, items);
    this.lastDrop = t;
  }

  private startRun(P: number) {
    const n = this.runs.length;
    const card = this.queue[0];
    const p = plan(n, this.seed, this.skills, card, this.returned);
    const { tl, end } = timeline(P, Boolean(p.add));
    const run: Run = {
      ...p, tl, end, card, d: [...this.done], skills: this.skills, addSlot: this.skills.length, backSlot: 0,
      busyBefore: this.busy,
    };
    this.runs.push(run);

    // the pick: the head leaves, the rest move up
    const before = this.layout();
    this.queue.shift();
    const { start: ps, dur: pd } = tl.pick;
    this.snap(P, this.queue.map((key, i) => ({
      key, slot: queueSlot(i), from: before.find((b) => b.key === key)!.slot, at: ps + pd * 0.35, dur: pd * 0.55,
    })));

    // tickets arriving while it works
    const gs = tl.gate.start;
    const ge = gs + tl.gate.dur;
    let back = false;
    const land = () => {
      if (!p.done) {
        run.backSlot = queueSlot(this.queue.length);
        this.queue.push(card);
        this.snap(ge, this.layout());
        this.returned.add(card);
      }
      back = true;
    };
    while (this.arrival <= end) {
      let a = Math.max(this.arrival, ps + pd);
      if (a >= gs && a < ge) a = ge;
      if (a >= ge && !back) land();
      if (this.queue.length + (a < ge ? 1 : 0) < TODO_MAX) this.arrive(a);
      this.arrival += this.gap();
    }
    if (!back) land();
    if (!this.logAt.has(card)) this.logAt.set(card, tl.log.start + tl.log.dur);
    // only the last three are ever drawn: the history stays small however long the talk runs
    if (p.done) this.done = [...this.done, card].slice(-DONE_SHOWN);
    this.busy += tl.log.start + tl.log.dur - tl.pull.start;
    this.skills = this.skills.map((s, i) => (i === p.update ? { ...s, ver: s.ver + 1 } : s));
    if (p.add) this.skills = [...this.skills, { name: p.add, ver: 1 }];

    // the next tick: straight away, or as soon as a ticket has landed
    let next = Math.max(end, this.lastDrop + SETTLE);
    if (this.queue.length === 0) {
      this.arrive(this.arrival);
      next = this.arrival + SETTLE;
      this.arrival += this.gap();
    }
    while (this.arrival < next) {
      if (this.queue.length < TODO_MAX) this.arrive(this.arrival);
      this.arrival += this.gap();
    }
    this.nextStart = next;
  }
}

const prog = (g: number, s: Span) => (s.dur ? seg(g, s.start, s.dur) : g >= s.start ? 1 : 0);
const ease = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
/** 1 → 0 over `ms` after the moment `at`. */
const pulse = (g: number, at: number, ms = 800) => (g >= at && g < at + ms ? 1 - (g - at) / ms : 0);

/** The PDF's world and its still: cycle two, two skills on their way down the tube. */
const EXPORT_SEED = 1;
function exportAt(): number {
  const { pull } = new World(EXPORT_SEED).run(1).tl;
  return pull.start + pull.dur * 0.55;
}

// ── geometry ────────────────────────────────────────────────────────────────
const CARD = { w: 140, h: 64 };
const slotX = (slot: number) => 94 + slot * 156;
const todoAt = (slot: number): P => [slotX(slot), 202];
const doingAt: P = [slotX(0), 362];
const doneAt = (slot: number): P => [slotX(slot), 522];
/** The queue's head sits rightmost, next to the ramp. */
const queueSlot = (k: number) => 2 - k;
const DONE_SHOWN = 3;
const GATE: P = [612, 522];
const INSIDE_IN: P = [810, 342];
const INSIDE_OUT: P = [820, 522];
const rampPath = (from: P): P[] => [from, [560, 214], [694, 327], INSIDE_IN];
/** Where the log tag clips onto a card, from its centre: past the key, over the corner. */
const LOG_AT: P = [56, -48];

const SLOT = { x: 1224, w: 452, h: 50 };
const slotY = (i: number) => -30 + i * 62;
const slotMid = (i: number) => slotY(i) + SLOT.h / 2;
const MANIFOLD_X = 1140;
const tubePath = (slot: number): P[] => [
  [SLOT.x, slotMid(slot)],
  [MANIFOLD_X, slotMid(slot)],
  [MANIFOLD_X, 210],
  [1000, 210],
  [1000, 310],
];

/** Position and heading at fraction `p` of a polyline (heading eases round corners). */
function along(pts: P[], p: number): { x: number; y: number; a: number } {
  const lens = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  let d = clamp01(p) * lens.reduce((s, l) => s + l, 0);
  let prev = 0;
  for (let i = 0; i < lens.length; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const a = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
    if (d <= lens[i] || i === lens.length - 1) {
      const f = lens[i] ? Math.min(1, d / lens[i]) : 1;
      return { x: lerp(x0, x1, f), y: lerp(y0, y1, f), a: i ? lerp(prev, a, Math.min(1, f / 0.3)) : a };
    }
    d -= lens[i];
    prev = a;
  }
  return { x: pts[0][0], y: pts[0][1], a: 0 };
}

// ── the state at time g ─────────────────────────────────────────────────────
type CardState = { key: string; x: number; y: number; a: number; o: number; log: boolean; done: boolean };

function cardsAt(w: World, g: number, c: number): { cards: CardState[]; ghost: string | null } {
  const make = (key: string, [x, y]: P, extra: Partial<CardState> = {}): CardState => ({
    key, x, y, a: 0, o: 1, log: (w.logAt.get(key) ?? Infinity) <= g, done: false, ...extra,
  });
  // TO DO, as the world has it at g: falling in, moving up, or sitting
  const todo = w.todoAt(g).items.map((it) => {
    const [x, y] = todoAt(it.slot);
    const p = ease(seg(g, it.at, it.dur || 1));
    if (it.from === 'drop') return make(it.key, [x, lerp(110, y, p)], { o: p });
    if (typeof it.from === 'number') return make(it.key, [lerp(slotX(it.from), x, p), y]);
    return make(it.key, [x, y]);
  });
  if (c < 0) {
    return { cards: [...todo, ...DONE.map((k, j) => make(k, doneAt(j), { done: true }))], ghost: null };
  }
  const r = w.run(c);
  const shown = r.d.slice(-DONE_SHOWN);
  const { tl } = r;
  const head = r.card;
  const pPick = prog(g, tl.pick);
  const pLog = prog(g, tl.log);
  const pGate = prog(g, tl.gate);
  const m = ease(seg(pGate, 0.25, 0.75));
  const cards: CardState[] = [];

  // DONE: when this one is done and the row is full, the row shuffles left
  // and the oldest slides off the board
  const full = r.done && shown.length >= DONE_SHOWN;
  shown.forEach((k, j) => {
    const slot = full ? j - m : j;
    cards.push(make(k, doneAt(slot), { done: true, o: full && j === 0 ? 1 - m : 1 }));
  });
  cards.push(...todo);
  // the task itself
  if (pPick < 1) {
    const at = along(rampPath(todoAt(queueSlot(0))), ease(pPick));
    cards.push(make(head, [at.x, at.y], { a: at.a }));
  } else if (pLog === 0) {
    // inside the machine: behind its body, out of sight
  } else if (pGate === 0) {
    const out = ease(seg(pLog, 0, 0.6));
    cards.push(make(head, [lerp(INSIDE_OUT[0], GATE[0], out), GATE[1]]));
  } else if (r.done) {
    const to = doneAt(full ? DONE_SHOWN - 1 : shown.length);
    cards.push(make(head, [lerp(GATE[0], to[0], m), GATE[1]], { log: true, done: m >= 1 }));
  } else if (g < r.tl.gate.start + r.tl.gate.dur) {
    // (by time, not progress: at the landing instant TO DO already owns the card)
    // the spring flings it back onto the board, to the end of the queue (where TO DO takes it over)
    const to = todoAt(r.backSlot);
    const cy = (4 * 40 - GATE[1] - to[1]) / 2; // a quadratic arc whose top is y = 40
    const cx = (GATE[0] + to[0]) / 2;
    const x = (1 - m) ** 2 * GATE[0] + 2 * (1 - m) * m * cx + m ** 2 * to[0];
    const y = (1 - m) ** 2 * GATE[1] + 2 * (1 - m) * m * cy + m ** 2 * to[1];
    cards.push(make(head, [x, y], { a: -360 * m, log: true }));
  }
  const ghost = pPick >= 0.5 && pGate < 0.5 ? head : null;
  return { cards, ghost };
}

type Ink = 'pull' | 'update' | 'add';
type Slot = Skill & { solid: boolean; flash: number; ink: Ink };
type Token = { x: number; y: number; ink: Ink };

function marketAt(w: World, g: number, c: number): { slots: Slot[]; tokens: Token[] } {
  const tokens: Token[] = [];
  if (c < 0) return { slots: SKILLS.map((s) => ({ ...s, solid: true, flash: 0, ink: 'pull' })), tokens };
  const r = w.run(c);
  const slots: Slot[] = r.skills.map((s) => ({ ...s, solid: true, flash: 0, ink: 'pull' }));
  const { tl } = r;
  const glow = (i: number, f: number, ink: Ink) => {
    if (slots[i] && f > slots[i].flash) Object.assign(slots[i], { flash: f, ink });
  };
  const step = r.pull.length > 1 ? 0.45 / (r.pull.length - 1) : 0;
  r.pull.forEach((slot, k) => {
    const p = seg(prog(g, tl.pull), k * step, 0.55);
    if (p > 0 && p < 1) tokens.push({ ...along(tubePath(slot), ease(p)), ink: 'pull' });
    glow(slot, pulse(g, tl.pull.start + tl.pull.dur * k * step), 'pull');
  });
  const pu = seg(prog(g, tl.update), 0, 0.85);
  if (pu > 0 && pu < 1) tokens.push({ ...along([...tubePath(r.update)].reverse(), ease(pu)), ink: 'update' });
  const arrived = tl.update.start + tl.update.dur * 0.85;
  if (g >= arrived) {
    slots[r.update].ver += 1;
    glow(r.update, pulse(g, arrived), 'update');
  }
  if (r.add && g >= tl.add.start) {
    const landed = tl.add.start + tl.add.dur * 0.85;
    slots[r.addSlot] = { name: r.add, ver: 1, solid: g >= landed, flash: 0, ink: 'add' };
    glow(r.addSlot, pulse(g, landed), 'add');
    const pa = seg(prog(g, tl.add), 0.15, 0.7);
    if (pa > 0 && pa < 1) tokens.push({ ...along([...tubePath(r.addSlot)].reverse(), ease(pa)), ink: 'add' });
  }
  return { slots, tokens };
}

/** Degrees the gears have turned by `g`: they turn while a task is in the machine. */
function gearTurn(w: World, g: number, c: number): number {
  if (c < 0) return 0;
  const { tl, busyBefore } = w.run(c);
  const ms = busyBefore + Math.max(0, Math.min(g, tl.log.start + tl.log.dur) - tl.pull.start);
  return (ms / 1000) * 150;
}

function screenAt(w: World, g: number, c: number): { cmd: string; line: string; busy: boolean } {
  if (c < 0 || prog(g, w.run(c).tl.gate) >= 1) {
    return { cmd: '/loop 10m', line: w.todoAt(g).items.length ? 'waiting…' : 'no tasks…', busy: false };
  }
  const { tl, card } = w.run(c);
  if (prog(g, tl.decide) > 0) return { cmd: '/do-task', line: `${card} done?`, busy: true };
  if (prog(g, tl.log) > 0) return { cmd: '/do-task', line: `log → ${card}`, busy: true };
  const dots = prog(g, tl.update) > 0 ? '●●●' : prog(g, tl.work) > 0 ? '●●○' : prog(g, tl.pull) > 0 ? '●○○' : '○○○';
  return { cmd: '/do-task', line: `${card} ${dots}`, busy: true };
}

// ── drawing ─────────────────────────────────────────────────────────────────
function gearPath(r: number, teeth: number): string {
  const ri = r * 0.76;
  const s = (2 * Math.PI) / teeth;
  const pt = (rad: number, a: number) => `${(rad * Math.cos(a)).toFixed(1)},${(rad * Math.sin(a)).toFixed(1)}`;
  const pts: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const a = i * s;
    pts.push(pt(ri, a), pt(r, a + s * 0.15), pt(r, a + s * 0.45), pt(ri, a + s * 0.6));
  }
  return `M${pts.join('L')}Z`;
}
const GEAR_BIG = gearPath(38, 10);
const GEAR_SMALL = gearPath(25, 7);

function LogTag({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect className="ww-gb__log" width="30" height="40" rx="4" />
      {[10, 18, 26].map((ly) => (
        <line key={ly} className="ww-gb__logline" x1="6" x2="24" y1={ly} y2={ly} />
      ))}
    </g>
  );
}

function Card({ c }: { c: CardState }) {
  return (
    <g transform={`translate(${c.x} ${c.y}) rotate(${c.a})`} opacity={c.o}>
      <rect
        className={`ww-gb__card${c.done ? ' ww-gb__card--done' : ''}`}
        x={-CARD.w / 2}
        y={-CARD.h / 2}
        width={CARD.w}
        height={CARD.h}
        rx="10"
      />
      <text className="ww-gb__key" y="10" textAnchor="middle">
        {c.key}
      </text>
      {c.log && <LogTag x={LOG_AT[0]} y={LOG_AT[1]} />}
    </g>
  );
}

function Spring({ h }: { h: number }) {
  const n = 6;
  const pts = Array.from({ length: n + 1 }, (_, i) => `${GATE[0] + (i === 0 || i === n ? 0 : i % 2 ? -12 : 12)},${572 + (h * i) / n}`);
  return <polyline className="ww-gb__spring" points={pts.join(' ')} />;
}

function Mark({ w, g, c }: { w: World; g: number; c: number }) {
  if (c < 0) return null;
  const r = w.run(c);
  const pd = prog(g, r.tl.decide);
  const pg = prog(g, r.tl.gate);
  let kind: 'ask' | 'done' | 'more' | null = null;
  if (pd > 0 && pd < 1) kind = 'ask';
  else if (pd >= 1 && pg < 0.7) kind = r.done ? 'done' : 'more';
  if (!kind) return null;
  const glyph = { ask: '?', done: '✓', more: '↺' }[kind];
  const scale = kind === 'ask' ? 1 + 0.08 * Math.sin(pd * Math.PI * 6) : 1;
  return (
    <g transform={`translate(${GATE[0]} 440) scale(${scale})`} className={`ww-gb__mark ww-gb__mark--${kind}`}>
      <circle r="28" />
      <text y="12" textAnchor="middle">
        {glyph}
      </text>
    </g>
  );
}

/** ms since the slide appeared, for as long as it is up (the PDF gets one fixed moment). */
function useLoopClock(): number {
  const [t, setT] = useState(() => (EXPORT_MODE ? exportAt() : 0));
  useLayoutEffect(() => {
    if (EXPORT_MODE) return;
    const start = performance.now();
    let id = requestAnimationFrame(function tick(now) {
      setT(now - start);
      id = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(id);
  }, []);
  return t;
}

function Machine() {
  // a fresh roll of the dice every time the slide comes up; the PDF's is fixed
  const w = useMemo(() => new World(EXPORT_MODE ? EXPORT_SEED : (Math.random() * 2 ** 32) >>> 0), []);
  const g = useLoopClock();
  const c = w.cycleAt(g);
  const { cards, ghost } = cardsAt(w, g, c);
  const { slots, tokens } = marketAt(w, g, c);
  const turn = gearTurn(w, g, c);
  const screen = screenAt(w, g, c);

  // the printed log: out of the printer slot, then down onto the card
  let printing = null;
  // the spring squeezes and kicks when a card goes back to the board
  let spring = 36;
  if (c >= 0) {
    const r = w.run(c);
    const pLog = prog(g, r.tl.log);
    if (pLog > 0.3 && pLog < 1) {
      const a = ease(seg(pLog, 0.3, 0.4));
      const b = ease(seg(pLog, 0.7, 0.3));
      printing = <LogTag x={lerp(lerp(720, 662, a), GATE[0] + LOG_AT[0], b)} y={lerp(440, GATE[1] + LOG_AT[1], b)} />;
    }
    const pg = prog(g, r.tl.gate);
    if (!r.done && pg > 0 && pg < 0.25) spring = lerp(36, 20, pg / 0.25);
    else if (!r.done && pg >= 0.25 && pg < 0.5) spring = lerp(52, 36, (pg - 0.25) / 0.25);
  }
  const lowest = slotMid(slots.length - 1);

  return (
    <svg className="ww-gb__svg" viewBox="0 -110 1700 860" role="img" aria-label="A Jira board, an agent and a skills marketplace, joined like a Rube Goldberg machine, running in a loop">
      {/* the board and the marketplace */}
      <rect className="ww-gb__frame" x="0" y="40" width="520" height="600" rx="24" />
      <text className="ww-gb__label" x="28" y="92">Jira board</text>
      <text className="ww-gb__row" x="28" y="154">TO DO</text>
      <text className="ww-gb__row" x="28" y="314">IN PROGRESS</text>
      <text className="ww-gb__row" x="28" y="474">DONE</text>
      <rect className="ww-gb__frame" x="1200" y="-110" width="500" height="860" rx="24" />
      <text className="ww-gb__label" x="1228" y="-58">marketplace</text>

      {/* the ramp down into the agent, the belt back out, the spring under it */}
      <line className="ww-gb__ramp" x1="520" y1="220" x2="700" y2="371" />
      <Spring h={spring} />
      <rect className="ww-gb__belt" x="520" y="556" width="180" height="16" rx="8" />
      {[548, 584, 620, 656, 692].map((x) => (
        <circle key={x} className="ww-gb__roller" cx={x - 8} cy="564" r="4" />
      ))}

      {/* the pneumatic tube between the agent and the marketplace */}
      <g className="ww-gb__pipe">
        <path d={`M1000 300 V210 H${MANIFOLD_X}`} />
        <path d={`M${MANIFOLD_X} ${slotMid(0)} V${lowest}`} />
        {slots.map((_, i) => (
          <path key={i} d={`M${MANIFOLD_X} ${slotMid(i)} H${SLOT.x + 10}`} />
        ))}
      </g>
      {tokens.map((tk, i) => (
        <rect key={i} className={`ww-gb__token ww-gb__token--${tk.ink}`} x={tk.x - 14} y={tk.y - 9} width="28" height="18" rx="9" />
      ))}

      {/* the tasks: drawn before the agent, so they slide in and out behind its body */}
      {ghost && (
        <g transform={`translate(${doingAt[0]} ${doingAt[1]})`}>
          <rect className="ww-gb__card ww-gb__card--ghost" x={-CARD.w / 2} y={-CARD.h / 2} width={CARD.w} height={CARD.h} rx="10" />
          <text className="ww-gb__key ww-gb__key--ghost" y="10" textAnchor="middle">{ghost}</text>
        </g>
      )}
      {cards.map((card) => (
        <Card key={card.key} c={card} />
      ))}
      {printing}

      {/* the agent */}
      <rect className="ww-gb__body" x="700" y="280" width="360" height="320" rx="24" />
      <rect className="ww-gb__mouth" x="694" y="300" width="12" height="84" rx="4" />
      <rect className="ww-gb__mouth" x="694" y="436" width="12" height="34" rx="4" />
      <rect className="ww-gb__mouth" x="694" y="486" width="12" height="76" rx="4" />
      <rect className="ww-gb__screen" x="730" y="304" width="300" height="126" rx="12" />
      <text className={`ww-gb__tty ${screen.busy ? 'ww-gb__tty--claude' : 'ww-gb__tty--dim'}`} x="752" y="354">{screen.cmd}</text>
      <text className={`ww-gb__tty${screen.busy ? '' : ' ww-gb__tty--dim'}`} x="752" y="404">{screen.line}</text>
      <g transform={`translate(1000 538) rotate(${turn})`}>
        <path className="ww-gb__gear" d={GEAR_BIG} />
        <circle className="ww-gb__hub" r="7" />
      </g>
      <g transform={`translate(943 566) rotate(${-turn * (38 / 25) + 13})`}>
        <path className="ww-gb__gear" d={GEAR_SMALL} />
        <circle className="ww-gb__hub" r="5" />
      </g>
      <text className="ww-gb__label" x="880" y="648" textAnchor="middle">agent</text>

      {/* the skills, drawn over the tube's ends */}
      {slots.map((s, i) => (
        <g key={i}>
          <rect
            className={`ww-gb__slot${s.solid ? '' : ' ww-gb__slot--new'}${s.special ? ' ww-gb__slot--special' : ''}`}
            x={SLOT.x}
            y={slotY(i)}
            width={SLOT.w}
            height={SLOT.h}
            rx="10"
            style={s.solid ? { fill: `color-mix(in srgb, var(--ww-gb-${s.ink}) ${Math.round(s.flash * 45)}%, var(--ww-white))` } : undefined}
          />
          {s.solid && (
            <>
              <text className={`ww-gb__skill${s.special ? ' ww-gb__skill--special' : ''}`} x={SLOT.x + 20} y={slotMid(i) + 10}>{s.name}</text>
              <text className="ww-gb__ver" x={SLOT.x + SLOT.w - 18} y={slotMid(i) + 10} textAnchor="end">v{s.ver}</text>
            </>
          )}
        </g>
      ))}

      <Mark w={w} g={g} c={c} />
    </svg>
  );
}

export const GoldbergSlide: SlideDefinition = {
  id: 'goldberg',
  content: () => (
    <>
      <CornerRings corner="top-right" />
      <div className="ww-gb">
        <Machine />
      </div>
    </>
  ),
  notes:
    'DRAFT. No clicks — it runs by itself, talk over it. The whole thing as a Rube Goldberg machine. On '
    + 'the left, a Jira board with my tasks. In the middle, the agent — Claude Code on /loop. On the '
    + 'right, my marketplace of skills — on top, user-information: what it knows about me, it goes into every task. The loop ticks: the agent picks the next task — it slides down '
    + 'into the machine, and on the board it is now in progress. To do the work it pulls skills from '
    + 'the marketplace. When it is done it looks back: a skill it used goes back one version better, '
    + 'and sometimes there is a brand-new skill it did not have. Then it attaches the session log to '
    + 'the task — that is what the next run reads first — and decides: done, or not yet. Done goes to '
    + 'DONE, and a new ticket lands in TO DO; not yet, and the spring throws it back onto the board, '
    + 'log attached, for the next run. And again, every ten minutes — the board keeps moving and the '
    + 'skills keep getting better. (The task keys, the versions and the new skills are made up for '
    + 'the picture.)',
};
