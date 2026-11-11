/**
 * The context-sheet scene kit — the visual language first built for the «A loop
 * is a cron» slide, shared so every «what is really in the text» slide speaks it:
 *
 *   · the SHEET in the middle is the context; every turn on it carries its
 *     writer's stamp in the margin and its writer's ink;
 *   · the USER is a laptop (keys light as it types; the reply shows on its screen);
 *   · the HARNESS is a terminal window across the top — its screen is the desk
 *     where it holds things (a dial, a running tool call);
 *   · the MODEL is an orb that breathes while it streams.
 *
 * Everything is drawn on a fixed 1700 × 870 canvas (`.ww-ctx`) and every moving
 * value is set inline off ONE clock from slide entry (requestAnimationFrame, no
 * CSS animation), so a scene plays once and holds, and the PDF is its last frame.
 * Styles: `.ww-ctx…` in slide-layouts.css.
 */
import { useLayoutEffect, useState, type ReactNode, type RefObject } from 'react';

export const EXPORT_MODE =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('export') === '1';

export type Who = 'harness' | 'user' | 'model';
export type Pt = [number, number];
export type Rect = { x: number; y: number; w: number; h: number };

// ── helpers ─────────────────────────────────────────────────────────────────
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
/** progress of a segment that starts at `a` and lasts `d` */
export const seg = (t: number, a: number, d: number) => clamp01((t - a) / d);
/** ease-out (expo) */
export const out = (p: number) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
/** the protocol's own markers (<|tool_call|> …) are special tokens */
export const isSpecial = (u: string) => u.trim().startsWith('<|');

/** ms since the slide appeared; it plays once to `total` and holds. The PDF gets the end. */
export function useOneShotClock(total: number): number {
  const [t, setT] = useState(EXPORT_MODE ? total : 0);
  useLayoutEffect(() => {
    if (EXPORT_MODE) return;
    const start = performance.now();
    let id = requestAnimationFrame(function tick(now) {
      setT(now - start);
      if (now - start <= total) id = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(id);
  }, [total]);
  return t;
}

/** Measure every `[data-u]` unit inside `root` once, in canvas coordinates
 *  (the canvas may be scaled by the stage, so divide that scale back out). */
export function useUnitSlots(root: RefObject<HTMLElement | null>): Record<string, Rect> {
  const [slots, setSlots] = useState<Record<string, Rect>>({});
  useLayoutEffect(() => {
    const r = root.current;
    if (!r) return;
    const o = r.getBoundingClientRect();
    const k = o.width / r.offsetWidth || 1;
    const next: Record<string, Rect> = {};
    r.querySelectorAll<HTMLElement>('[data-u]').forEach((el) => {
      const b = el.getBoundingClientRect();
      next[el.dataset.u!] = { x: (b.left - o.left) / k, y: (b.top - o.top) / k, w: b.width / k, h: b.height / k };
    });
    setSlots(next);
  }, [root]);
  return slots;
}

// ── geometry (a fixed 1700 × 870 canvas) ────────────────────────────────────
export const SHEET = { x: 360, y: 214, w: 980, h: 646 };
export const WIN = { x: 510, y: 0, w: 690, h: 178 }; // the harness's terminal window
export const LAPTOP = { x: 20, y: 380, w: 300 };
export const ORB: Pt = [1530, 500];
export const ORB_D = 220;

// ── the writers ─────────────────────────────────────────────────────────────
/** The user: a laptop, always open. It animates for exactly two things: the
 *  user typing (keys light, lines grow on its screen) and the assistant's reply
 *  reaching that screen. `lit` while either is happening; `typed` is how much
 *  is on the screen. */
export function Laptop({ lit, typed }: { lit: boolean; typed: number }) {
  // A laptop seen slightly from above: the lid stands on the hinge (y=150), its top edge at y=8.
  const keys: ReactNode[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 11; c++) {
      const on = lit && (typed * 7 + r * 3 + c * 5) % 11 === 0;
      const y = 158 + r * 11;
      const inset = (r * 4);
      keys.push(<rect key={`${r}-${c}`} className={`ww-ctx__key${on ? ' is-on' : ''}`} x={48 - inset + c * (19 + (r * 8) / 11)} y={y} width={15 + r * 0.6} height="7" rx="2" />);
    }
  }
  return (
    <svg className={`ww-ctx__laptop${lit ? ' is-lit' : ''}`} viewBox="0 0 300 228" style={{ left: LAPTOP.x, top: LAPTOP.y, width: LAPTOP.w }} aria-hidden="true">
      {/* the deck: keyboard and trackpad, seen from above */}
      <path className="ww-ctx__base" d="M38 150h224l30 64H8z" />
      {keys}
      <rect className="ww-ctx__trackpad" x="118" y="194" width="64" height="14" rx="3" />
      <path className="ww-ctx__lip" d="M8 214h284v4a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6z" />
      {/* the lid and its screen */}
      <path className="ww-ctx__lid" d="M38 150H262L262 8H38z" />
      <path className="ww-ctx__screen" d="M50 140H250L251 19H49z" />
      {Array.from({ length: 3 }, (_, i) => (
        <rect key={i} className="ww-ctx__screenline" x="66" y={36 + i * 28} width={Math.max(0, Math.min(168, (typed - i * 12) * 7))} height="12" rx="6" />
      ))}
      {lit && (
        <rect className="ww-ctx__screencaret" x={66 + Math.min(Math.max(typed - Math.floor(typed / 12) * 12, 0), 24) * 7} y={33 + Math.min(Math.floor(typed / 12), 2) * 28} width="9" height="18" />
      )}
    </svg>
  );
}

/** The model: an orb that breathes while it streams. */
export function Orb({ lit, breath }: { lit: boolean; breath: number }) {
  const s = ORB_D * (1 + breath * 0.05);
  return (
    <div className={`ww-ctx__orb${lit ? ' is-lit' : ''}`} style={{ width: s, height: s, transform: `translate(${ORB[0] - s / 2}px, ${ORB[1] - s / 2}px)` }}>
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M32 8c2 13 11 22 24 24-13 2-22 11-24 24-2-13-11-22-24-24 13-2 22-11 24-24z" />
      </svg>
    </div>
  );
}

/** a writer's stamp in the margin of the sheet */
export function Stamp({ who }: { who: Who }) {
  if (who === 'user') {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <rect x="16" y="16" width="32" height="22" rx="3" className="ww-ctx__stampline" />
        <path d="M10 44h44l-4 6H14z" />
      </svg>
    );
  }
  if (who === 'model') {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M32 8c2 13 11 22 24 24-13 2-22 11-24 24-2-13-11-22-24-24 13-2 22-11 24-24z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path className="ww-ctx__stampline" d="M14 20l14 12-14 12" />
      <path className="ww-ctx__stampline" d="M32 46h18" />
    </svg>
  );
}

