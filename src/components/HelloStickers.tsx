import type { ReactNode } from 'react';

/**
 * «Hello» die-cut stickers in the style of the Preply laptop pack: a white tag with a
 * thick black edge, a small flag and the greeting, filling the field in tilted, wrapped
 * rows. Only nations that stand with Ukraine against Russia — by Yarik's word: no Russian,
 * no neutral or hostile states. Flags are drawn here (3:2 viewBox) so they render the same on any projector
 * machine — emoji flags do not exist on Windows.
 */

const FLAGS: Record<string, ReactNode> = {
  ua: (
    <>
      <rect width="30" height="10" fill="#0057b7" />
      <rect y="10" width="30" height="10" fill="#ffd700" />
    </>
  ),
  gb: (
    <>
      <rect width="30" height="20" fill="#012169" />
      <path d="M0 0L30 20M30 0L0 20" stroke="#fff" strokeWidth="4" />
      <path d="M0 0L30 20M30 0L0 20" stroke="#c8102e" strokeWidth="1.4" />
      <path d="M15 0V20M0 10H30" stroke="#fff" strokeWidth="6" />
      <path d="M15 0V20M0 10H30" stroke="#c8102e" strokeWidth="3.4" />
    </>
  ),
  es: (
    <>
      <rect width="30" height="20" fill="#aa151b" />
      <rect y="5" width="30" height="10" fill="#f1bf00" />
    </>
  ),
  fr: (
    <>
      <rect width="10" height="20" fill="#0055a4" />
      <rect x="10" width="10" height="20" fill="#fff" />
      <rect x="20" width="10" height="20" fill="#ef4135" />
    </>
  ),
  it: (
    <>
      <rect width="10" height="20" fill="#009246" />
      <rect x="10" width="10" height="20" fill="#fff" />
      <rect x="20" width="10" height="20" fill="#ce2b37" />
    </>
  ),
  pl: (
    <>
      <rect width="30" height="10" fill="#fff" />
      <rect y="10" width="30" height="10" fill="#dc143c" />
    </>
  ),
  de: (
    <>
      <rect width="30" height="7" fill="#000" />
      <rect y="6.67" width="30" height="6.67" fill="#dd0000" />
      <rect y="13.33" width="30" height="6.67" fill="#ffce00" />
    </>
  ),
  jp: (
    <>
      <rect width="30" height="20" fill="#fff" />
      <circle cx="15" cy="10" r="6" fill="#bc002d" />
    </>
  ),
  se: (
    <>
      <rect width="30" height="20" fill="#006aa7" />
      <path d="M11 0V20M0 10H30" stroke="#fecc00" strokeWidth="4" />
    </>
  ),
  cz: (
    <>
      <rect width="30" height="10" fill="#fff" />
      <rect y="10" width="30" height="10" fill="#d7141a" />
      <path d="M0 0L15 10L0 20Z" fill="#11457e" />
    </>
  ),
  nl: (
    <>
      <rect width="30" height="7" fill="#ae1c28" />
      <rect y="6.67" width="30" height="6.67" fill="#fff" />
      <rect y="13.33" width="30" height="6.67" fill="#21468b" />
    </>
  ),
  ro: (
    <>
      <rect width="10" height="20" fill="#002b7f" />
      <rect x="10" width="10" height="20" fill="#fcd116" />
      <rect x="20" width="10" height="20" fill="#ce1126" />
    </>
  ),
  fi: (
    <>
      <rect width="30" height="20" fill="#fff" />
      <path d="M11 0V20M0 10H30" stroke="#002f6c" strokeWidth="5" />
    </>
  ),
  gr: (
    <>
      <rect width="30" height="20" fill="#0d5eaf" />
      <path d="M12 3.33H30M12 10H30M0 16.67H30" stroke="#fff" strokeWidth="2.22" />
      <rect width="11.1" height="11.1" fill="#0d5eaf" />
      <path d="M5.55 0V11.1M0 5.55H11.1" stroke="#fff" strokeWidth="2.22" />
    </>
  ),
  lt: (
    <>
      <rect width="30" height="7" fill="#fdb913" />
      <rect y="6.67" width="30" height="6.67" fill="#006a44" />
      <rect y="13.33" width="30" height="6.67" fill="#c1272d" />
    </>
  ),
  ee: (
    <>
      <rect width="30" height="7" fill="#0072ce" />
      <rect y="6.67" width="30" height="6.67" fill="#000" />
      <rect y="13.33" width="30" height="6.67" fill="#fff" />
    </>
  ),
  au: (
    <>
      <rect width="30" height="20" fill="#012169" />
      <g transform="scale(0.5)">
        <path d="M0 0L30 20M30 0L0 20" stroke="#fff" strokeWidth="4" />
        <path d="M0 0L30 20M30 0L0 20" stroke="#c8102e" strokeWidth="1.4" />
        <path d="M15 0V20M0 10H30" stroke="#fff" strokeWidth="6" />
        <path d="M15 0V20M0 10H30" stroke="#c8102e" strokeWidth="3.4" />
      </g>
      <path d="M7.50 12.40L8.01 13.95L9.53 13.38L8.64 14.74L10.03 15.58L8.41 15.73L8.63 17.34L7.50 16.17L6.37 17.34L6.59 15.73L4.97 15.58L6.36 14.74L5.47 13.38L6.99 13.95Z M22.50 15.20L22.75 15.97L23.52 15.69L23.07 16.37L23.77 16.79L22.96 16.86L23.06 17.67L22.50 17.09L21.94 17.67L22.04 16.86L21.23 16.79L21.93 16.37L21.48 15.69L22.25 15.97Z M18.00 8.20L18.25 8.97L19.02 8.69L18.57 9.37L19.27 9.79L18.46 9.86L18.56 10.67L18.00 10.09L17.44 10.67L17.54 9.86L16.73 9.79L17.43 9.37L16.98 8.69L17.75 8.97Z M22.50 2.70L22.75 3.47L23.52 3.19L23.07 3.87L23.77 4.29L22.96 4.36L23.06 5.17L22.50 4.58L21.94 5.17L22.04 4.36L21.23 4.29L21.93 3.87L21.48 3.19L22.25 3.47Z M26.50 7.20L26.75 7.97L27.52 7.69L27.07 8.37L27.77 8.79L26.96 8.86L27.06 9.67L26.50 9.09L25.94 9.67L26.04 8.86L25.23 8.79L25.93 8.37L25.48 7.69L26.25 7.97Z M24.50 10.80L24.69 11.25L25.17 11.28L24.80 11.60L24.91 12.07L24.50 11.81L24.09 12.07L24.20 11.60L23.83 11.28L24.31 11.25Z" fill="#fff" />
    </>
  ),
  pt: (
    <>
      <rect width="30" height="20" fill="#ff0000" />
      <rect width="12" height="20" fill="#006600" />
      <circle cx="12" cy="10" r="3.6" fill="#ffcc00" />
      <circle cx="12" cy="10" r="2.2" fill="#ff0000" />
    </>
  ),
  lv: (
    <>
      <rect width="30" height="20" fill="#9e3039" />
      <rect y="8" width="30" height="4" fill="#fff" />
    </>
  ),
  ie: (
    <>
      <rect width="10" height="20" fill="#169b62" />
      <rect x="10" width="10" height="20" fill="#fff" />
      <rect x="20" width="10" height="20" fill="#ff883e" />
    </>
  ),
  dk: (
    <>
      <rect width="30" height="20" fill="#c8102e" />
      <path d="M11 0V20M0 10H30" stroke="#fff" strokeWidth="3" />
    </>
  ),
  is: (
    <>
      <rect width="30" height="20" fill="#02529c" />
      <path d="M11 0V20M0 10H30" stroke="#fff" strokeWidth="5" />
      <path d="M11 0V20M0 10H30" stroke="#dc1e35" strokeWidth="2.5" />
    </>
  ),
  lu: (
    <>
      <rect width="30" height="7" fill="#ed2939" />
      <rect y="6.67" width="30" height="6.67" fill="#fff" />
      <rect y="13.33" width="30" height="6.67" fill="#00a1de" />
    </>
  ),
  hr: (
    <>
      <rect width="30" height="7" fill="#ff0000" />
      <rect y="6.67" width="30" height="6.67" fill="#fff" />
      <rect y="13.33" width="30" height="6.67" fill="#171796" />
      <path d="M12.4 5.6h5.2v5.6a2.6 2.6 0 0 1-5.2 0z" fill="#fff" stroke="#ff0000" strokeWidth="0.4" />
      <path d="M12.4 5.6h1.3v1.4h-1.3zM15 5.6h1.3v1.4H15zM13.7 7h1.3v1.4h-1.3zM16.3 7h1.3v1.4h-1.3zM12.4 8.4h1.3v1.4h-1.3zM15 8.4h1.3v1.4H15zM13.7 9.8h1.3v1.4h-1.3zM16.3 9.8h1.3v1.4h-1.3z" fill="#ff0000" />
    </>
  ),
};

