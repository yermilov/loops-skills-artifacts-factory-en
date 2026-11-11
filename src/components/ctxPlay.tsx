/**
 * A context-sheet PLAY: the shared engine behind the scenes that show a harness
 * fetching things from the outside (MCP servers, a CLAUDE.md on disk) and
 * pasting them into the context. A scene is just data — the sheet's turns and
 * the cards in the corners — and this turns it into one timeline, played once
 * off a single clock (see ctxScene.tsx for the visual language).
 *
 * What each kind of turn does:
 *  · harness, no `from`  — the harness drops it onto the sheet (a slab);
 *  · harness, `from: c`  — the harness asks card c (`ask`, e.g. «tools/list»),
 *                          the card works, its answer flies down onto the sheet;
 *  · user                — typed on the laptop, one character at a time;
 *  · model               — the model reads the sheet, streams the turn, the
 *                          harness reads it; then
 *                            with `call` + `card`: the harness lifts the call,
 *                              forwards it (`ask`) to that card, and the card's
 *                              answer becomes the NEXT turn;
 *                            with `call` alone: the scene ends on the call;
 *                            with no call: the answer reaches the laptop.
 */
import { useRef, type CSSProperties, type ReactNode } from 'react';
import { useAnimating } from './frameSettled';
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
  ServerCard,
  SHEET,
  Stamp,
  useOneShotClock,
  useUnitSlots,
  WIN,
  type CardInk,
  type ChipInk,
  type Pt,
  type Rect,
  type Who,
} from './ctxScene';

export type PlayTurn = {
  who: Who;
  label: string;
  text: string;
  /** this turn is a card's answer, fetched by the harness */
  from?: number;
  /** what the harness says to the card to get it (default «tools/list») */
  ask?: string;
  /** the chip that flies down from the card (default: the turn's text) */
  carry?: string;
  /** a model turn's call: what the harness lifts onto its screen */
  call?: string;
  /** …and the card it forwards it to */
  card?: number;
};

export type PlayCard = {
  name: string;
  via: string;
  icon: 'remote' | 'local' | 'file';
  ink: CardInk;
  box: Rect;
};

/** Card corners on the 1700 × 870 canvas, either side of the harness window. */
const CARD_W = 440;
export const CARD_LEFT: Rect = { x: 30, y: 30, w: CARD_W, h: 132 };
export const CARD_RIGHT: Rect = { x: 1700 - 30 - CARD_W, y: 30, w: CARD_W, h: 132 };

// ── timing, in ms ───────────────────────────────────────────────────────────
const LEAD = 300;
const TAIL = 500;
const SLAB_STAGGER = 40;
const SLAB_DROP = 320;
const TYPE_MS = 60;
const READ_MS = 900;
const FLY_EVERY = 230;
const FLY_MS = 330;
const DRY_MS = 450;
const CALL_READ_MS = 600;
const LIFT_MS = 600;
const ASK_MS = 650; // a request flying from the harness to a card
const THINK_MS = 700; // the card working
const ANSWER_MS = 700; // its answer flying down onto the sheet
const SHOW_MS = 1400;
const SCROLL_MS = 450;
const CALL_UNIT = 1;

type Kind = 'slab' | 'type' | 'read' | 'stream' | 'readcall' | 'lift' | 'ask' | 'think' | 'answer' | 'show';
/** `turn` is the sheet line the phase writes or reads; `card` the card it involves */
type Phase = { kind: Kind; turn: number; at: number; ms: number; card?: number; label?: string };

const unitsOf = (t: PlayTurn) => (t.who === 'user' ? [...t.text] : t.text.split(' ').map((w, i, a) => (i < a.length - 1 ? `${w} ` : w)));

