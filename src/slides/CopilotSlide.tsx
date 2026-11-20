import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { SlideDefinition } from '../types/slides';
import { useAnimating } from '../components/frameSettled';
import { exportRegistry } from '../components/exportRegistry';
import { Clip } from './history';
import cursorTab from '../assets/history/cursortab.mp4';

/**
 * From autocomplete to the chat, in one editor — three beats:
 *
 *   1. Autocomplete from a name: you type `function round(n: number) {` and the
 *      editor offers its one-line body from the name and the parameter alone.
 *   2. Autocomplete from a docstring: you document `totals` with a classic JSDoc
 *      — what it returns and how — and it writes the whole body. Tab.
 *   3. The chat: the panel slides in, the docstring lifts off the code into it,
 *      and both bodies fold back to empty — which is exactly the Cursor clip's
 *      opening frame (video/src/CursorTab.tsx, at 0.5 s). The clip then takes
 *      over in place and plays: the same intent, now a conversation, and Tab
 *      writing the same lines again.
 *
 * Built on the clip's own 1920 × 860 canvas (window, tabs, code geometry, file)
 * and scaled exactly like the video (`.ww-history` shows it at full stage
 * width), so the hand-over is invisible. Inspired by the AI-first timeline of
 * the DOU Days 2026 deck (slide 3, «copilot? a cool autocomplete»). A
 * recreation: the file is the clip's invented TypeScript; the «Tab» hints are
 * stage devices.
 */

const EXPORT_MODE =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('export') === '1';
const SLIDE_ID = 'history-copilot';

/* ── the canvas: the Remotion clip's geometry (CursorTab.tsx / Chrome.tsx) ── */
const W = 1920;
const H = 860;
const INSET = 56;
const CHROME = 64;
const TABS = 58;
const PAD = 22;
const ROW = 45;
const GUTTER = 92;
const CHAT_W = 560;
const CHAT_HEAD = 62;
const CHAR_W = 18; // IBM Plex Mono at 30 px

/* ── the file: the clip's cart.ts, built up over the beats ─────────────────── */
const HEAD = ['export type CartItem = { price: number; qty: number };', '', 'const VAT = 0.2;', ''];
/** Beat 1: a name and a parameter, nothing else. */
const ROUND_SIG = 'function round(n: number) {';
/** …and what the autocomplete makes of them: the clip's BODY2. */
const ROUND_BODY = '  return Math.round(n * 100) / 100;';
/** Beat 2: a classic JSDoc — what `totals` does, enough to write it. */
const DOC = [
  '/**',
  ' * Totals for a cart: net, VAT and gross, rounded to cents.',
  " * @param items the cart's line items (price × qty)",
  ' * @returns { net, vat, gross }',
  ' */',
];
const SIG = 'export function totals(items: CartItem[]): Totals {';
/** …and the body it writes: the clip's BODY1, line for line. */
const BODY = [
  '  const net = items.reduce((s, i) => s + i.price * i.qty, 0);',
  '  const vat = round(net * VAT);',
  '  return { net: round(net), vat, gross: round(net) + vat };',
];
const DOC_TEXT = DOC.join('\n');
const DOC_ROW = HEAD.length;
/** Beat 2's view scrolls so the docstring, the signature and the body are all in sight. */
const SCROLL = 4 * ROW;

/* ── one timeline for the three beats (ms) ─────────────────────────────────── */
const TICK_MS = 40;
const TYPE_MS = 45;
const DOC_TYPE_MS = 24;
// beat 1
const R_TYPE = 600;
const R_ENTER = R_TYPE + ROUND_SIG.length * TYPE_MS + 250;
const R_GHOST = R_ENTER + 450;
const R_ACCEPT = R_GHOST + 2000;
const S1 = R_ACCEPT + 500;
// beat 2
const D_TYPE = S1 + 500;
const D_DONE = D_TYPE + DOC_TEXT.length * DOC_TYPE_MS;
const SIG_TYPE = D_DONE + 250;
const SIG_DONE = SIG_TYPE + SIG.length * DOC_TYPE_MS;
const B_ENTER = SIG_DONE + 250;
const B_GHOST = B_ENTER + 500;
const B_ACCEPT = B_GHOST + 2200;
const S2 = B_ACCEPT + 500;
// beat 3
const FLY = S2 + 400;
const FLY_MS = 1200;
const LAND = FLY + FLY_MS;
/** The clip takes over here, from its 0.5 s frame — the one this canvas now shows. */
const HANDOFF = LAND + 250;
const CLIP_FROM = 0.5;
const STAGES = [
  { start: 0, end: S1 },
  { start: S1, end: S2 },
  { start: S2, end: HANDOFF },
];

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const seg = (t: number, a: number, d: number) => clamp01((t - a) / d);
const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
const typedOf = (text: string, g: number, at: number, per: number) =>
  text.slice(0, Math.max(0, Math.floor((g - at) / per)));