/** Greeting, flag, its tilt (deg) and a small vertical nudge (px), so the rows read as stuck on
 *  by hand. Order is the reading order of the wrapped rows. */
const HELLOS: { text: string; flag: keyof typeof FLAGS; r: number; dy: number }[] = [
  { text: 'Привіт', flag: 'ua', r: -6, dy: -6 },
  { text: 'Hello', flag: 'gb', r: 4, dy: 10 },
  { text: 'Cześć', flag: 'pl', r: -3, dy: -4 },
  { text: 'Olá', flag: 'pt', r: 5, dy: 8 },
  { text: 'Hola', flag: 'es', r: 4, dy: 6 },
  { text: 'Hallo', flag: 'de', r: -5, dy: -8 },
  { text: 'Bonjour', flag: 'fr', r: 3, dy: 4 },
  { text: 'Ciao', flag: 'it', r: -4, dy: -2 },
  { text: 'こんにちは', flag: 'jp', r: -3, dy: 8 },
  { text: 'Labas', flag: 'lt', r: 5, dy: -6 },
  { text: 'Ahoj', flag: 'cz', r: -6, dy: 6 },
  { text: 'Hej', flag: 'se', r: 3, dy: 10 },
  { text: 'Hoi', flag: 'nl', r: -4, dy: -4 },
  { text: 'Tere', flag: 'ee', r: 6, dy: 6 },
  { text: 'Sveiki', flag: 'lv', r: -3, dy: -8 },
  { text: 'Salut', flag: 'ro', r: 4, dy: 4 },
  { text: 'Γεια σου', flag: 'gr', r: -5, dy: 8 },
  { text: 'Hei', flag: 'fi', r: 5, dy: -6 },
  { text: 'G’day', flag: 'au', r: 3, dy: 6 },
  { text: 'Goddag', flag: 'dk', r: -4, dy: -4 },
  { text: 'Dia duit', flag: 'ie', r: 5, dy: 6 },
  { text: 'Halló', flag: 'is', r: -3, dy: -2 },
  { text: 'Moien', flag: 'lu', r: 4, dy: 8 },
  { text: 'Bok', flag: 'hr', r: -5, dy: -4 },
];

