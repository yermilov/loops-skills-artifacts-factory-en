import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
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
 * How a coding agent works — in the context-sheet language of «A loop is a
 * cron» (components/ctxScene.tsx): a sheet of paper, the context, filling up
 * from three writers, played in one go, no words but the ones on the page.
 *
 *  · the harness drops the system prompt — and in it, the TOOLS it offers;
 *  · the user types the task on the laptop;
 *  · the model reads the sheet and streams its answer — which is not prose
 *    but a tool call, <|tool_call|> Read(cart.ts) <|end_call|>;
 *  · the harness — not the model — reads the call, lifts it onto its screen,
 *    really runs it ($ cat cart.ts) and drops the result onto the sheet;
 *  · Edit, then Bash, the same way; then the model answers in prose, and only
 *    that reaches the user's screen.
 *
 * The sheet outgrows its page, so it scrolls the way a context does: the
 * oldest lines go up out of view, still there.
 *
 * The honest caveat, which belongs in `notes` and in his mouth rather than on
 * the frame: the real protocol is structured tool-call blocks in the API, not
 * literal tags in the prompt. The tags are that mechanism made legible from
 * the back row; everything they stand for is real.
 */

// ── the script ──────────────────────────────────────────────────────────────
type Turn = { who: Who; label: string; text: string; call?: string; runs?: string };

const SCENE: Turn[] = [
  { who: 'harness', label: 'System:', text: 'You are Claude Code. Tools: Read, Edit, Bash. …' },
  { who: 'user', label: 'User:', text: 'fix the VAT bug in cart.ts' },
  { who: 'model', label: 'Assistant:', text: '<|tool_call|> Read(cart.ts) <|end_call|>', call: 'Read(cart.ts)', runs: '$ cat cart.ts' },
  { who: 'harness', label: 'Tool:', text: 'total = sum(items) * VAT - discount' },
  { who: 'model', label: 'Assistant:', text: '<|tool_call|> Edit(cart.ts) <|end_call|>', call: 'Edit(cart.ts)', runs: '$ patch cart.ts' },
  { who: 'harness', label: 'Tool:', text: '1 line changed' },
  { who: 'model', label: 'Assistant:', text: '<|tool_call|> Bash(npm test) <|end_call|>', call: 'Bash(npm test)', runs: '$ npm test' },
  { who: 'harness', label: 'Tool:', text: '12 passed, 0 failed' },
  { who: 'model', label: 'Assistant:', text: 'Fixed — VAT now applies after the discount.' },
];
/**
 * The system prompt in full, as the harness first drops it: the preface and
 * the three tool declarations it honours. Once the user starts typing it
 * collapses to the one-line summary that is SCENE[0], to make room for the
 * turns — it is still all there, only folded.
 */
const FULL_PROMPT: { label?: string; text: string }[] = [
  { label: 'System:', text: 'You are Claude Code, a coding assistant.' },
  { text: 'To read a file, write: <|tool_call|> Read(path) <|end_call|>' },
  { text: 'To change it: <|tool_call|> Edit(path, old, new) <|end_call|>' },
  { text: 'To run a command: <|tool_call|> Bash(cmd) <|end_call|>' },
  { text: 'I paste what happened back as «Tool: …».' },
];

/** a turn's units: characters when typed, word tokens otherwise */
const units = (t: Turn) => (t.who === 'user' ? [...t.text] : t.text.split(' ').map((w, i, a) => (i < a.length - 1 ? `${w} ` : w)));
const UNITS = SCENE.map(units);
/** where the call sits inside a model turn: the unit the harness lifts */
const CALL_UNIT = 1;

// ── timing, in ms ───────────────────────────────────────────────────────────
const LEAD = 300;
const TAIL = 500;
const SLAB_STAGGER = 40;
const SLAB_DROP = 320;
const TYPE_MS = 60;
const READ_MS = 900; // the model reading the sheet
const FLY_EVERY = 230;
const FLY_MS = 330;
const DRY_MS = 450;
const CALL_READ_MS = 600; // the harness reading the call
const LIFT_MS = 600;
const RUN_MS = 1100;
const FALL_MS = 520;
const SHOW_MS = 1400; // the answer reaching the user's screen
const SCROLL_MS = 450;
const LINE_STAGGER = 260; // the full prompt drops in line by line
const HOLD_PROMPT_MS = 2600; // time to read the full prompt before it folds
const COLLAPSE_MS = 1400;

