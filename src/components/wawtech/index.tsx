/**
 * WAWTech layout kit — the building blocks of «WAWTECH_Template_white»,
 * re-drawn as React so a slide is content, not positioning.
 *
 * Every component here is drawn 1:1 on the fixed 1920×1080 stage. Styles live
 * in src/styles/slide-layouts.css under the matching `ww-` class.
 */
import { CSSProperties, ReactNode } from 'react';
import cornerRings from '../../assets/wawtech/corner-rings.png';
import logoInk from '../../assets/wawtech/logo-ink.png';
import logoPurple from '../../assets/wawtech/logo-purple.png';
import icon1 from '../../assets/wawtech/icons/icon-1.png';
import icon2 from '../../assets/wawtech/icons/icon-2.png';
import icon3 from '../../assets/wawtech/icons/icon-3.png';
import icon4 from '../../assets/wawtech/icons/icon-4.png';
import icon5 from '../../assets/wawtech/icons/icon-5.png';
import icon6 from '../../assets/wawtech/icons/icon-6.png';
import icon7 from '../../assets/wawtech/icons/icon-7.png';
import icon8 from '../../assets/wawtech/icons/icon-8.png';

/** The template's own icons: 1–3 are violet (for light cards), 4–8 white
 *  (for dark / gradient cards). */
export const ICONS = {
  robot: icon1,
  plug: icon2,
  screen: icon3,
  cloud: icon4,
  atom: icon5,
  case: icon6,
  database: icon7,
  laptop: icon8,
} as const;
export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 96 }: { name: IconName; size?: number }) {
  return <img className="ww-icon" src={ICONS[name]} alt="" width={size} height={size} />;
}

/* ─── Backdrops ─────────────────────────────────────────────────────────── */

/** The faded quarter-rings that sit in a corner of most content slides. */
export function CornerRings({
  corner = 'bottom-left',
}: {
  corner?: 'bottom-left' | 'top-right' | 'bottom-right' | 'top-left';
}) {
  return <img className={`ww-corner-rings ww-corner-rings--${corner}`} src={cornerRings} alt="" />;
}

/** WAWTech by DOU wordmark. `ink` sits on the mint box, `purple` on paper. */
export function Logo({ tone = 'purple', width = 360 }: { tone?: 'ink' | 'purple'; width?: number }) {
  return (
    <img
      className="ww-logo"
      src={tone === 'ink' ? logoInk : logoPurple}
      alt="WAWTech by DOU"
      style={{ width }}
    />
  );
}

/** Purple gradient that rises from the bottom edge (template slides 11, 18). */
export function BottomFade({ height = 540 }: { height?: number }) {
  return <div className="ww-bottom-fade" style={{ height }} />;
}

/* ─── Small pieces ──────────────────────────────────────────────────────── */

/** Magenta pill (template's «TEXT» button). */
export function Pill({ children, tone = 'magenta' }: { children: ReactNode; tone?: 'magenta' | 'outline' }) {
  return <span className={`ww-pill ww-pill--${tone}`}>{children}</span>;
}

/** Arrow glyph used on cards and the break slide. */
export function Arrow({ dir = 'up-right' }: { dir?: 'up-right' | 'down-right' | 'right' }) {
  const glyph = dir === 'right' ? '→' : dir === 'down-right' ? '↘' : '↗';
  return <span className="ww-arrow" aria-hidden="true">{glyph}</span>;
}

/* ─── Blocks ────────────────────────────────────────────────────────────── */

type CardTone = 'purple' | 'magenta' | 'mint' | 'ink' | 'grey' | 'gradient';

/** A rounded card in one of the template's fills. */
export function Card({
  tone = 'grey',
  children,
  style,
  className = '',
}: {
  tone?: CardTone;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div className={`ww-card ww-card--${tone} ${className}`} style={style}>
      {children}
    </div>
  );
}

/** Big number + caption (template slides 7, 16, 17). */
export function Stat({
  value,
  label,
  tone = 'mint',
}: {
  value: ReactNode;
  label: ReactNode;
  tone?: CardTone;
}) {
  return (
    <Card tone={tone} className="ww-stat">
      <div className="ww-stat__value">{value}</div>
      <div className="ww-stat__label">{label}</div>
    </Card>
  );
}

/** Flat purple block with white text (template slides 17, 19). */
export function Block({
  children,
  style,
  className = '',
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div className={`ww-block ${className}`} style={style}>
      {children}
    </div>
  );
}

/* ─── Reveal helper ─────────────────────────────────────────────────────── */

/** Hides (not unmounts) content until `revealStage` reaches `at`, so a layout
 *  never jumps when a beat arrives. */
export function Reveal({
  at,
  stage,
  children,
}: {
  at: number;
  stage: number;
  children: ReactNode;
}) {
  return <div className={stage >= at ? 'reveal-in' : 'reveal-hidden'}>{children}</div>;
}
