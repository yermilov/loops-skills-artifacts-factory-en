import { ReactNode } from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { Window } from './Chrome';
import { PAPER, MONO, SANS, typed, typedFor } from './theme';

/**
 * The editor everyone moved into between the terminal prototypes and the
 * agents: a chat on the right to agree WHAT to build, and a tab model on the
 * left that writes whole blocks, then jumps — down the file, and into the next
 * file the change breaks.
 *
 * RECONSTRUCTION, carried by the slide's `notes` and spoken aloud rather than
 * printed on the frame. No recorded session is replayed: the behaviour is
 * Cursor's documented Tab (multi-line edits, jump to next edit, and the
 * cross-file «portal window» at the bottom of the editor — cursor.com/help/
 * ai-features/tab), and the code in the demo is invented, neutral TypeScript.
 */

/* Cursor's dark theme, as VS Code's Dark+ with Cursor's flatter chrome. */
const UI = {
  editor: '#1e1e1e',
  chrome: '#181818',
  panel: '#1b1b1b',
  border: '#2d2d2d',
  text: '#d4d4d4',
  dim: '#8a8a8a',
  ghost: '#6a6a6a',
  keyword: '#569cd6',
  type: '#4ec9b0',
  fn: '#dcdcaa',
  num: '#b5cea8',
  str: '#ce9178',
  prop: '#9cdcfe',
  added: 'rgba(78,201,176,0.16)',
  removed: 'rgba(244,113,113,0.16)',
  accent: '#e4e4e4',
};

const CODE = 30;
const ROW = 45;

/* ── the demo's files ─────────────────────────────────────────────────── */

const HEAD = [
  'export type CartItem = { price: number; qty: number };',
  '',
];
/** What the chat agrees on, and Apply writes in. */
const SHAPE = [
  'export type Totals = {',
  '  net: number;',
  '  vat: number;',
  '  gross: number;',
  '};',
  '',
];
const MID = [
  'const VAT = 0.2;',
  '',
  'export function totals(items: CartItem[]): Totals {',
];
/** Tab's first suggestion: a whole block, not a line. */
const BODY1 = [
  '  const net = items.reduce((s, i) => s + i.price * i.qty, 0);',
  '  const vat = round(net * VAT);',
  '  return { net: round(net), vat, gross: round(net) + vat };',
];
const TAIL = [
  '}',
  '',
  'function round(n: number) {',
];
/** Tab's second suggestion, after it jumps down the file. */
const BODY2 = ['  return Math.round(n * 100) / 100;'];
const END = ['}'];

const ROUTES = [
  'import { totals } from "./cart";',
  '',
  'router.get("/cart", (req, res) => {',
  '  res.json(totals(req.cart.items));',
  '});',
];

const CHAT_YOU = 'the cart maths is scattered — I want one function that returns net, vat and gross';
const CHAT_REPLY = 'Keep the maths in cart.ts, let the route serialise it. The shape:';

/* ── the beats ────────────────────────────────────────────────────────── */

const YOU_AT = 14;
const SEND_AT = YOU_AT + typedFor(CHAT_YOU) + 6;
const REPLY_AT = SEND_AT + 12;
const BLOCK_AT = REPLY_AT + 32;
const APPLY_AT = BLOCK_AT + 32;

const SUGGEST1_AT = APPLY_AT + 28;
const ACCEPT1_AT = SUGGEST1_AT + 50;

const JUMP_AT = ACCEPT1_AT + 20;
const SUGGEST2_AT = JUMP_AT + 20;
const ACCEPT2_AT = SUGGEST2_AT + 36;

const PORTAL_AT = ACCEPT2_AT + 20;
const SWITCH_AT = PORTAL_AT + 60;

export const CURSOR_TAB_FRAMES = SWITCH_AT + 78;

/* ── a very small highlighter ─────────────────────────────────────────── */

const KEYWORDS = new Set([
  'export', 'type', 'const', 'function', 'return', 'import', 'from', 'new',
]);
const TYPES = new Set(['number', 'string', 'CartItem', 'Totals', 'Math']);