const slabMs = (i: number) => (UNITS[i].length - 1) * SLAB_STAGGER + SLAB_DROP;
const streamMs = (i: number) => (UNITS[i].length - 1) * FLY_EVERY + FLY_MS;

/** One phase of the play: a writer doing one thing to one turn. */
type Kind = 'slab' | 'collapse' | 'type' | 'read' | 'stream' | 'readcall' | 'lift' | 'run' | 'fall' | 'show';
type Phase = { kind: Kind; turn: number; at: number; ms: number };

const PHASES: Phase[] = [];
/** when each turn starts appearing on the sheet */
const WRITTEN_AT: number[] = [];
let clock = LEAD;
const add = (kind: Kind, turn: number, ms: number, gap = 0) => {
  PHASES.push({ kind, turn, at: clock, ms });
  clock += ms + gap;
};
SCENE.forEach((turn, i) => {
  if (i === 0) {
    WRITTEN_AT[i] = clock;
    add('slab', i, (FULL_PROMPT.length - 1) * LINE_STAGGER + SLAB_DROP, HOLD_PROMPT_MS);
    add('collapse', i, COLLAPSE_MS, 150);
  } else if (turn.who === 'user') {
    WRITTEN_AT[i] = clock;
    add('type', i, UNITS[i].length * TYPE_MS, 350);
  } else if (turn.who === 'model') {
    add('read', i, READ_MS); // the model reads everything above `turn`
    WRITTEN_AT[i] = clock;
    add('stream', i, streamMs(i) + DRY_MS, 150);
    add('readcall', i, CALL_READ_MS);
    if (turn.call) {
      add('lift', i, LIFT_MS);
      add('run', i, RUN_MS);
      WRITTEN_AT[i + 1] = clock;
      add('fall', i + 1, FALL_MS); // `turn` here is the result line it lands on
      add('slab', i + 1, slabMs(i + 1), 300);
    } else {
      add('show', i, SHOW_MS);
    }
  }
});
const TOTAL = clock + TAIL;

// ── where things sit on the harness's screen ────────────────────────────────
const CALL_SLOT: Pt = [WIN.x + 210, 52];
const RUN_SLOT: Pt = [WIN.x + 210, 112];
/** the visible height of the sheet's writing area (its padding is 40 + 40) */
const VIEW_H = SHEET.h - 80;
const TEXT_TOP = SHEET.y + 40;
/** how many «characters» of the answer the laptop's screen lines can show */
const SCREEN_UNITS = 36;