/** A quoted token, on the desk or in flight. */
/** Who can hold a chip: the three writers, plus an MCP server (mint ink). */
export type ChipInk = Who | 'server';

export function Chip({ text, who, at, special = false, small = false, scale = 1 }: { text: string; who: ChipInk; at: Pt; special?: boolean; small?: boolean; scale?: number }) {
  return (
    <span
      className={`ww-ctx__chip ww-ctx__chip--${who}${special ? ' is-special' : ''}${small ? ' is-small' : ''}`}
      style={{ transform: `translate(${at[0]}px, ${at[1]}px) scale(${scale})` }}
    >
      {text}
    </span>
  );
}

/** The harness: a terminal window across the top; its screen is the desk. */
export function HarnessWindow({ lit }: { lit: boolean }) {
  return (
    <div className={`ww-ctx__win${lit ? ' is-lit' : ''}`} style={{ left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h }}>
      <div className="ww-ctx__winbar">
        <span className="ww-ctx__dot ww-ctx__dot--red" />
        <span className="ww-ctx__dot ww-ctx__dot--amber" />
        <span className="ww-ctx__dot ww-ctx__dot--green" />
        <span className="ww-ctx__wintitle">harness</span>
      </div>
      <span className="ww-ctx__winprompt">&gt;_</span>
    </div>
  );
}

/** The «User» and «Model» captions under the laptop and the orb. */
export function Names() {
  return (
    <>
      <div className="ww-ctx__name ww-ctx__name--user" style={{ transform: `translate(${LAPTOP.x + LAPTOP.w / 2}px, ${LAPTOP.y + 252}px) translateX(-50%)` }}>
        User
      </div>
      <div className="ww-ctx__name ww-ctx__name--model" style={{ transform: `translate(${ORB[0]}px, ${ORB[1] + ORB_D / 2 + 28}px) translateX(-50%)` }}>
        Model
      </div>
    </>
  );
}

/** A card's ink: mint for an MCP server, the user's purple for a file you wrote. */
export type CardInk = 'server' | 'user';

/**
 * Something outside the context the harness reads from: an MCP server (mint;
 * a URL over HTTP, or a local process on stdio) or a file on disk (purple —
 * you wrote it). `lit` while it is being asked; `pulse` (0..1) while it works.
 */
export function ServerCard({
  box,
  name,
  via,
  icon,
  ink,
  lit,
  pulse = 0,
}: {
  box: Rect;
  name: string;
  via: string;
  icon: 'remote' | 'local' | 'file';
  ink: CardInk;
  lit: boolean;
  pulse?: number;
}) {
  return (
    <div
      className={`ww-ctx__server ww-ctx__server--${ink}${lit ? ' is-lit' : ''}`}
      style={{ left: box.x, top: box.y, width: box.w, height: box.h, transform: `scale(${1 + pulse * 0.04})` }}
    >
      <svg className="ww-ctx__servericon" viewBox="0 0 64 64" aria-hidden="true">
        {icon === 'remote' && (
          <>
            <circle cx="32" cy="32" r="22" />
            <path d="M10 32h44M32 10c-8 7-8 37 0 44M32 10c8 7 8 37 0 44" />
          </>
        )}
        {icon === 'local' && (
          <>
            <rect x="12" y="14" width="40" height="14" rx="3" />
            <rect x="12" y="36" width="40" height="14" rx="3" />
            <path d="M20 21h4M20 43h4" />
          </>
        )}
        {icon === 'file' && (
          <>
            <path d="M16 8h22l12 12v36H16z" />
            <path d="M38 8v12h12M24 32h18M24 40h18M24 48h12" />
          </>
        )}
      </svg>
      <div className="ww-ctx__servertext">
        <div className="ww-ctx__servername">{name}</div>
        <div className="ww-ctx__servervia">{via}</div>
      </div>
    </div>
  );
}