/** The whole play as a timeline — pure, so a scene builds it once at module load. */
export function buildPlay(scene: PlayTurn[]) {
  const UNITS = scene.map(unitsOf);
  const slabMs = (i: number) => (UNITS[i].length - 1) * SLAB_STAGGER + SLAB_DROP;
  const streamMs = (i: number) => (UNITS[i].length - 1) * FLY_EVERY + FLY_MS;
  const PHASES: Phase[] = [];
  const WRITTEN_AT: number[] = [];
  let clock = LEAD;
  const add = (kind: Kind, turn: number, ms: number, gap = 0, extra: Partial<Phase> = {}) => {
    PHASES.push({ kind, turn, at: clock, ms, ...extra });
    clock += ms + gap;
  };
  scene.forEach((turn, i) => {
    if (turn.who === 'harness' && turn.from !== undefined) {
      if (WRITTEN_AT[i] !== undefined) return; // already written as a forwarded call's answer
      add('ask', i, ASK_MS, 0, { card: turn.from, label: turn.ask ?? 'tools/list' });
      add('think', i, THINK_MS, 0, { card: turn.from });
      WRITTEN_AT[i] = clock;
      add('answer', i, ANSWER_MS, 0, { card: turn.from });
      add('slab', i, slabMs(i), 350);
    } else if (turn.who === 'harness') {
      if (WRITTEN_AT[i] !== undefined) return;
      WRITTEN_AT[i] = clock;
      add('slab', i, slabMs(i), 500);
    } else if (turn.who === 'user') {
      WRITTEN_AT[i] = clock;
      add('type', i, UNITS[i].length * TYPE_MS, 350);
    } else {
      add('read', i, READ_MS);
      WRITTEN_AT[i] = clock;
      add('stream', i, streamMs(i) + DRY_MS, 150);
      add('readcall', i, CALL_READ_MS);
      if (turn.call && turn.card !== undefined) {
        add('lift', i, LIFT_MS);
        add('ask', i + 1, ASK_MS, 0, { card: turn.card, label: scene[i + 1]?.ask ?? 'tools/call' });
        add('think', i + 1, THINK_MS + 300, 0, { card: turn.card });
        WRITTEN_AT[i + 1] = clock;
        add('answer', i + 1, ANSWER_MS, 0, { card: turn.card });
        add('slab', i + 1, slabMs(i + 1), 300);
      } else if (!turn.call) {
        add('show', i, SHOW_MS);
      }
    }
  });
  return { UNITS, PHASES, WRITTEN_AT, TOTAL: clock + TAIL };
}

// ── the harness's screen ────────────────────────────────────────────────────
const CALL_SLOT: Pt = [WIN.x + 210, 52];
const ASK_FROM: Pt = [WIN.x + 230, 112];
const VIEW_H = SHEET.h - 80;
const TEXT_TOP = SHEET.y + 40;
const SCREEN_UNITS = 36;

const cardAt = (c: PlayCard): Pt => [c.box.x + c.box.w / 2 - 70, c.box.y + c.box.h + 10];