function Scene() {
  const t = useOneShotClock(TOTAL);
  const done = t >= TOTAL;
  useAnimating(!done);

  const now = PHASES.filter((p) => t >= p.at && t < p.at + p.ms);
  const active = (kind: Kind) => now.find((p) => p.kind === kind);
  const phaseOf = (kind: Kind, turn: number) => PHASES.find((p) => p.kind === kind && p.turn === turn)!;

  // ── how much of each turn is written
  const shownOf = (i: number): number => {
    const n = UNITS[i].length;
    if (done) return n;
    const who = SCENE[i].who;
    if (who === 'user') {
      const p = phaseOf('type', i);
      return Math.min(n, Math.max(0, Math.floor((t - p.at) / TYPE_MS) + 1));
    }
    if (who === 'model') {
      const p = phaseOf('stream', i);
      return Math.min(n, Math.max(0, Math.floor((t - p.at - FLY_MS) / FLY_EVERY) + 1));
    }
    return t < phaseOf('slab', i).at ? 0 : n;
  };

  // ── measured slots of every unit (laid out from the start, hidden till written)
  const root = useRef<HTMLDivElement>(null);
  const slots = useUnitSlots(root);

  // ── the full system prompt: open until the user's turn, then folded into
  //    SCENE[0]. Later turns are laid out (and measured) in the folded state
  //    and pushed down by the difference while it is open.
  const fullRef = useRef<HTMLDivElement>(null);
  const foldedRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const restRef = useRef<HTMLDivElement>(null);
  const [heights, setHeights] = useState({ full: 0, folded: 0, rest: 0 });
  useLayoutEffect(() => {
    setHeights({
      full: fullRef.current?.offsetHeight ?? 0,
      folded: foldedRef.current?.offsetHeight ?? 0,
      rest: restRef.current?.offsetHeight ?? 0,
    });
  }, []);
  const collapse = phaseOf('collapse', 0);
  // The fold, in two moves: (1) the declarations roll up under the first line
  // like a blind — clipped, never overlapping — the turns below rising with
  // them; (2) the first line swaps for the one-line summary.
  const rolled = seg(t, collapse.at, collapse.ms * 0.7);
  // ease-in-out, so the blind is SEEN moving rather than snapping shut
  const stack = done ? 1 : rolled * rolled * (3 - 2 * rolled);
  const swap = done ? 1 : seg(t, collapse.at + collapse.ms * 0.7, collapse.ms * 0.3);
  const open = 1 - stack;
  const extra = Math.max(0, heights.full - heights.folded) * open;
  // a clean hand-off: the full prompt fades out in the first half, the one-liner in over the second
  // the swap is sequential, never a cross-fade: out first, then in
  const fullShown = 1 - Math.min(1, swap * 2);
  const foldedShown = Math.max(0, swap * 2 - 1);

  // ── the sheet scrolls like a context: once a turn would run off the page,
  //    everything moves up so its last line sits at the bottom
  const bottomOf = (i: number) => {
    let b = 0;
    UNITS[i].forEach((_, k) => {
      const r = slots[`${i}-${k}`];
      if (r) b = Math.max(b, r.y + r.h - TEXT_TOP);
    });
    return b;
  };
  let scroll = 0;
  SCENE.forEach((_, i) => {
    const need = Math.max(0, bottomOf(i) - VIEW_H + 6);
    if (need > 0) scroll = Math.max(scroll, need * (done ? 1 : out(seg(t, WRITTEN_AT[i] - SCROLL_MS, SCROLL_MS))));
  });
  const unitRect = (ti: number, ui: number) => {
    const r = slots[`${ti}-${ui}`];
    return r ? { ...r, y: r.y - scroll + (ti > 0 ? extra : 0) } : undefined;
  };

  // ── the reading bands
  type Band = { turns: number[]; from: number; ms: number; ink: Who };
  const bands: Band[] = [];
  const reading = active('read');
  if (reading) bands.push({ turns: SCENE.map((_, i) => i).filter((i) => i < reading.turn), from: reading.at, ms: reading.ms, ink: 'model' });
  const readingCall = active('readcall');
  if (readingCall) bands.push({ turns: [readingCall.turn], from: readingCall.at, ms: readingCall.ms, ink: 'harness' });
  const tint = (ti: number, ui: number): { ink: Who; a: number } | null => {
    for (const b of bands) {
      const k = b.turns.indexOf(ti);
      if (k < 0) continue;
      const total = b.turns.reduce((s, x) => s + UNITS[x].length, 0);
      const before = b.turns.slice(0, k).reduce((s, x) => s + UNITS[x].length, 0);
      const pos = seg(t, b.from, b.ms) * (total + 6);
      const d = pos - (before + ui);
      if (d >= 0 && d < 6) return { ink: b.ink, a: 0.32 * (1 - d / 6) };
    }
    return null;
  };

  // ── the writers' states
  const typing = active('type');
  const showing = active('show');
  const streaming = active('stream');
  const userLit = !done && Boolean(typing || showing);
  const harnessLit = !done && Boolean(active('slab') || readingCall || active('lift') || active('run') || active('fall') || showing);
  const modelLit = !done && Boolean(reading || streaming);
  // the laptop's screen: the user's own typing, then — at the very end — the answer
  // once the reply has reached the screen it stays there (through the tail, and in the PDF)
  const shown = PHASES.find((p) => p.kind === 'show');
  const replied = done || (shown !== undefined && t >= shown.at + shown.ms);
  const screen = showing
    ? Math.round(seg(t, showing.at, showing.ms * 0.7) * SCREEN_UNITS)
    : replied
      ? SCREEN_UNITS
      : typing
        ? shownOf(typing.turn)
        : 0;
  let breath = 0;
  if (streaming) {
    const local = t - streaming.at;
    const k = Math.floor(local / FLY_EVERY);
    breath = local >= 0 && k < UNITS[streaming.turn].length ? Math.sin(seg(local - k * FLY_EVERY, 0, FLY_EVERY) * Math.PI) : 0;
  }

  // ── things on the harness's screen, and in flight
  const flights: ReactNode[] = [];
  if (!done) {
    if (streaming) {
      UNITS[streaming.turn].forEach((u, k) => {
        const p = seg(t, streaming.at + k * FLY_EVERY, FLY_MS);
        const r = unitRect(streaming.turn, k);
        if (p > 0 && p < 1 && r) {
          const e = out(p);
          flights.push(
            <Chip key={`fly-${k}`} text={u.trim()} who="model" special={isSpecial(u)} at={[lerp(ORB[0] - ORB_D / 2, r.x, e), lerp(ORB[1] - 24, r.y, e) - Math.sin(Math.PI * p) * 34]} />,
          );
        }
      });
    }
    const lifting = active('lift');
    if (lifting) {
      const p = out(seg(t, lifting.at, lifting.ms));
      const from = unitRect(lifting.turn, CALL_UNIT);
      if (from) {
        flights.push(
          <Chip key="lift" text={SCENE[lifting.turn].call!} who="model" special at={[lerp(from.x, CALL_SLOT[0], p), lerp(from.y, CALL_SLOT[1], p) - Math.sin(Math.PI * p) * 40]} />,
        );
      }
    }
    const running = active('run');
    if (running) {
      const turn = SCENE[running.turn];
      const beat = Math.abs(Math.sin(seg(t, running.at, running.ms) * Math.PI * 3));
      flights.push(<Chip key="call" text={turn.call!} who="model" special at={CALL_SLOT} />);
      flights.push(<Chip key="run" text={turn.runs!} who="harness" at={RUN_SLOT} scale={1 + beat * 0.06} />);
    }
    const falling = active('fall');
    if (falling) {
      const p = out(seg(t, falling.at, falling.ms));
      const to = unitRect(falling.turn, 0);
      if (to) flights.push(<Chip key="fall" text={SCENE[falling.turn].text} who="harness" at={[lerp(RUN_SLOT[0], to.x, p), lerp(RUN_SLOT[1], to.y, p)]} />);
    }
  }

  // ── the sheet's text
  const lines = SCENE.map((turn, ti) => {
    const n = shownOf(ti);
    const u = UNITS[ti];
    const started = n > 0;
    const slab = turn.who === 'harness' ? phaseOf('slab', ti) : undefined;
    const stream = turn.who === 'model' ? phaseOf('stream', ti) : undefined;
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
          if (shown && !done && slab && ti > 0 && t < slab.at + slab.ms) {
            const p = out(seg(t, slab.at + ui * SLAB_STAGGER, SLAB_DROP));
            style.transform = `translateY(${(1 - p) * -46}px)`;
            style.opacity = p;
          }
          if (shown && !done && stream && !isSpecial(text)) {
            const wet = 1 - seg(t, stream.at + ui * FLY_EVERY + FLY_MS, DRY_MS);
            if (wet > 0) {
              style.background = `color-mix(in srgb, var(--ww-magenta) ${Math.round(wet * 100)}%, transparent)`;
              style.color = wet > 0.5 ? 'var(--ww-white)' : undefined;
            }
          }
          const tt = shown && !done ? tint(ti, ui) : null;
          if (tt && !style.background) {
            style.background = `color-mix(in srgb, var(--ww-${tt.ink === 'harness' ? 'violet' : 'magenta'}) ${Math.round(tt.a * 100)}%, transparent)`;
          }
          return (
            <span key={ui} data-u={`${ti}-${ui}`} className={cls} style={style}>
              {text}
            </span>
          );
        })}
        {typing && typing.turn === ti && <span className="ww-ctx__caret" />}
      </div>
    );
  });

  const promptLine = (k: number) => {
    const line = FULL_PROMPT[k];
    const slab = phaseOf('slab', 0);
    const p = done ? 1 : out(seg(t, slab.at + k * LINE_STAGGER, SLAB_DROP));
    return (
      <div key={k} className="ww-ctx__turn ww-ctx__turn--harness" style={{ opacity: p, transform: `translateY(${(1 - p) * -46}px)` }}>
        {k === 0 && (
          <span className="ww-ctx__stamp ww-ctx__stamp--harness">
            <Stamp who="harness" />
          </span>
        )}
        {line.label && <span className="ww-ctx__label">{line.label} </span>}
        {line.text.split(' ').map((w, i) =>
          isSpecial(w) ? (
            <span key={i} className="ww-ctx__u ww-ctx__u--special">
              {w}
            </span>
          ) : (
            <span key={i}>{`${w} `}</span>
          ),
        )}
      </div>
    );
  };

  return (
    <div className="ww-ctx" ref={root}>
      <div className="ww-ctx__sheet ww-ctx__sheet--scroll" style={{ left: SHEET.x, top: SHEET.y, width: SHEET.w, height: SHEET.h }}>
        <div className="ww-ctx__sheetin" style={{ transform: `translateY(${-scroll}px)` }}>
          <div className="ww-ctx__fullprompt" ref={fullRef} style={{ visibility: fullShown > 0 ? 'visible' : 'hidden' }}>
            {/* line 0 stays put; the declarations under it roll up into it like a blind */}
            <div ref={headRef} style={{ opacity: fullShown }}>
              {promptLine(0)}
            </div>
            <div className="ww-ctx__fold" style={{ height: heights.rest ? heights.rest * (1 - stack) : undefined }}>
              <div ref={restRef} style={{ transform: `translateY(${-heights.rest * stack}px)`, opacity: 1 - seg(stack, 0.6, 0.4) }}>
                {FULL_PROMPT.slice(1).map((_, k) => promptLine(k + 1))}
              </div>
            </div>
          </div>
          <div ref={foldedRef} style={{ opacity: foldedShown }}>
            {lines[0]}
          </div>
          <div style={{ transform: `translateY(${extra}px)` }}>{lines.slice(1)}</div>
        </div>
      </div>

      {/* the harness: a terminal window; its screen is where it runs things */}
      <HarnessWindow lit={harnessLit} />

      {/* the user's laptop: lit while typing, and again when the answer — and
          only the answer — reaches its screen */}
      <Laptop lit={userLit} typed={screen} />
      <Orb lit={modelLit} breath={breath} />
      <Names />

      {flights}
    </div>
  );
}