export function HelloStickers({ hidden }: { hidden: boolean }) {
  return (
    <div className={`ww-hellos${hidden ? ' ww-hellos--gone' : ''}`} aria-hidden="true">
      {HELLOS.map(h => (
        <div
          key={h.flag}
          className="ww-hello"
          style={{ transform: `translateY(${h.dy}px) rotate(${h.r}deg)` }}
        >
          <svg className="ww-hello__flag" viewBox="0 0 30 20">
            {FLAGS[h.flag]}
          </svg>
          <span>{h.text}</span>
        </div>
      ))}
    </div>
  );
}

/** «Thank you», in the same pack and the same nations, as the closing slide's frame around
 *  its two QR codes: `top` and `bottom` rows (the longer words); `left`, `mid` and `right`
 *  stacked down the gaps beside and between the QR stands (the short ones). */
type Sticker = { text: string; flag: keyof typeof FLAGS; r: number; dy: number };
export const THANKS: Record<'top' | 'bottom' | 'left' | 'mid' | 'right', Sticker[]> = {
  top: [
    { text: 'Дякую', flag: 'ua', r: -5, dy: -4 },
    { text: 'Thank you', flag: 'gb', r: 3, dy: 8 },
    { text: 'Dziękuję', flag: 'pl', r: -3, dy: -6 },
    { text: 'Obrigado', flag: 'pt', r: 4, dy: 6 },
    { text: 'Gracias', flag: 'es', r: -4, dy: -2 },
    { text: 'ありがとう', flag: 'jp', r: 3, dy: 8 },
  ],
  bottom: [
    { text: 'Dank je', flag: 'nl', r: 4, dy: 4 },
    { text: 'Aitäh', flag: 'ee', r: -5, dy: -6 },
    { text: 'Paldies', flag: 'lv', r: 3, dy: 6 },
    { text: 'Mulțumesc', flag: 'ro', r: -3, dy: -4 },
    { text: 'Ευχαριστώ', flag: 'gr', r: 5, dy: 8 },
    { text: 'Tak', flag: 'dk', r: -4, dy: -2 },
  ],
  left: [
    { text: 'Danke', flag: 'de', r: -6, dy: 0 },
    { text: 'Ačiū', flag: 'lt', r: 5, dy: 0 },
    { text: 'Děkuji', flag: 'cz', r: -3, dy: 0 },
  ],
  mid: [
    { text: 'Merci', flag: 'fr', r: 5, dy: 0 },
    { text: 'Grazie', flag: 'it', r: -4, dy: 0 },
    { text: 'Tack', flag: 'se', r: 6, dy: 0 },
  ],
  right: [
    { text: 'Kiitos', flag: 'fi', r: -5, dy: 0 },
    { text: 'Takk', flag: 'is', r: 4, dy: 0 },
    { text: 'Hvala', flag: 'hr', r: -3, dy: 0 },
  ],
};

/** One group of «thank you» stickers, laid out by its container (`.ww-thanks--*`). */
export function ThankStickers({ group }: { group: keyof typeof THANKS }) {
  return (
    <div className={`ww-thanks ww-thanks--${group}`} aria-hidden="true">
      {THANKS[group].map((h) => (
        <div key={h.flag} className="ww-hello ww-hello--small" style={{ transform: `translateY(${h.dy}px) rotate(${h.r}deg)` }}>
          <svg className="ww-hello__flag" viewBox="0 0 30 20">
            {FLAGS[h.flag]}
          </svg>
          <span>{h.text}</span>
        </div>
      ))}
    </div>
  );
}