/** Each beat plays its own stretch of the one timeline and holds at its end. */
function useBeatClock(stage: number): number {
  const span = STAGES[Math.min(Math.max(stage, 1), 3) - 1];
  const [g, setG] = useState(EXPORT_MODE ? span.end : span.start);
  useEffect(() => {
    if (EXPORT_MODE) {
      setG(span.end);
      return;
    }
    // a step forward carries on from where the last beat stopped; any other jump starts the beat
    setG((cur) => (cur >= span.start && cur <= span.end ? cur : span.start));
    const id = setInterval(() => setG((x) => Math.min(span.end, x + TICK_MS)), TICK_MS);
    return () => clearInterval(id);
  }, [span.start, span.end]);
  return g;
}

/* ── the clip's very small highlighter, as classes ─────────────────────────── */
const KEYWORDS = new Set(['export', 'type', 'const', 'function', 'return', 'import', 'from', 'new']);
const TYPES = new Set(['number', 'string', 'CartItem', 'Totals', 'Math']);
function kindOf(token: string, next: string): string {
  if (KEYWORDS.has(token)) return 'kw';
  if (TYPES.has(token)) return 'type';
  if (/^[0-9.]+$/.test(token)) return 'num';
  if (/^".*"$/.test(token)) return 'str';
  if (next === '(') return 'fn';
  if (/^[A-Za-z_$][\w$]*$/.test(token)) return 'var';
  return 'plain';
}
function Code({ line }: { line: string }) {
  if (/^\s*(\/\*\*|\*)/.test(line)) return <span className="ww-ide__comment">{line}</span>;
  const parts = line.split(/(\s+|[^\w$."]|"[^"]*")/).filter((p) => p !== '');
  return (
    <>
      {parts.map((p, i) => {
        if (/^\s+$/.test(p)) return <span key={i}>{p}</span>;
        const next = parts.slice(i + 1).find((q) => !/^\s+$/.test(q)) ?? '';
        return (
          <span key={i} className={`ww-ide__${kindOf(p, next)}`}>
            {p}
          </span>
        );
      })}
    </>
  );
}

const Caret = () => <span className="ww-ide__caret" />;

function Hint({ label, top }: { label: string; top: number }) {
  return (
    <div className="ww-ide__hint" style={{ top }}>
      <span className="ww-ide__keycap">Tab</span>
      {label}
    </div>
  );
}

/** Scale the 1920 × 860 canvas to the frame's width, as the video is scaled. */
function useFit() {
  const ref = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => setK(el.clientWidth / W);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, k };
}

type Row = {
  text: string;
  caret?: boolean;
  ghost?: boolean;
  added?: boolean;
  /** shrinks away in beat 3 */
  folds?: boolean;
  /** grows in during beat 3, in place of what folds */
  grows?: boolean;
};

/** The file at time g. */
function rowsAt(g: number): Row[] {
  const rows: Row[] = HEAD.map((text) => ({ text }));
  const beat3 = g >= FLY;
  const landed = g >= LAND;

  // beat 2: the docstring, the signature and the body — above `round`
  if (g >= D_TYPE) {
    const typed = typedOf(DOC_TEXT, g, D_TYPE, DOC_TYPE_MS).split('\n');
    const typingDoc = g < D_DONE;
    DOC.forEach((line, i) => {
      if (typingDoc && i >= typed.length) return;
      rows.push({ text: typingDoc ? typed[i] : line, folds: true, caret: typingDoc && i === typed.length - 1 });
    });
    if (g >= SIG_TYPE) {
      rows.push({ text: g >= SIG_DONE ? SIG : typedOf(SIG, g, SIG_TYPE, DOC_TYPE_MS), caret: g < SIG_DONE });
      if (g >= B_ENTER) {
        const ghost = g >= B_GHOST && g < B_ACCEPT;
        const accepted = g >= B_ACCEPT;
        if (ghost || accepted) {
          BODY.forEach((text, i) =>
            rows.push({
              text,
              ghost,
              added: accepted && g < B_ACCEPT + 700,
              folds: true,
              caret: accepted && !beat3 && i === BODY.length - 1,
            }),
          );
        } else {
          rows.push({ text: '  ', caret: true });
        }
        if (beat3) rows.push({ text: '  ', grows: true, caret: landed });
        rows.push({ text: '}' }, { text: '' });
      }
    }
  }

  // beat 1: `round`, from its name
  if (g >= R_TYPE) {
    const sigDone = g >= R_ENTER;
    rows.push({ text: sigDone ? ROUND_SIG : typedOf(ROUND_SIG, g, R_TYPE, TYPE_MS), caret: !sigDone });
    if (sigDone) {
      const ghost = g >= R_GHOST && g < R_ACCEPT;
      const accepted = g >= R_ACCEPT;
      if (ghost || accepted) {
        rows.push({
          text: ROUND_BODY,
          ghost,
          added: accepted && g < R_ACCEPT + 700,
          folds: true,
          caret: accepted && g < D_TYPE,
        });
      } else {
        rows.push({ text: '  ', caret: true });
      }
      if (beat3) rows.push({ text: '  ', grows: true });
      rows.push({ text: '}' });
    }
  }
  return rows;
}

function CopilotSession({ stage }: { stage: number }) {
  const g = useBeatClock(stage);
  const { ref, k } = useFit();
  // beats 1–2 settle themselves (only beat 3's clip seeks, in export); see history.tsx
  useEffect(() => {
    if (!EXPORT_MODE) exportRegistry.markSlideSettled(SLIDE_ID);
  }, []);
  const end = STAGES[Math.min(Math.max(stage, 1), 3) - 1].end;
  useAnimating(g < end);

  const rows = rowsAt(g);
  const fly = ease(seg(g, FLY, FLY_MS));
  const fold = ease(seg(g, FLY + 300, 600));
  const chatW = CHAT_W * ease(seg(g, FLY, 700));
  const flying = g >= FLY && g < LAND;
  const scroll =
    SCROLL * ease(seg(g, D_TYPE + 2 * DOC[1].length * DOC_TYPE_MS, 900)) * (1 - ease(seg(g, FLY + 300, 700)));

  // the hint goes under the ghost it offers
  const ghostRows = rows.map((r, i) => (r.ghost ? i : -1)).filter((i) => i >= 0);
  const hintTop = ghostRows.length ? PAD + (ghostRows[ghostRows.length - 1] + 2) * ROW + 8 - scroll : 0;

  // the docstring block in flight, from its rows to the chat
  const fromY = CHROME + TABS + PAD + DOC_ROW * ROW - SCROLL;
  const widest = Math.max(...DOC.map((l) => l.length)) * CHAR_W;
  const toX = W - 2 * INSET - CHAT_W + 20;
  const toY = CHROME + CHAT_HEAD + 20;
  const toS = (CHAT_W - 40) / widest;

  const clip = stage >= 3 && (EXPORT_MODE || g >= HANDOFF);
  let n = 0;
  return (
    <div className="ww-ide">
      <div className="ww-ide__frame" ref={ref} style={{ height: H * k }}>
        <div className="ww-ide__canvas" style={{ width: W, height: H, transform: `scale(${k})` }}>
          <div className="ww-ide__window" style={{ inset: INSET }}>
            <div className="ww-ide__chrome" style={{ height: CHROME }}>
              <span className="ww-dot ww-dot--red" />
              <span className="ww-dot ww-dot--amber" />
              <span className="ww-dot ww-dot--green" />
              <span className="ww-ide__title">cart.ts — my-shop</span>
            </div>
            <div className="ww-ide__body">
              <div className="ww-ide__editor">
                <div className="ww-ide__tabs" style={{ height: TABS }}>
                  <span className="ww-ide__tab ww-ide__tab--active">cart.ts</span>
                  <span className="ww-ide__tab">routes.ts</span>
                </div>
                <div className="ww-ide__code">
                  <div style={{ padding: `${PAD}px 0`, transform: `translateY(${-scroll}px)` }}>
                    {rows.map((r, i) => {
                      const h = r.grows ? ROW * fold : r.folds && g >= FLY ? ROW * (1 - fold) : ROW;
                      if (h <= 0.5) return null;
                      const leaving = r.folds && g >= FLY;
                      if (!leaving) n++;
                      return (
                        <div
                          key={i}
                          className={`ww-ide__row${r.added ? ' ww-ide__row--added' : ''}`}
                          style={{ height: h, lineHeight: `${ROW}px` }}
                        >
                          <span className="ww-ide__ln" style={{ width: GUTTER }}>
                            {leaving ? '' : n}
                          </span>
                          <span className={`ww-ide__src${r.ghost ? ' ww-ide__src--ghost' : ''}`}>
                            {!leaving && (r.ghost ? r.text : <Code line={r.text} />)}
                            {r.caret && <Caret />}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {g >= R_GHOST && g < R_ACCEPT && <Hint label="to accept" top={hintTop} />}
                  {g >= B_GHOST && g < B_ACCEPT && <Hint label={`to accept ${BODY.length} lines`} top={hintTop} />}
                </div>
              </div>
              <div className="ww-ide__chat" style={{ width: chatW }}>
                <div className="ww-ide__chathead" style={{ height: CHAT_HEAD }}>
                  <span>CHAT</span>
                  <span>claude-3.5-sonnet ⌄</span>
                </div>
                <div className="ww-ide__chatbody" />
                <div className="ww-ide__ask">Ask anything · @ to add context</div>
              </div>
            </div>
            {/* the docstring in flight: off the code, into the chat, where the clip types it as a prompt */}
            {flying && (
              <div
                className="ww-ide__flying"
                style={{
                  left: lerp(GUTTER, toX, fly),
                  top: lerp(fromY, toY, fly),
                  transform: `scale(${lerp(1, toS, fly)})`,
                  opacity: 1 - seg(g, LAND - 350, 350),
                }}
              >
                {DOC.map((l) => (
                  <div key={l}>
                    <Code line={l} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* beat 3's second half: the Cursor clip itself, over the very frame it opens on */}
        {clip && (
          <div className="ww-ide__clip">
            <Clip src={cursorTab} slideId={SLIDE_ID} from={CLIP_FROM} />
          </div>
        )}
      </div>
    </div>
  );
}

export const CopilotSlide: SlideDefinition = {
  id: SLIDE_ID,
  asyncSettle: true,
  maxRevealStages: 3,
  initialRevealStage: 1,
  content: ({ revealStage }) => <CopilotSession stage={revealStage} />,
  notes:
    'Before agents, the first AI most of us used every day: autocomplete. GitHub Copilot — technical '
    + 'preview June 2021, generally available June 2022, older than ChatGPT. '
    + 'Beat 1 — a name and a parameter, round(n), and it writes the body. «Copilot? A cool autocomplete.» '
    + '[reveal] Beat 2 — document the function, a classic docstring: net, VAT and gross, rounded to cents — '
    + 'and it writes the whole body. Tab. '
    + '[reveal] Beat 3 — and then the same intent moves out of the comment and into a chat: Cursor. First '
    + 'the chat on the right: you agree WHAT you want before a line is written. Then Tab — not one line '
    + 'but a whole block, then Tab again to jump to the next place the change needs, and finally the '
    + 'portal at the bottom: the edit this one forces in another file. '
    + 'Recreated: the editor and the file are the Cursor clip\'s (the behaviour is from Cursor\'s own docs, '
    + 'the code is invented); the Tab hints on the first two beats are mine.',
};