export function CtxPlay({ scene, cards, play }: { scene: PlayTurn[]; cards: PlayCard[]; play: ReturnType<typeof buildPlay> }) {
  const { UNITS, PHASES, WRITTEN_AT, TOTAL } = play;
  const t = useOneShotClock(TOTAL);
  const done = t >= TOTAL;
  useAnimating(!done);

  const now = PHASES.filter((p) => t >= p.at && t < p.at + p.ms);
  const active = (kind: Kind) => now.find((p) => p.kind === kind);
  const phaseOf = (kind: Kind, turn: number) => PHASES.find((p) => p.kind === kind && p.turn === turn);

  const shownOf = (i: number): number => {
    const n = UNITS[i].length;
    if (done) return n;
    const who = scene[i].who;
    if (who === 'user') return Math.min(n, Math.max(0, Math.floor((t - phaseOf('type', i)!.at) / TYPE_MS) + 1));
    if (who === 'model') return Math.min(n, Math.max(0, Math.floor((t - phaseOf('stream', i)!.at - FLY_MS) / FLY_EVERY) + 1));
    return t < phaseOf('slab', i)!.at ? 0 : n;
  };

  const root = useRef<HTMLDivElement>(null);
  const slots = useUnitSlots(root);

  // ── the sheet scrolls like a context
  const bottomOf = (i: number) => {
    let b = 0;
    UNITS[i].forEach((_, k) => {
      const r = slots[`${i}-${k}`];
      if (r) b = Math.max(b, r.y + r.h - TEXT_TOP);
    });
    return b;
  };
  let scroll = 0;
  scene.forEach((_, i) => {
    const need = Math.max(0, bottomOf(i) - VIEW_H + 6);
    if (need > 0) scroll = Math.max(scroll, need * (done ? 1 : out(seg(t, WRITTEN_AT[i] - SCROLL_MS, SCROLL_MS))));
  });
  const unitRect = (ti: number, ui: number) => {
    const r = slots[`${ti}-${ui}`];
    return r ? { ...r, y: r.y - scroll } : undefined;
  };

  // ── the reading bands
  type Band = { turns: number[]; from: number; ms: number; ink: Who };
  const bands: Band[] = [];
  const reading = active('read');
  if (reading) bands.push({ turns: scene.map((_, i) => i).filter((i) => i < reading.turn), from: reading.at, ms: reading.ms, ink: 'model' });
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
  const asking = active('ask');
  const thinking = active('think');
  const answering = active('answer');
  const userLit = !done && Boolean(typing || showing);
  const harnessLit = !done && Boolean(active('slab') || readingCall || active('lift') || asking || answering || showing);
  const modelLit = !done && Boolean(reading || streaming);
  const cardLit = (c: number) => !done && [asking, thinking, answering].some((p) => p && p.card === c);
  const cardPulse = (c: number) =>
    thinking && thinking.card === c ? Math.abs(Math.sin(seg(t, thinking.at, thinking.ms) * Math.PI * 3)) : 0;
  // once the reply has reached the screen it stays there (through the tail, and in the PDF)
  const shown = PHASES.find((p) => p.kind === 'show');
  const replied = shown !== undefined && (done || t >= shown.at + shown.ms);
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

  // ── on the harness's screen, and in flight
  const flights: ReactNode[] = [];
  const fly = (key: string, text: string, ink: ChipInk, from: Pt, to: Pt, p: number, special = false) =>
    flights.push(<Chip key={key} text={text} who={ink} special={special} at={[lerp(from[0], to[0], p), lerp(from[1], to[1], p) - Math.sin(Math.PI * p) * 40]} />);
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
    // the call the model wrote, lifted onto the harness's screen; held there until the answer lands
    const lifting = active('lift');
    if (lifting) {
      const from = unitRect(lifting.turn, CALL_UNIT);
      if (from) fly('lift', scene[lifting.turn].call!, 'model', [from.x, from.y], CALL_SLOT, out(seg(t, lifting.at, lifting.ms)), true);
    }
    PHASES.filter((p) => p.kind === 'lift').forEach((held) => {
      const until = phaseOf('answer', held.turn + 1);
      if (until && t >= held.at + held.ms && t < until.at + until.ms) {
        flights.push(<Chip key={`held-${held.turn}`} text={scene[held.turn].call!} who="model" special at={CALL_SLOT} />);
      }
    });
    // a request: harness → card
    if (asking) fly('ask', asking.label!, 'harness', ASK_FROM, cardAt(cards[asking.card!]), out(seg(t, asking.at, asking.ms)));
    // the card's answer: card → the sheet line it becomes
    if (answering) {
      const to = unitRect(answering.turn, 0);
      const turn = scene[answering.turn];
      const card = cards[answering.card!];
      if (to) fly('answer', turn.carry ?? turn.text, card.ink, cardAt(card), [to.x, to.y], out(seg(t, answering.at, answering.ms)));
    }
  }

  // ── the sheet's text
  const lines = scene.map((turn, ti) => {
    const n = shownOf(ti);
    const u = UNITS[ti];
    const started = n > 0;
    const slab = turn.who === 'harness' ? phaseOf('slab', ti) : undefined;
    const stream = turn.who === 'model' ? phaseOf('stream', ti) : undefined;
    const fromInk = turn.from !== undefined ? cards[turn.from].ink : undefined;
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
          if (fromInk) cls += ` ww-ctx__u--${fromInk}`;
          if (text.trim() === '##') cls += ' ww-ctx__u--hash';
          if (shown && !done && slab && t < slab.at + slab.ms) {
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
          // «¶» is a line break in a turn's text (a list the harness pastes, one item a line)
          if (text.trim() === '¶') return <br key={ui} data-u={`${ti}-${ui}`} />;
          const unit = (
            <span key={ui} data-u={`${ti}-${ui}`} className={cls} style={style}>
              {text}
            </span>
          );
          // a pasted markdown file keeps its shape: every heading after the first starts a line
          return text.trim() === '##' && ui > 0 ? [<br key={`br-${ui}`} />, unit] : unit;
        })}
        {typing && typing.turn === ti && <span className="ww-ctx__caret" />}
      </div>
    );
  });

  return (
    <div className="ww-ctx" ref={root}>
      <div className="ww-ctx__sheet ww-ctx__sheet--scroll" style={{ left: SHEET.x, top: SHEET.y, width: SHEET.w, height: SHEET.h }}>
        <div className="ww-ctx__sheetin" style={{ transform: `translateY(${-scroll}px)` }}>
          {lines}
        </div>
      </div>

      <HarnessWindow lit={harnessLit} />
      {cards.map((c, i) => (
        <ServerCard key={c.name} box={c.box} name={c.name} via={c.via} icon={c.icon} ink={c.ink} lit={cardLit(i)} pulse={cardPulse(i)} />
      ))}

      <Laptop lit={userLit} typed={screen} />
      <Orb lit={modelLit} breath={breath} />
      <Names />

      {flights}
    </div>
  );
}