function colourOf(token: string, next: string): string {
  if (KEYWORDS.has(token)) return UI.keyword;
  if (TYPES.has(token)) return UI.type;
  if (/^[0-9.]+$/.test(token)) return UI.num;
  if (/^".*"$/.test(token)) return UI.str;
  if (next === '(') return UI.fn;
  if (/^[A-Za-z_$][\w$]*$/.test(token)) return UI.prop;
  return UI.text;
}

function Code({ line, colour }: { line: string; colour?: string }) {
  if (colour) return <>{line}</>;
  const parts = line.split(/(\s+|[^\w$."]|"[^"]*")/).filter((p) => p !== '');
  return (
    <>
      {parts.map((p, i) => {
        if (/^\s+$/.test(p)) return <span key={i}>{p}</span>;
        const next = parts.slice(i + 1).find((q) => !/^\s+$/.test(q)) ?? '';
        return (
          <span key={i} style={{ color: colourOf(p, next) }}>
            {p}
          </span>
        );
      })}
    </>
  );
}

type Row = { text: string; tone?: 'ghost' | 'added'; caret?: boolean };

function Rows({ rows, scroll }: { rows: Row[]; scroll: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        padding: '22px 0',
        fontFamily: MONO,
        fontSize: CODE,
        lineHeight: `${ROW}px`,
        transform: `translateY(${-scroll}px)`,
      }}
    >
      {rows.map((r, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            background: r.tone === 'added' ? UI.added : 'transparent',
          }}
        >
          <div style={{ width: 92, textAlign: 'right', paddingRight: 28, color: '#5a5a5a' }}>
            {i + 1}
          </div>
          <div style={{ color: r.tone === 'ghost' ? UI.ghost : UI.text, whiteSpace: 'pre' }}>
            <Code line={r.text} colour={r.tone === 'ghost' ? UI.ghost : undefined} />
            {r.caret && <Caret />}
          </div>
        </div>
      ))}
    </div>
  );
}

function Caret() {
  const frame = useCurrentFrame();
  return (
    <span
      style={{
        display: 'inline-block',
        width: 3,
        height: CODE,
        marginLeft: 1,
        verticalAlign: '-5px',
        background: UI.accent,
        opacity: Math.floor(frame / 15) % 2 ? 0.25 : 1,
      }}
    />
  );
}

/** The hint Tab puts next to what it is offering. */
function TabHint({ top, label }: { top: number; label: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        right: 36,
        top,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '6px 16px',
        borderRadius: 8,
        background: '#2f2f2f',
        border: `1px solid ${UI.border}`,
        fontFamily: SANS,
        fontSize: 26,
        color: UI.dim,
      }}
    >
      <span
        style={{
          fontFamily: MONO,
          fontSize: 24,
          color: UI.accent,
          border: `1px solid #4a4a4a`,
          borderRadius: 5,
          padding: '1px 9px',
        }}
      >
        Tab
      </span>
      {label}
    </div>
  );
}

/* ── the chat panel ───────────────────────────────────────────────────── */

function Bubble({ who, children }: { who: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 23, color: UI.dim, marginBottom: 6, letterSpacing: 1 }}>{who}</div>
      <div style={{ fontSize: 27, lineHeight: 1.4, color: UI.text }}>{children}</div>
    </div>
  );
}

