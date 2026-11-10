import type { ReactNode } from 'react';
import preplyMark from '../assets/about/preply-mark.svg';

/**
 * «Hello» die-cut stickers in the style of the Preply laptop pack: a white tag with a
 * thick black edge, a small flag and the greeting, scattered round an «I'm part of Preply»
 * centrepiece. Flags are drawn here (3:2 viewBox) so they render the same on any projector
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
  br: (
    <>
      <rect width="30" height="20" fill="#009c3b" />
      <path d="M15 2.5L27 10L15 17.5L3 10Z" fill="#ffdf00" />
      <circle cx="15" cy="10" r="4.4" fill="#002776" />
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
  tr: (
    <>
      <rect width="30" height="20" fill="#e30a17" />
      <circle cx="11" cy="10" r="5" fill="#fff" />
      <circle cx="12.3" cy="10" r="4" fill="#e30a17" />
      <path
        d="M16.6 10l3.6-1.2-2.2 3.1V8.1l2.2 3.1z"
        fill="#fff"
      />
    </>
  ),
  cz: (
    <>
      <rect width="30" height="10" fill="#fff" />
      <rect y="10" width="30" height="10" fill="#d7141a" />
      <path d="M0 0L15 10L0 20Z" fill="#11457e" />
    </>
  ),
};

/** Greeting, flag, where its centre sits in the field (%), and its tilt (deg). */
const HELLOS: { text: string; flag: keyof typeof FLAGS; x: number; y: number; r: number }[] = [
  { text: 'Привіт', flag: 'ua', x: 17, y: 9, r: -6 },
  { text: 'Hello', flag: 'gb', x: 50, y: 8, r: 4 },
  { text: 'Olá', flag: 'br', x: 82, y: 11, r: -3 },
  { text: 'Cześć', flag: 'pl', x: 14, y: 30, r: 5 },
  { text: 'Hej', flag: 'se', x: 87, y: 31, r: 6 },
  { text: 'Hola', flag: 'es', x: 11, y: 51, r: -4 },
  { text: 'Hallo', flag: 'de', x: 89, y: 52, r: -5 },
  { text: 'Merhaba', flag: 'tr', x: 15, y: 72, r: 3 },
  { text: 'Ahoj', flag: 'cz', x: 86, y: 73, r: 5 },
  { text: 'Bonjour', flag: 'fr', x: 20, y: 92, r: 6 },
  { text: 'Ciao', flag: 'it', x: 51, y: 91, r: -4 },
  { text: 'こんにちは', flag: 'jp', x: 81, y: 92, r: 3 },
];

export function HelloStickers({ hidden }: { hidden: boolean }) {
  return (
    <div className={`ww-hellos${hidden ? ' ww-hellos--gone' : ''}`} aria-hidden="true">
      {HELLOS.map(h => (
        <div
          key={h.flag}
          className="ww-hello"
          style={{ left: `${h.x}%`, top: `${h.y}%`, transform: `translate(-50%, -50%) rotate(${h.r}deg)` }}
        >
          <svg className="ww-hello__flag" viewBox="0 0 30 20">
            {FLAGS[h.flag]}
          </svg>
          <span>{h.text}</span>
        </div>
      ))}
      <div className="ww-hello-part">
        <div className="ww-hello-part__row">
          <span className="ww-hello-bubble ww-hello-bubble--im">I’m</span>
          <span className="ww-hello-bubble ww-hello-bubble--part">part of</span>
        </div>
        <span className="ww-hello-bubble ww-hello-bubble--preply">
          Preply
          <img src={preplyMark} alt="" />
        </span>
      </div>
    </div>
  );
}
