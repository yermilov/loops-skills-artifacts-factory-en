import { useRef, type CSSProperties, type ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';
import { useAnimating } from '../components/frameSettled';
import {
  Chip,
  HarnessWindow,
  isSpecial,
  Laptop,
  lerp,
  Names,
  Orb,
  ORB,
  ORB_D,
  out,
  seg,
  SHEET,
  Stamp,
  useOneShotClock,
  useUnitSlots,
  WIN,
  type Pt,
  type Who,
} from '../components/ctxScene';

/**
 * What /loop actually is, with no words but the ones on the page: a sheet of
 * paper — the context — filling up from three writers, played in one go.
 *
 * The writers are objects, not avatars: the USER is a laptop (its keys light
 * as it types), the HARNESS is a terminal
 * window across the top (its screen is the desk where the loop lives: a timer
 * dial and whatever it is holding), the MODEL is a glowing orb that breathes
 * while it streams.
 *
 *  · the harness drops the system prompt onto the sheet;
 *  · the user types «/loop 10m do the next task»;
 *  · the harness reads the line (a violet band) and lifts copies of «10m» and
 *    «do the next task» onto its screen: a dial and a held chip;
 *  · the user steps away; the dial runs one lap in mint; the held chip drops onto
 *    the sheet as «User: do the next task» — the harness's stamp and ink;
 *  · the model reads the whole sheet (a magenta band, that line included) and
 *    answers with a tool call; the harness lifts the call onto its screen, runs
 *    it, drops «Tool: []»; the model answers; the dial starts its next lap.
 *
 * Everything is a function of one clock from slide entry (requestAnimationFrame,
 * no CSS animation), so it plays once and holds, and the PDF is one frame.
 * Design worked out with a Fable 5.2 consult, 11.11.2026.
 */

type Turn = { who: Who; label: string; text: string; act: number };

const PROMPT = 'do the next task';
const TURNS: Turn[] = [
  { who: 'harness', label: 'System:', text: 'You are Claude Code. Tools: Read, Edit, Bash. …', act: 1 },
  { who: 'user', label: 'User:', text: `/loop 10m ${PROMPT}`, act: 2 },
  { who: 'harness', label: 'User:', text: PROMPT, act: 4 },
  { who: 'model', label: 'Assistant:', text: 'Checking the queue… <|tool_call|> Bash(curl …/tasks) <|end_call|>', act: 5 },
  { who: 'harness', label: 'Tool:', text: '[]', act: 6 },
  { who: 'model', label: 'Assistant:', text: 'The queue is empty.', act: 6 },
];
const CALL_UNIT = 4; // «Bash(curl» — where the harness picks the call up
const CALL_TEXT = 'Bash(curl …/tasks)';
/** a turn's units: characters when typed, word tokens otherwise */
const units = (t: Turn) => (t.who === 'user' ? [...t.text] : t.text.split(' ').map((w, i, a) => (i < a.length - 1 ? `${w} ` : w)));
const LOOP_CHARS = '/loop 10m'.length;

// ── the script: six acts, played back to back, in ms ────────────────────────
const LEAD = 250;
const TAIL = 350;
const SLAB_STAGGER = 40;
const SLAB_DROP = 320;
const TYPE_MS = 55;
const SWEEP_UNIT = 32; // per character of reading
const LIFT_MS = 650;
const DIAL_IN = 350;
const AWAY_MS = 500;
const LAP_MS = 1800;
const PULSE_MS = 220;
const FALL_MS = 520;
const FLY_EVERY = 230;
const FLY_MS = 330;
const DRY_MS = 450;
const MODEL_SWEEP = 1300;
const ANSWER_SWEEP = 600;
const RUN_MS = 900;
const NEXT_LAP = 0.4; // how far the dial gets towards its next firing

const slabMs = (t: Turn) => (units(t).length - 1) * SLAB_STAGGER + SLAB_DROP;
const streamMs = (t: Turn) => (units(t).length - 1) * FLY_EVERY + FLY_MS;
const A1 = LEAD + slabMs(TURNS[0]) + TAIL;
const A2 = LEAD + units(TURNS[1]).length * TYPE_MS + TAIL;
const A3_SWEEP = units(TURNS[1]).length * SWEEP_UNIT;
const A3 = LEAD + A3_SWEEP + LIFT_MS + DIAL_IN + TAIL;
const A4_FALL_AT = LEAD + AWAY_MS + LAP_MS + PULSE_MS;
const A4 = A4_FALL_AT + FALL_MS + slabMs(TURNS[2]) + TAIL;
const A5_FLY_AT = LEAD + MODEL_SWEEP;
const A5_READ_AT = A5_FLY_AT + streamMs(TURNS[3]) + DRY_MS;
const A5 = A5_READ_AT + ANSWER_SWEEP + TAIL;
const A6_RUN_AT = LEAD + LIFT_MS;
const A6_FALL_AT = A6_RUN_AT + RUN_MS;
const A6_FLY_AT = A6_FALL_AT + FALL_MS + slabMs(TURNS[4]) + 250;
const A6_READ_AT = A6_FLY_AT + streamMs(TURNS[5]) + DRY_MS;
const A6 = A6_READ_AT + ANSWER_SWEEP + TAIL;
const ACT_MS = [A1, A2, A3, A4, A5, A6];
const ACT_AT = ACT_MS.map((_, i) => ACT_MS.slice(0, i).reduce((a, b) => a + b, 0));
const TOTAL = ACT_MS.reduce((a, b) => a + b, 0);


// ── geometry (a fixed 1700 × 870 canvas) ────────────────────────────────────
const DIAL: Pt = [WIN.x + 250, 108];
const DIAL_R = 54;
const HELD: Pt = [WIN.x + 348, 62];
const TOOL_SLOT: Pt = [WIN.x + 348, 118];

function Sheet() {
  const g = useOneShotClock(TOTAL);
  // which act we are in, and how far into it
  let act = ACT_MS.length;
  for (let i = 0; i < ACT_MS.length; i++) {
    if (g < ACT_AT[i] + ACT_MS[i]) {
      act = i + 1;
      break;
    }
  }
  const t = Math.min(g - ACT_AT[act - 1], ACT_MS[act - 1]);
  const done = g >= TOTAL;
  useAnimating(!done);

  // ── what is written: per turn, how many units, and how each one looks
  const turnUnits = TURNS.map(units);
  const slabFrom = (i: number) => (i === 0 ? LEAD : i === 2 ? A4_FALL_AT + FALL_MS : A6_FALL_AT + FALL_MS);
  const streamAt = (i: number) => (i === 3 ? A5_FLY_AT : A6_FLY_AT);
  const shownOf = (i: number): number => {
    const turn = TURNS[i];
    const n = turnUnits[i].length;
    if (turn.act < act || done) return n;
    if (turn.act > act) return 0;
    if (turn.who === 'user') return Math.min(n, Math.max(0, Math.floor((t - LEAD) / TYPE_MS) + 1));
    if (turn.who === 'model') return Math.min(n, Math.max(0, Math.floor((t - streamAt(i) - FLY_MS) / FLY_EVERY) + 1));
    return t < slabFrom(i) ? 0 : n; // a slab: all of it, dropping in staggered
  };

  // ── the reading bands
  type Band = { turns: number[]; from: number; ms: number; ink: Who };
  const bands: Band[] = [];
  if (act === 3) bands.push({ turns: [1], from: LEAD, ms: A3_SWEEP, ink: 'harness' });
  if (act === 5) {
    bands.push({ turns: [0, 1, 2], from: LEAD, ms: MODEL_SWEEP, ink: 'model' });
    bands.push({ turns: [3], from: A5_READ_AT, ms: ANSWER_SWEEP, ink: 'harness' });
  }
  if (act === 6) bands.push({ turns: [5], from: A6_READ_AT, ms: ANSWER_SWEEP, ink: 'harness' });
  const tint = (ti: number, ui: number): { ink: Who; a: number } | null => {
    if (!done) {
      for (const b of bands) {
        const k = b.turns.indexOf(ti);
        if (k < 0) continue;
        const total = b.turns.reduce((s, x) => s + turnUnits[x].length, 0);
        const before = b.turns.slice(0, k).reduce((s, x) => s + turnUnits[x].length, 0);
        const pos = seg(t, b.from, b.ms) * (total + 6);
        const d = pos - (before + ui);
        if (d >= 0 && d < 6) return { ink: b.ink, a: 0.32 * (1 - d / 6) };
      }
    }
    // «/loop 10m» keeps the harness's mark once it has been read
    if (ti === 1 && ui < LOOP_CHARS && (act > 3 || (act === 3 && t > LEAD + (ui + 1) * SWEEP_UNIT))) return { ink: 'harness', a: 0.22 };
    return null;
  };

  // ── measured slots of every unit (laid out from the start, hidden till written)
  const root = useRef<HTMLDivElement>(null);
  const slots = useUnitSlots(root);  const unitRect = (ti: number, ui: number) => slots[`${ti}-${ui}`];

  // ── the writers' states
  const typed = act === 2 ? shownOf(1) : act > 2 ? units(TURNS[1]).length : 0;
  const userLit = act === 2 && t < A2 - TAIL;
  const harnessLit =
    !done &&
    ((act === 1 && t < A1 - TAIL) ||
      (act === 3 && t < A3 - TAIL) ||
      (act === 4 && t > A4_FALL_AT - PULSE_MS && t < A4 - TAIL) ||
      (act === 5 && t > A5_READ_AT && t < A5 - TAIL) ||
      (act === 6 && (t < A6_FLY_AT - 200 || (t > A6_READ_AT && t < A6 - TAIL))));
  const modelLit = !done && ((act === 5 && t < A5_READ_AT) || (act === 6 && t > A6_FLY_AT - 200 && t < A6_READ_AT));
  const streaming = act === 5 ? 3 : act === 6 ? 5 : -1;
  let breath = 0;
  if (modelLit && streaming >= 0) {
    const local = t - streamAt(streaming);
    const k = Math.floor(local / FLY_EVERY);
    breath = local >= 0 && k < turnUnits[streaming].length ? Math.sin(seg(local - k * FLY_EVERY, 0, FLY_EVERY) * Math.PI) : 0;
  }

  // ── the dial: appears on 3, runs a lap on 4, starts its next lap on 5–6
  const dialIn = act > 3 ? 1 : act === 3 ? out(seg(t, LEAD + A3_SWEEP + LIFT_MS, DIAL_IN)) : 0;
  let lap = 0;
  if (act === 4) lap = t < A4_FALL_AT - PULSE_MS ? seg(t, LEAD + AWAY_MS, LAP_MS) : 0;
  if (act === 5) lap = seg(t, LEAD, A5 - LEAD) * NEXT_LAP * 0.5;
  if (act === 6) lap = lerp(NEXT_LAP * 0.5, NEXT_LAP, seg(t, LEAD, A6 - LEAD));
  const pulse = act === 4 ? Math.sin(seg(t, A4_FALL_AT - PULSE_MS, PULSE_MS) * Math.PI) : 0;
  const heldShown = act > 3 || (act === 3 && t > LEAD + A3_SWEEP + LIFT_MS);

  // ── things in flight, on top of everything
  const flights: ReactNode[] = [];
  if (act === 3 && !done) {
    const p = out(seg(t, LEAD + A3_SWEEP, LIFT_MS));
    if (p > 0 && p < 1) {
      const a = unitRect(1, 0);
      const b = unitRect(1, LOOP_CHARS + 1);
      if (a) flights.push(<Chip key="lift-loop" text="10m" who="user" small at={[lerp(a.x, DIAL[0] - 32, p), lerp(a.y, DIAL[1] - 20, p) - Math.sin(Math.PI * p) * 40]} />);
      if (b) flights.push(<Chip key="lift-prompt" text={PROMPT} who="user" at={[lerp(b.x, HELD[0], p), lerp(b.y, HELD[1], p) - Math.sin(Math.PI * p) * 40]} />);
    }
  }
  if (act === 4 && !done) {
    const p = out(seg(t, A4_FALL_AT, FALL_MS));
    const target = unitRect(2, 0);
    if (p > 0 && p < 1 && target) flights.push(<Chip key="fall" text={PROMPT} who="harness" at={[lerp(HELD[0], target.x, p), lerp(HELD[1], target.y, p)]} />);
  }
  if (streaming >= 0 && !done) {
    turnUnits[streaming].forEach((u, k) => {
      const p = seg(t, streamAt(streaming) + k * FLY_EVERY, FLY_MS);
      const r = unitRect(streaming, k);
      if (p > 0 && p < 1 && r) {
        const e = out(p);
        flights.push(
          <Chip key={`fly-${k}`} text={u.trim()} who="model" special={isSpecial(u)} at={[lerp(ORB[0] - ORB_D / 2, r.x, e), lerp(ORB[1] - 24, r.y, e) - Math.sin(Math.PI * p) * 34]} />,
        );
      }
    });
  }
  if (act === 6 && !done) {
    const lift = out(seg(t, LEAD, LIFT_MS));
    const from = unitRect(3, CALL_UNIT);
    if (lift > 0 && lift < 1 && from) {
      flights.push(<Chip key="call-lift" text={CALL_TEXT} who="model" special at={[lerp(from.x, TOOL_SLOT[0], lift), lerp(from.y, TOOL_SLOT[1], lift) - Math.sin(Math.PI * lift) * 40]} />);
    }
    if (t >= A6_RUN_AT && t < A6_FALL_AT) {
      const beat = Math.abs(Math.sin(seg(t, A6_RUN_AT, RUN_MS) * Math.PI * 3));
      flights.push(<Chip key="call-run" text={CALL_TEXT} who="model" special at={TOOL_SLOT} scale={1 + beat * 0.06} />);
    }
    const fall = out(seg(t, A6_FALL_AT, FALL_MS));
    const to = unitRect(4, 0);
    if (fall > 0 && fall < 1 && to) flights.push(<Chip key="result-fall" text="[]" who="harness" at={[lerp(TOOL_SLOT[0], to.x, fall), lerp(TOOL_SLOT[1], to.y, fall)]} />);
  }

  // ── the sheet's text
  const caretOn = act === 2 && t < A2 - TAIL && !done;
  const lines = TURNS.map((turn, ti) => {
    const n = shownOf(ti);
    const u = turnUnits[ti];
    const started = n > 0;
    return (
      <div key={ti} className={`ww-ctx__turn ww-ctx__turn--${turn.who}`}>
        <span className={`ww-ctx__stamp ww-ctx__stamp--${turn.who}`} style={{ opacity: started ? 1 : 0 }}>
          <Stamp who={turn.who} />
        </span>
        <span className="ww-ctx__label" style={{ visibility: started ? 'visible' : 'hidden' }}>
          {turn.label}
        </span>{' '}
        {u.map((text, ui) => {
          const shown = ui < n;
          const style: CSSProperties = { visibility: shown ? 'visible' : 'hidden' };
          let cls = 'ww-ctx__u';
          if (turn.who === 'user') cls += ' ww-ctx__u--char';
          if (isSpecial(text)) cls += ' ww-ctx__u--special';
          if (shown && !done && turn.act === act && turn.who === 'harness') {
            const p = out(seg(t, slabFrom(ti) + ui * SLAB_STAGGER, SLAB_DROP));
            style.transform = `translateY(${(1 - p) * -46}px)`;
            style.opacity = p;
          }
          if (shown && !done && turn.act === act && turn.who === 'model' && !isSpecial(text)) {
            const wet = 1 - seg(t, streamAt(ti) + ui * FLY_EVERY + FLY_MS, DRY_MS);
            if (wet > 0) {
              style.background = `color-mix(in srgb, var(--ww-magenta) ${Math.round(wet * 100)}%, transparent)`;
              style.color = wet > 0.5 ? 'var(--ww-white)' : undefined;
            }
          }
          const tt = shown ? tint(ti, ui) : null;
          if (tt && !style.background) {
            style.background = `color-mix(in srgb, var(--ww-${tt.ink === 'harness' ? 'violet' : 'magenta'}) ${Math.round(tt.a * 100)}%, transparent)`;
          }
          return (
            <span key={ui} data-u={`${ti}-${ui}`} className={cls} style={style}>
              {text}
            </span>
          );
        })}
        {caretOn && ti === 1 && <span className="ww-ctx__caret" />}
      </div>
    );
  });

  return (
    <div className="ww-ctx" ref={root}>
      <div className="ww-ctx__sheet" style={{ left: SHEET.x, top: SHEET.y, width: SHEET.w, height: SHEET.h }}>
        {lines}
      </div>

      {/* the harness: a terminal window; its screen is the desk */}
      <HarnessWindow lit={harnessLit} />
      <svg
        className="ww-ctx__dial"
        viewBox="-68 -68 136 136"
        style={{ left: DIAL[0] - 68, top: DIAL[1] - 68, opacity: dialIn, transform: `scale(${lerp(0.6, 1, dialIn) * (1 + pulse * 0.1)})` }}
        aria-hidden="true"
      >
        <circle className="ww-ctx__dialtrack" r={DIAL_R} />
        {lap > 0.005 && (
          <circle className="ww-ctx__dialfill" r={DIAL_R} strokeDasharray={`${2 * Math.PI * DIAL_R * lap} ${2 * Math.PI * DIAL_R}`} transform="rotate(-90)" />
        )}
      </svg>
      {heldShown && (
        <>
          <Chip text="10m" who="user" at={[DIAL[0] - 32, DIAL[1] - 20]} small />
          <Chip text={PROMPT} who="user" at={HELD} />
        </>
      )}

      <Laptop lit={userLit} typed={typed} />
      <Orb lit={modelLit} breath={breath} />
      <Names />

      {flights}
    </div>
  );
}

export const LoopIsCronSlide: SlideDefinition = {
  id: 'loop-is-cron',
  content: () => (
    <>
      <CornerRings corner="top-right" />
      <div className="ww-ctxstage">
        <Sheet />
      </div>
    </>
  ),
  notes:
    'No words on this one except what is on the page — it plays by itself, about half a minute; '
    + 'narrate over it. The sheet in the middle is the context. Three writers: your laptop on the left, '
    + 'the model — the orb — on the right, and the harness, the terminal window on top. '
    + 'The harness drops the system prompt. You type /loop 10m do the next task. The harness reads it '
    + 'and lifts it onto its own screen: a ten-minute dial and the prompt it will hold. You walk '
    + 'away. The dial runs its lap, and the harness drops the prompt onto the sheet — '
    + 'labelled User, but look at the stamp in the margin and the ink: it is the harness\'s. '
    + 'The model reads the whole sheet, that line included, and cannot tell it was not you. Its '
    + 'answer turns into a tool call; the harness — not the model — lifts it onto its screen and runs '
    + 'it, and the result drops onto the sheet as a page of its own. The model reads on and answers: '
    + 'the queue is empty. And the dial is already on its next lap. That is the whole of /loop: a cron '
    + 'and a prompt sent in your name. All three read the sheet; only the harness has hands off the '
    + 'page — the clock and the tools. '
    + 'Fine print if asked: /loop also runs the prompt once right away, before the first interval — '
    + 'the sheet shows the steady state. Read off the CLI itself (2.1.321): /loop with an interval '
    + 'registers a session-scoped cron task — the same machinery as its CronCreate tool, held in '
    + 'memory unless persist writes it to .claude/scheduled_tasks.json. Without an interval it is '
    + 'self-paced: the model calls ScheduleWakeup and hands the same prompt back. A fire reaches the '
    + 'session as a scheduler event — schedule_wakeup or loop_wakeup — and hooks see it on '
    + 'UserPromptSubmit like any other prompt. And the CLI says the bridge itself: «Runs until you '
    + 'close this session» — which is why my own loop is a runner that opens a pane per task.',
};