function Chat({ frame }: { frame: number }) {
  const replyShown = Math.ceil(
    CHAT_REPLY.length
      * interpolate(frame, [REPLY_AT, REPLY_AT + 28], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }),
  );
  const applied = frame >= APPLY_AT;
  return (
    <div
      style={{
        width: 560,
        flexShrink: 0,
        borderLeft: `1px solid ${UI.border}`,
        background: UI.panel,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: SANS,
      }}
    >
      <div
        style={{
          height: 62,
          flexShrink: 0,
          borderBottom: `1px solid ${UI.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 22px',
          fontSize: 25,
          color: UI.dim,
        }}
      >
        <span>CHAT</span>
        <span>claude-3.5-sonnet ⌄</span>
      </div>
      <div style={{ flex: 1, minHeight: 0, padding: '20px 20px', overflow: 'hidden' }}>
        {frame >= YOU_AT && (
          <Bubble who="YOU">
            {frame >= SEND_AT ? CHAT_YOU : typed(CHAT_YOU, frame, YOU_AT)}
            {frame < SEND_AT && <Caret />}
          </Bubble>
        )}
        {frame >= REPLY_AT && (
          <Bubble who="CURSOR">{CHAT_REPLY.slice(0, replyShown)}</Bubble>
        )}
        {frame >= BLOCK_AT && (
          <div
            style={{
              border: `1px solid ${UI.border}`,
              borderRadius: 10,
              overflow: 'hidden',
              background: UI.editor,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 14px',
                background: UI.chrome,
                fontSize: 23,
                color: UI.dim,
              }}
            >
              <span>cart.ts</span>
              <span
                style={{
                  padding: '3px 14px',
                  borderRadius: 6,
                  background: applied ? '#2f3f3a' : '#3a3a3a',
                  color: applied ? UI.type : UI.accent,
                }}
              >
                {applied ? 'Applied' : 'Apply'}
              </span>
            </div>
            <div
              style={{
                padding: '12px 16px',
                fontFamily: MONO,
                fontSize: 23,
                lineHeight: 1.45,
                whiteSpace: 'pre',
              }}
            >
              {SHAPE.slice(0, 5).map((l) => (
                <div key={l}>
                  <Code line={l} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div
        style={{
          flexShrink: 0,
          margin: '14px 20px 18px',
          padding: '12px 18px',
          borderRadius: 10,
          border: `1px solid ${UI.border}`,
          color: UI.dim,
          fontSize: 26,
        }}
      >
        Ask anything · @ to add context
      </div>
    </div>
  );
}

/* ── the cross-file portal ────────────────────────────────────────────── */

function Portal({ frame }: { frame: number }) {
  const o = interpolate(frame, [PORTAL_AT, PORTAL_AT + 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        position: 'absolute',
        left: 28,
        right: 28,
        bottom: 24,
        opacity: o,
        borderRadius: 10,
        overflow: 'hidden',
        border: `1px solid #3a3a3a`,
        background: UI.chrome,
        boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 18px',
          fontFamily: SANS,
          fontSize: 25,
          color: UI.dim,
        }}
      >
        <span>routes.ts</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 23,
              color: UI.accent,
              border: '1px solid #4a4a4a',
              borderRadius: 5,
              padding: '1px 9px',
            }}
          >
            Tab
          </span>
          to jump
        </span>
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 26,
          lineHeight: 1.6,
          whiteSpace: 'pre',
          background: UI.editor,
          padding: '10px 18px',
        }}
      >
        {/* The same expressions ROUTES ends on — the jump accepts this very edit,
            so a shorter paraphrase here would change between frames. */}
        <div style={{ background: UI.removed, color: '#c98a8a' }}>
          {'-   res.json({ total: cartTotal(req.cart.items) });'}
        </div>
        <div style={{ background: UI.added, color: UI.type }}>
          {'+   res.json(totals(req.cart.items));'}
        </div>
      </div>
    </div>
  );
}

/* ── the editor ───────────────────────────────────────────────────────── */

function Tab({ name, active }: { name: string; active: boolean }) {
  return (
    <div
      style={{
        padding: '0 26px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        fontFamily: SANS,
        fontSize: 26,
        color: active ? UI.text : UI.dim,
        background: active ? UI.editor : 'transparent',
        borderTop: `2px solid ${active ? UI.keyword : 'transparent'}`,
      }}
    >
      {name}
    </div>
  );
}