export const CodingAgentSlide: SlideDefinition = {
  id: 'coding-agent',
  content: () => (
    <>
      <CornerRings corner="top-right" />
      <div className="ww-ctxstage">
        <Scene />
      </div>
    </>
  ),
  notes:
    'Coding agent — still just predicts the next token. It plays by itself, about half a minute; '
    + 'narrate over it. Same sheet as before: the context. The harness drops the system prompt — and '
    + 'look, it now lists TOOLS: Read, Edit, Bash. You type the task. The model reads the whole sheet '
    + 'and does the only thing it ever does — predicts the next tokens; only now the most likely next '
    + 'tokens are a tool call. It cannot read the file. The harness reads that call, lifts it onto its '
    + 'own screen and really runs it — cat cart.ts — and drops the result onto the sheet as a page of '
    + 'its own. The model reads on and asks for an Edit; the harness patches the file. Then Bash, npm '
    + 'test — twelve passed. Only then does the model answer in prose, and that one line is all that '
    + 'reaches your screen: you never see any of the rest. That alternation — model writes a call, '
    + 'harness writes the result — is the whole of a coding agent. And this is where the permission '
    + 'box lives: between the call and the harness obeying it. '
    + 'Caveat to say out loud: the real protocol is structured tool-call blocks in the API, not literal '
    + 'tags in the prompt — the tags are that mechanism made readable from the back row. Everything '
    + 'they stand for is real, and early agents really were built this way, with tags in the prompt.',
};