function rowsAt(frame: number): { rows: Row[]; scroll: number; hintRow: number } {
  if (frame >= SWITCH_AT) {
    return {
      rows: ROUTES.map((text, i) => ({ text, tone: i === 3 ? ('added' as const) : undefined })),
      scroll: 0,
      hintRow: -1,
    };
  }
  /* Tab puts its hint against the line it is offering, so the row is tracked
     as the file is assembled — a ghost block carries no caret to follow. */
  let hintRow = -1;
  const rows: Row[] = HEAD.map((text) => ({ text }));
  if (frame >= APPLY_AT) {
    SHAPE.forEach((text) => rows.push({ text, tone: frame < APPLY_AT + 22 ? 'added' : undefined }));
  }
  MID.forEach((text) => rows.push({ text }));

  const body1Ghost = frame >= SUGGEST1_AT && frame < ACCEPT1_AT;
  const body1Real = frame >= ACCEPT1_AT;
  /* Below the block, not beside it: these lines are long and the pill would
     sit on top of the very code it is offering. */
  if (body1Ghost) hintRow = rows.length + BODY1.length;
  if (body1Ghost || body1Real) {
    BODY1.forEach((text, i) =>
      rows.push({
        text,
        tone: body1Ghost ? 'ghost' : frame < ACCEPT1_AT + 18 ? 'added' : undefined,
        caret: body1Real && i === BODY1.length - 1 && frame < JUMP_AT,
      }),
    );
  } else {
    rows.push({ text: '  ', caret: frame < SUGGEST1_AT });
  }

  TAIL.forEach((text) => rows.push({ text }));

  const body2Ghost = frame >= SUGGEST2_AT && frame < ACCEPT2_AT;
  const body2Real = frame >= ACCEPT2_AT;
  if (body2Ghost || frame >= JUMP_AT) hintRow = rows.length;
  if (body2Ghost || body2Real) {
    BODY2.forEach((text) =>
      rows.push({
        text,
        tone: body2Ghost ? 'ghost' : frame < ACCEPT2_AT + 18 ? 'added' : undefined,
        caret: body2Real,
      }),
    );
  } else {
    rows.push({ text: '  ', caret: frame >= JUMP_AT });
  }
  END.forEach((text) => rows.push({ text }));

  /* The view follows the caret, the way an editor scrolls. */
  const scroll = interpolate(
    frame,
    [APPLY_AT, APPLY_AT + 18, JUMP_AT, JUMP_AT + 15, PORTAL_AT, PORTAL_AT + 12],
    [0, 150, 150, 300, 300, 430],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  return { rows, scroll, hintRow };
}

export const CursorTab = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' });
  const { rows, scroll, hintRow } = rowsAt(frame);
  const hintTop = 22 + hintRow * ROW - scroll;
  return (
    <AbsoluteFill style={{ background: PAPER, fontFamily: SANS, opacity: o }}>
      <Window title={`${frame >= SWITCH_AT ? 'routes.ts' : 'cart.ts'} — my-shop`} background={UI.editor}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                height: 58,
                flexShrink: 0,
                display: 'flex',
                background: UI.chrome,
                borderBottom: `1px solid ${UI.border}`,
              }}
            >
              <Tab name="cart.ts" active={frame < SWITCH_AT} />
              <Tab name="routes.ts" active={frame >= SWITCH_AT} />
            </div>
            <div style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
              <Rows rows={rows} scroll={scroll} />
              {hintRow >= 0 && frame >= SUGGEST1_AT && frame < ACCEPT1_AT && (
                <TabHint top={hintTop} label={`to accept ${BODY1.length} lines`} />
              )}
              {hintRow >= 0 && frame >= JUMP_AT && frame < SUGGEST2_AT && (
                <TabHint top={hintTop} label="to jump" />
              )}
              {hintRow >= 0 && frame >= SUGGEST2_AT && frame < ACCEPT2_AT && (
                <TabHint top={hintTop} label="to accept" />
              )}
              {frame >= PORTAL_AT && frame < SWITCH_AT && <Portal frame={frame} />}
            </div>
          </div>
          <Chat frame={frame} />
        </div>
      </Window>
    </AbsoluteFill>
  );
};
