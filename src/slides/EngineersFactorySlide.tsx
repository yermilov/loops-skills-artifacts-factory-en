import { memo } from 'react';
import { SlideDefinition } from '../types/slides';
import { EXPORT_MODE, clamp01, lerp, seg } from '../components/ctxScene';
import { useAnimating } from '../components/frameSettled';
import { Belt, Engine, K, Key, P, Person, SHADE, SPARK, VIEW, Wheels, along, ease, follow, gearPath, noise, pathLength, pop, useLoopClock } from './FactoryFloorSlide';

/**
 * The factory by Yarik's own philosophy — the answer to the one before it, drawn in
 * the same world (`FactoryFloorSlide`: the same sand, steel, belts and figures) so
 * that the two read as one argument. His script, 17.11.2026:
 *   — everybody is an engineer, «давай їх буде 4-6» (five);
 *   — each builds a line of their own, alone — and the lines all differ a little
 *     (where they turn, where the machines stand, what the machines look like);
 *   — when a line breaks, its own engineer mends it;
 *   — each customises the parts by hand at a bench on their line, so a different
 *     car comes out every time;
 *   — and because they keep adding to their lines, most of the assembly happens
 *     without them: the parts put themselves together inside the machines, and the
 *     engineers spend their time customising, mending and improving.
 * And his correction to the first take, which had five separate lines: «треба щоб
 * всі лінії були зєднані в одну» — so it is ONE belt, a serpentine through five
 * sections, a section to an engineer. A car rides through all five and each adds
 * its own, hand-customised piece: rims, lamps, the shape of the body, the paint,
 * the extras.
 *
 * And when a machine breaks nobody waits (his addition: «інші інженери будують
 * тимчасовий обхід стрічки і доробляють вручну недостатні деталі»): the belt
 * stands only while the two neighbours lay a bypass round the dead machine, then
 * runs through it; its own engineer mends the machine, and the neighbours put the
 * missing piece on each passing car by hand, until the bypass comes down again.
 *
 * One belt, so one clock for it, which those two short halts hold still
 * (`lineClock`). People walking and cars on the road are on the real clock.
 * Everything is derived from the clock — no state, no dice. No words on the
 * picture, as on the one before. Styles are the `.ww-tf…` of that slide, plus the
 * paints and add-ons.
 */

const CS = 0.6; // the cars here, against the classic line's
const PK = 1.05; // and the people
const WALK = 0.36; // px per ms, laying the line
const STEP = 0.42; // px per ms, about the line afterwards
const DRIVE = 0.3;
/** The belt: px per ms, and how far apart the cars ride. */
const SPEED = 0.24;
const GAP = 360;
/**
 * A breakdown, start to finish: the belt halts while the neighbours `build` a way round the dead
 * machine, then `run`s again through that bypass while its own engineer mends it (done `mended`
 * ms in), then halts once more to `clear` the bypass away. `first` and `every` are in the belt's
 * own time, the rest is real.
 */
const BREAK = { first: 14000, every: 21000, build: 2600, run: 8000, clear: 1400, mended: 9800 };
/** The bypass: how far either side of the machine it leaves and rejoins the belt, how far off it swings, and where the missing piece is put on by hand. */
const DETOUR = { half: 90, rise: 66, fit: 170, lead: 40 };
const DETOUR_LENGTH = 2 * DETOUR.half + 2 * DETOUR.rise;
/** The last moment a car may still turn into the bypass: late enough ones would reach the hand-fitting spot after the helpers have gone. */
const DETOUR_SHUT = BREAK.build + BREAK.run - (DETOUR.half + DETOUR.fit) / SPEED;
const HURRY = 0.5; // px per ms, a neighbour coming over to help
const IMPROVE = 3600; // an improvement, from leaving the bench to the new thing standing
const PAINTS = 8;
const ROW = 160;
const EXPORT_AT = 78500;

type Machine = { x: number; kind: 'source' | 'main' | 'check' };
type Section = {
  i: number;
  y: number;
  /** where the belt comes into this section and where it leaves it; odd sections run right to left */
  from: number;
  to: number;
  machines: Machine[];
  /** what its machines look like */
  box: number;
  rx: number;
  gear: string;
  /** where things get added, in the order this engineer adds them */
  slots: number[];
  /** improvements, in real time from the start: the first, and how often */
  tune: number;
  tuneEvery: number;
  // derived
  dir: 1 | -1;
  main: number;
  /** how far along the whole belt its main machine stands */
  mainAt: number;
  walkY: number;
  bench: P;
  enter: number;
  laid: number;
  back: number;
  build: Key[];
};

const RAW = [
  { from: 110, to: 1200, machines: [{ x: 110, kind: 'source' }, { x: 500, kind: 'main' }, { x: 880, kind: 'check' }], box: 96, rx: 14, teeth: 9, slots: [300, 700, 1060], tune: 5200, tuneEvery: 17000 },
  { from: 1200, to: 130, machines: [{ x: 780, kind: 'main' }, { x: 400, kind: 'check' }], box: 88, rx: 24, teeth: 7, slots: [580, 1050, 250, 930], tune: 9000, tuneEvery: 14500 },
  { from: 130, to: 1150, machines: [{ x: 420, kind: 'main' }, { x: 800, kind: 'check' }], box: 104, rx: 6, teeth: 11, slots: [700, 950, 250, 1050], tune: 3000, tuneEvery: 19000 },
  { from: 1150, to: 190, machines: [{ x: 850, kind: 'main' }, { x: 480, kind: 'check' }], box: 92, rx: 18, teeth: 8, slots: [600, 1010, 340], tune: 12500, tuneEvery: 15500 },
  { from: 190, to: 1250, machines: [{ x: 560, kind: 'main' }, { x: 900, kind: 'check' }], box: 100, rx: 10, teeth: 10, slots: [800, 330, 1060, 1160], tune: 15500, tuneEvery: 16500 },
] as const;

/** The whole belt as one path: along a section, down to the next, back along that one. */
const PATH: P[] = RAW.flatMap((raw, i) => [[raw.from, -40 + ROW * i] as P, [raw.to, -40 + ROW * i] as P]);
const TOTAL = pathLength(PATH);

const SECTIONS: Section[] = RAW.map((raw, i) => {
  const y = -40 + ROW * i;
  const dir = raw.to > raw.from ? 1 : -1;
  const main = raw.machines.find((machine) => machine.kind === 'main')!.x;
  const walkY = y + 78;
  const bench: P = [main - 78, walkY];
  const before = pathLength(PATH.slice(0, 2 * i + 1));
  // each walks their own section the way the belt will run, then goes to the bench
  const enter = 300 + i * 300;
  const door: P = [dir > 0 ? -40 : 1330, walkY];
  const far: P = [raw.to - 70 * dir, walkY];
  const laid = enter + Math.abs(far[0] - door[0]) / WALK;
  const back = laid + Math.abs(far[0] - bench[0]) / WALK;
  return {
    i,
    y,
    from: raw.from,
    to: raw.to,
    machines: raw.machines.map((machine) => ({ ...machine })),
    box: raw.box,
    rx: raw.rx,
    gear: gearPath(19, raw.teeth),
    slots: [...raw.slots],
    tune: raw.tune,
    tuneEvery: raw.tuneEvery,
    dir,
    main,
    mainAt: before + Math.abs(main - raw.from),
    walkY,
    bench,
    enter,
    laid,
    back,
    build: [
      { at: enter, p: door },
      { at: laid, p: far },
      { at: back, p: bench },
    ],
  };
});
/** The belt starts once the last of them is at the bench. */
const START = Math.max(...SECTIONS.map((section) => section.back)) + 400;

// ── the belt's own clock ────────────────────────────────────────────────────
const PERIOD = BREAK.every + BREAK.build + BREAK.clear;
/** Which breakdown this is and how long ago it began; `tau` is real ms since the belt started. */
function breakdown(tau: number): { n: number; since: number } {
  if (tau < BREAK.first) return { n: -1, since: 0 };
  const n = Math.floor((tau - BREAK.first) / PERIOD);
  return { n, since: tau - BREAK.first - n * PERIOD };
}
/** The belt stands twice in a breakdown: while the bypass goes up, and while it comes down. */
const halted = (since: number) => since < BREAK.build || (since >= BREAK.build + BREAK.run && since < BREAK.build + BREAK.run + BREAK.clear);
function lineClock(tau: number): number {
  if (tau <= 0) return 0;
  const { n, since } = breakdown(tau);
  if (n < 0) return tau;
  const base = BREAK.first + n * BREAK.every;
  if (since < BREAK.build) return base;
  if (since < BREAK.build + BREAK.run) return base + since - BREAK.build;
  if (since < BREAK.build + BREAK.run + BREAK.clear) return base + BREAK.run;
  return base + since - BREAK.build - BREAK.clear;
}
/** The real moment (since the start) the belt reaches `lt` of its own time. */
function realOf(lt: number): number {
  if (lt <= BREAK.first) return lt;
  const k = Math.floor((lt - BREAK.first) / BREAK.every);
  const into = lt - BREAK.first - k * BREAK.every;
  return BREAK.first + k * PERIOD + BREAK.build + into + (into >= BREAK.run ? BREAK.clear : 0);
}
/**
 * Breakdown n: whose section — always its main machine, the one that puts that engineer's piece
 * on, so that a piece really is missing. Never the same section twice running, and never the
 * first: the bypass swings up into the walkway of the section above, and the first has none.
 */
const brokenSection = (n: number) => 1 + ((n * 2 + Math.floor(noise(n, 5) * 2)) % (SECTIONS.length - 1));
const standAt = (section: Section, q: number): P => (section.machines[q].kind === 'main' ? section.bench : [section.machines[q].x, section.walkY]);

/**
 * The bypass round a section's main machine: off the belt, along beside it, back on — with a
 * short run of the belt itself at either end, so that a car turns into it and out of it.
 */
const detourPath = (section: Section): P[] => [
  [section.main - (DETOUR.half + DETOUR.lead) * section.dir, section.y],
  [section.main - DETOUR.half * section.dir, section.y],
  [section.main - DETOUR.half * section.dir, section.y - DETOUR.rise],
  [section.main + DETOUR.half * section.dir, section.y - DETOUR.rise],
  [section.main + DETOUR.half * section.dir, section.y],
  [section.main + (DETOUR.half + DETOUR.lead) * section.dir, section.y],
];
/** How far along `detourPath` a car is when it is `past` the machine along the belt. */
function detourAt(past: number): number {
  if (past < -DETOUR.half) return past + DETOUR.half + DETOUR.lead;
  if (past > DETOUR.half) return DETOUR.lead + DETOUR_LENGTH + past - DETOUR.half;
  return DETOUR.lead + ((past + DETOUR.half) / (2 * DETOUR.half)) * DETOUR_LENGTH;
}
/** Did car c go round this section's machine? It did if it got there while the bypass was open. */
function wentRound(section: Section, c: number): boolean {
  if (section.i === 0) return false;
  const arrives = realOf((section.mainAt - DETOUR.half + c * GAP) / SPEED);
  if (arrives < BREAK.first) return false;
  const n = Math.floor((arrives - BREAK.first) / PERIOD);
  const since = arrives - BREAK.first - n * PERIOD;
  return brokenSection(n) === section.i && since >= BREAK.build && since < DETOUR_SHUT;
}

/** Improvement j starts at this real moment; it is skipped when a breakdown this engineer is busy with — their own, or a neighbour's — is in its way. */
const tuneAt = (section: Section, j: number) => section.tune + j * section.tuneEvery;
function skipped(section: Section, j: number): boolean {
  const a = tuneAt(section, j);
  const near = Math.floor((a - BREAK.first) / PERIOD);
  for (const n of [near - 1, near, near + 1]) {
    if (n < 0 || Math.abs(brokenSection(n) - section.i) > 1) continue;
    const b = BREAK.first + n * PERIOD;
    if (a + IMPROVE + 2600 > b - 300 && a < b + BREAK.build + BREAK.run + BREAK.clear + 2600) return true;
  }
  return false;
}
const tuneSpot = (section: Section, j: number): P => (j < section.slots.length ? [section.slots[j], section.walkY] : standAt(section, j % section.machines.length));

/** Away from the bench to a spot and back: where the engineer is, and whether at work there. */
function visit(home: P, spot: P, a: number, dur: number, tau: number): { p: P; angle: number; moving: boolean; walked: number; working: boolean } | null {
  const dist = Math.hypot(spot[0] - home[0], spot[1] - home[1]);
  const walk = dist / STEP;
  if (tau < a || tau >= a + dur + walk) return null;
  const heading = spot[0] >= home[0] ? 0 : 180;
  if (tau < a + walk) {
    const u = (tau - a) / walk;
    return { p: [lerp(home[0], spot[0], u), lerp(home[1], spot[1], u)], angle: heading, moving: true, walked: dist * u, working: false };
  }
  if (tau < a + dur) return { p: spot, angle: dist < 1 ? -40 : -90, moving: false, walked: 0, working: true };
  const u = (tau - a - dur) / walk;
  return { p: [lerp(spot[0], home[0], u), lerp(spot[1], home[1], u)], angle: 180 - heading, moving: true, walked: dist * u, working: false };
}

// ── the cars: no two the same — one choice from each engineer ────────────────
type Variant = { rims: number; lamps: number; style: number; paint: number; extra: number };
const variantOf = (c: number): Variant => ({
  rims: (c + Math.floor(c / 4)) % 3,
  lamps: (c * 2 + Math.floor(c / 5)) % 3,
  style: (c + Math.floor(c / 3)) % 3,
  paint: (c * 3 + Math.floor(c / PAINTS)) % PAINTS,
  extra: Math.floor(noise(c, 9) * 4) % 4,
});

const Rims = ({ v }: { v: number }) => (
  <>
    {[-30, 30].flatMap((wx) => [-27, 27].map((wy) => <rect key={`${wx}${wy}`} className={`ww-tf__rim ww-tf__rim--${v}`} x={wx - 6} y={wy - 2.5} width="12" height="5" rx="2" />))}
  </>
);
const Lamps = ({ v, x }: { v: number; x: number }) => (
  <>
    <circle className={`ww-tf__lamp ww-tf__lamp--${v}`} cx={x} cy="-11" r="4.5" />
    <circle className={`ww-tf__lamp ww-tf__lamp--${v}`} cx={x} cy="11" r="4.5" />
  </>
);
/** The body, in the car's own coordinates (it faces right): its shape, then its paint. */
function Shell({ variant, tint }: { variant: Variant; tint: number }) {
  const draw = (paint: string) => (
    <>
      {variant.style === 0 && <rect className={paint} x="-46" y="-22" width="68" height="44" rx="11" />}
      {variant.style === 1 && <rect className={paint} x="-48" y="-23" width="74" height="46" rx="8" />}
      {variant.style === 2 && (
        <>
          <rect className={paint} x="-48" y="-22" width="42" height="44" rx="5" />
          <rect className="ww-tf__bedin" x="-43" y="-17" width="31" height="34" rx="3" />
          <rect className={paint} x="-10" y="-22" width="33" height="44" rx="10" />
        </>
      )}
      <rect className={paint} x="19" y="-19" width="28" height="38" rx="8" />
    </>
  );
  return (
    <>
      {tint < 1 && draw('ww-tf__paint ww-tf__paint--raw')}
      {tint > 0 && <g opacity={tint.toFixed(2)}>{draw(`ww-tf__paint ww-tf__paint--${variant.paint}`)}</g>}
      <rect className="ww-tf__window" x={variant.style === 1 ? 12 : 5} y="-16" width="10" height="32" rx="4" />
      {variant.style !== 2 && <rect className="ww-tf__window" x="-41" y="-13" width="7" height="26" rx="3" />}
    </>
  );
}
/** The last engineer's piece: stripes, a roof rack, a spoiler, or a white roof. */
function Extra({ variant }: { variant: Variant }) {
  const roof = variant.style === 2 ? -4 : -30;
  if (variant.extra === 0) return <path className="ww-tf__stripe" d="M-44 -6 H45 M-44 6 H45" />;
  if (variant.extra === 1) return <path className="ww-tf__rack" d={`M${roof} -17 V17 M${roof + 9} -17 V17 M${roof + 18} -17 V17 M${roof - 4} -17 H${roof + 22} M${roof - 4} 17 H${roof + 22}`} />;
  if (variant.extra === 2) return <rect className={`ww-tf__paint ww-tf__paint--${variant.paint}`} x="-56" y="-25" width="10" height="50" rx="3" />;
  return <rect className="ww-tf__roof" x={roof} y="-15" width={variant.style === 2 ? 14 : 30} height="30" rx="6" />;
}

/** A car at some stage: 0 the chassis, then one more piece from each engineer in turn. */
function Auto({ x, y, angle = 0, stage, variant }: { x: number; y: number; angle?: number; stage: number; variant: Variant }) {
  const s = (CS * K).toFixed(3);
  return (
    <g>
      {stage >= 3 && (
        <g transform={`translate(${(x + SHADE[0] * CS).toFixed(1)} ${(y + SHADE[1] * CS).toFixed(1)}) rotate(${angle.toFixed(1)}) scale(${s})`}>
          <rect className="ww-tf__shadow" x="-50" y="-27" width="100" height="54" rx="12" />
        </g>
      )}
      <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle.toFixed(1)}) scale(${s})`}>
        {stage >= 1 && (
          <>
            <Wheels />
            <Rims v={variant.rims} />
          </>
        )}
        <path className="ww-tf__chassis" d="M-44 -12 H44 M-44 12 H44 M-30 -24 V24 M30 -24 V24" />
        {stage >= 2 && (
          <g transform="translate(33 0)">
            <Engine />
            <Lamps v={variant.lamps} x={10} />
          </g>
        )}
        {stage >= 3 && <Shell variant={variant} tint={stage >= 4 ? 1 : 0} />}
        {stage >= 3 && <Lamps v={variant.lamps} x={43} />}
        {stage >= 5 && <Extra variant={variant} />}
      </g>
    </g>
  );
}

/** What lies on engineer i's bench: the piece for the next car, being made by hand. */
function Piece({ i, variant, pr }: { i: number; variant: Variant; pr: number }) {
  if (i === 0) {
    return (
      <>
        <Wheels />
        <Rims v={variant.rims} />
      </>
    );
  }
  if (i === 1) {
    return (
      <>
        <Engine />
        <Lamps v={variant.lamps} x={10} />
      </>
    );
  }
  if (i === 2) return <g transform="translate(0 0)"><Shell variant={variant} tint={0} /></g>;
  if (i === 3) {
    // a pot of paint, filling
    return (
      <>
        <circle className="ww-tf__addon" r="24" />
        <circle className={`ww-tf__paint ww-tf__paint--${variant.paint}`} r={(6 + 14 * seg(pr, 0.1, 0.5)).toFixed(1)} />
      </>
    );
  }
  return <Extra variant={variant} />;
}

// ── the car park: two lanes, a column of bays off each ───────────────────────
const LOT = { x: 1296, laneA: 1340, laneB: 1530, colA: 1436, colB: 1626, top: -80, row: 62, rows: 12 };
const GATE: P = PATH[PATH.length - 1];
type Bay = { x: number; y: number; far: boolean };
/** In the order they fill: the nearest the gate first. */
const BAYS: Bay[] = Array.from({ length: LOT.rows }, (_, r) => -10 + LOT.row * r)
  .sort((a, b) => Math.abs(a - GATE[1]) - Math.abs(b - GATE[1]))
  .flatMap((y) => [
    { x: LOT.colA, y, far: false },
    { x: LOT.colB, y, far: true },
  ]);
function wayTo(bay: Bay | undefined): P[] {
  if (!bay) return [GATE, [LOT.laneA, GATE[1]], [LOT.laneA, 860]];
  if (bay.far) return [GATE, [LOT.laneA, GATE[1]], [LOT.laneA, LOT.top], [LOT.laneB, LOT.top], [LOT.laneB, bay.y], [bay.x, bay.y]];
  if (Math.abs(bay.y - GATE[1]) < 40) return [GATE, [bay.x, bay.y]];
  return [GATE, [LOT.laneA, GATE[1]], [LOT.laneA, bay.y], [bay.x, bay.y]];
}

/** The ground: drawn once. A slab under each section — each its engineer's own — and the car park. */
const Ground = memo(function Ground() {
  return (
    <svg className="ww-tf__layer" viewBox={VIEW} aria-hidden="true">
      <defs>
        <clipPath id="ww-te-site">
          <rect x="0" y="-110" width="1700" height="860" rx="28" />
        </clipPath>
        <filter id="ww-te-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="4" seed="23" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.5 -0.55" />
          <feComposite in="SourceGraphic" operator="in" />
        </filter>
        <filter id="ww-te-speckle" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="8" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 2.2 -1.25" />
          <feComposite in="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <g clipPath="url(#ww-te-site)">
        <rect className="ww-tf__sand" x="0" y="-110" width="1700" height="860" />
        <rect className="ww-tf__sand ww-tf__sand--dark" x="0" y="-110" width="1700" height="860" filter="url(#ww-te-grain)" />
        <rect className="ww-tf__sand ww-tf__sand--speck" x="0" y="-110" width="1700" height="860" filter="url(#ww-te-speckle)" />
        {Array.from({ length: 70 }, (_, i) => {
          const x = 1300 * noise(i, 11);
          const y = -110 + 860 * noise(i, 12);
          const r = 3 + 7 * noise(i, 13);
          return <ellipse key={i} className="ww-tf__pebble" cx={x.toFixed(1)} cy={y.toFixed(1)} rx={r.toFixed(1)} ry={(r * 0.7).toFixed(1)} />;
        })}
        {SECTIONS.map((section) => {
          const lo = Math.min(section.from, section.to) - 78;
          const hi = Math.min(1284, Math.max(section.from, section.to) + 78);
          return (
            <g key={section.i}>
              <rect className="ww-tf__shadow" x={lo + SHADE[0]} y={section.y - 54 + SHADE[1]} width={hi - lo} height="160" rx="16" />
              <rect className="ww-tf__concrete" x={lo} y={section.y - 54} width={hi - lo} height="160" rx="16" />
              <rect className="ww-tf__concrete ww-tf__concrete--speck" x={lo} y={section.y - 54} width={hi - lo} height="160" rx="16" filter="url(#ww-te-speckle)" />
            </g>
          );
        })}
        <rect className="ww-tf__asphalt" x={LOT.x} y="-110" width={1700 - LOT.x} height="860" />
        <rect className="ww-tf__asphalt" x={GATE[0] - 4} y={GATE[1] - 32} width={LOT.x - GATE[0] + 8} height="64" />
        <rect className="ww-tf__asphalt ww-tf__asphalt--speck" x={LOT.x} y="-110" width={1700 - LOT.x} height="860" filter="url(#ww-te-speckle)" />
        {BAYS.map((bay, i) => (
          <path key={i} className="ww-tf__bay" d={`M${bay.x - 54} ${bay.y - LOT.row / 2} H${bay.x + 50} V${bay.y + LOT.row / 2} H${bay.x - 54}`} />
        ))}
      </g>
    </svg>
  );
});

/** What an engineer adds to a section, four kinds; `x` is where along it. */
function AddOn({ section, x, kind, up, t }: { section: Section; x: number; kind: number; up: number; t: number }) {
  const y = section.y;
  const s = `scale(${up.toFixed(3)})`;
  if (kind === 0) {
    // a gantry over the belt, with a light that scans
    return (
      <g transform={`translate(${x} ${y}) ${s}`}>
        <path className="ww-tf__beam" d="M0 -40 V40" />
        <rect className="ww-tf__addon" x="-9" y="-48" width="18" height="16" rx="4" />
        <rect className="ww-tf__addon" x="-9" y="32" width="18" height="16" rx="4" />
        <circle className="ww-tf__glow" cx="0" cy={(24 * Math.sin(t / 380 + x)).toFixed(1)} r="6" />
      </g>
    );
  }
  if (kind === 1) {
    // a drive unit on the edge of the belt
    return (
      <g transform={`translate(${x} ${y + 46}) ${s}`}>
        <rect className="ww-tf__addon" x="-24" y="-13" width="48" height="26" rx="6" />
        <g transform={`rotate(${(t / 9).toFixed(1)}) scale(0.5)`}>
          <path className={`ww-tf__gear ww-tf__gear--${section.i}`} d={section.gear} />
        </g>
      </g>
    );
  }
  if (kind === 2) {
    // an arm that reaches over the belt and back
    return (
      <g transform={`translate(${x} ${y - 44}) ${s}`}>
        <g transform={`rotate(${(90 + 34 * Math.sin(t / 520 + x)).toFixed(1)})`}>
          <path className="ww-tf__beam" d="M0 0 H38" />
          <circle className="ww-tf__glow" cx="40" r="6" />
        </g>
        <circle className="ww-tf__addon" r="12" />
      </g>
    );
  }
  // a signal mast
  return (
    <g transform={`translate(${x} ${y - 44}) ${s}`}>
      <rect className="ww-tf__addon" x="-13" y="-11" width="26" height="22" rx="5" />
      <circle className={Math.floor(t / 500 + x) % 2 === 0 ? 'ww-tf__light ww-tf__light--on' : 'ww-tf__light'} r="6" />
    </g>
  );
}

function Site() {
  const t = useLoopClock(EXPORT_AT);
  useAnimating(!EXPORT_MODE && t < START + 2000);

  const tau = t - START;
  const running = tau >= 0;
  const stopped = running ? breakdown(tau) : { n: -1, since: 0 };
  const { since } = stopped;
  /** Whose section is in trouble right now (from the halt until the bypass is cleared away), if anybody's. */
  const broken = stopped.n >= 0 && since < BREAK.build + BREAK.run + BREAK.clear + 3000 ? SECTIONS[brokenSection(stopped.n)] : null;
  const down = stopped.n >= 0 && halted(since);
  const dead = broken && since < BREAK.mended ? broken.i : -1;
  const lt = lineClock(tau);
  const run = SPEED * lt;

  // ── the cars on the belt: car c is `run − c·GAP` along it, round a dead machine if it met one ──
  const cars = [];
  if (running) {
    for (let c = Math.max(0, Math.ceil((run - TOTAL) / GAP)); c * GAP <= run; c++) {
      const at = run - c * GAP;
      let pos = follow(PATH, at, 60);
      let stage = 0;
      for (const section of SECTIONS) {
        const round = wentRound(section, c);
        const past = at - section.mainAt;
        if (round && Math.abs(past) < DETOUR.half + DETOUR.lead) pos = follow(detourPath(section), detourAt(past), 40);
        // a car that went round gets this piece a little further on, by hand
        if (past > (round ? DETOUR.fit : 0)) stage++;
      }
      cars.push(<Auto key={c} x={pos.p[0]} y={pos.p[1]} angle={pos.angle} stage={stage} variant={variantOf(c)} />);
    }
  }

  // ── the bypass itself: up while the belt stands, away when the machine runs again ──
  let bypass = null;
  if (broken && since < BREAK.build + BREAK.run + BREAK.clear) {
    const [, a, b, c] = detourPath(broken);
    const lengths = [DETOUR.rise, 2 * DETOUR.half, DETOUR.rise];
    const starts = [0, DETOUR.rise, DETOUR.rise + 2 * DETOUR.half];
    const laid = (p: number, k: number) => clamp01((p * DETOUR_LENGTH - starts[k]) / lengths[k]);
    const plan = seg(since, 300, 900);
    const built = seg(since, 1100, 1100);
    bypass = (
      <g opacity={(1 - seg(since, BREAK.build + BREAK.run + 150, 900)).toFixed(2)}>
        <Belt x={a[0]} y={a[1]} len={lengths[0]} w={56} turn={-90} plan={laid(plan, 0)} built={laid(built, 0)} off={run} />
        <Belt x={c[0]} y={c[1]} len={lengths[2]} w={56} turn={90} plan={laid(plan, 2)} built={laid(built, 2)} off={run} />
        <Belt x={b[0]} y={b[1]} len={lengths[1]} w={56} turn={broken.dir > 0 ? 0 : 180} plan={laid(plan, 1)} built={laid(built, 1)} off={run} />
      </g>
    );
  }

  // ── the cars that have left it: to a bay while there is one, then off the picture ──
  const out = [];
  for (let c = 0; ; c++) {
    const at = START + realOf((TOTAL + c * GAP) / SPEED);
    if (at > t) break;
    const bay = BAYS[c] as Bay | undefined;
    const path = wayTo(bay);
    const dist = (t - at) * DRIVE;
    const arrived = dist >= pathLength(path);
    if (!bay && arrived) continue;
    const pos = arrived && bay ? { p: [bay.x, bay.y] as P, angle: 0 } : follow(path, dist, 40);
    out.push(<Auto key={c} x={pos.p[0]} y={pos.p[1]} angle={pos.angle} stage={5} variant={variantOf(c)} />);
  }

  const tick = Math.floor(t / 90);
  const scenes = SECTIONS.map((section) => {
    const { y } = section;

    // ── the engineer: laying the section, then at the bench unless something calls ──
    let who: { p: P; angle: number; moving: boolean; walked: number };
    let work: 'none' | 'bench' | 'mend' | 'improve' | 'fit' = 'none';
    let workAt: P = section.bench;
    /** which side of the engineer the work is: −1 up the picture, 1 down it */
    let side = -1;
    if (!running) {
      const walk = along(section.build, t);
      who = { ...walk, angle: walk.moving ? walk.angle : 0 };
    } else {
      who = { p: section.bench, angle: 0, moving: false, walked: 0 };
      work = 'bench';
      let away = null;
      let busy = false;
      if (broken && section.i === broken.i && since < BREAK.mended) {
        // their own machine, right beside the bench
        busy = true;
        work = 'mend';
        who = { ...who, angle: -40 };
      } else if (broken && Math.abs(section.i - broken.i) === 1) {
        // A neighbour comes over to the far end of the bypass, to put the missing piece on by hand.
        // The one above shares this walkway and stands on its side of the belt; the one below
        // crosses their own belt while it stands, and goes back when it stands again.
        const above = section.i < broken.i;
        const spot: P = [broken.main + DETOUR.fit * broken.dir, broken.y + (above ? -70 : 70)];
        const across = Math.abs(section.walkY - spot[1]) / HURRY;
        const beside = Math.abs(spot[0] - section.bench[0]) / HURRY;
        const back = BREAK.build + BREAK.run + 100;
        const keys: Key[] = [
          { at: 0, p: section.bench },
          { at: 200, p: section.bench },
          { at: 200 + beside, p: [spot[0], section.walkY] },
          { at: 200 + beside + across, p: spot },
          { at: back, p: spot },
          { at: back + across, p: [spot[0], section.walkY] },
          { at: back + across + beside, p: section.bench },
        ];
        if (since < keys[keys.length - 1].at) {
          const walk = along(keys, since);
          const working = since >= keys[3].at && since < back;
          away = { p: walk.p, angle: walk.moving ? walk.angle : working ? (above ? 90 : -90) : 0, moving: walk.moving, walked: walk.walked, working };
          workAt = spot;
          side = above ? 1 : -1;
          work = working ? 'fit' : 'none';
        }
      }
      const j = Math.floor((tau - section.tune) / section.tuneEvery);
      if (!away && !busy && j >= 0 && !skipped(section, j)) {
        const spot = tuneSpot(section, j);
        away = visit(section.bench, spot, tuneAt(section, j), IMPROVE, tau);
        if (away) {
          workAt = spot;
          work = away.working ? 'improve' : 'none';
        }
      }
      if (away) {
        // round the bench rather than through it
        const onRow = Math.abs(away.p[1] - section.walkY) < 1;
        const round = away.moving && onRow ? 36 * clamp01(1 - Math.abs(away.p[0] - section.main) / 74) : 0;
        who = { ...away, p: [away.p[0], away.p[1] + round] };
      }
      // the hands only work while there is something coming past
      if (work === 'fit' && halted(since)) work = 'none';
    }

    // ── the section's belt, laid behind its engineer, and the drop to the next ──
    const walkedTo = (at: number) => along(section.build.slice(0, 2), Math.max(section.enter, at)).p[0];
    const span = Math.abs(section.to - section.from) + (section.i === 0 ? 40 : 0);
    const head = section.from - (section.i === 0 ? 40 : 0);
    const reach = (at: number) => (at >= section.laid ? 1 : clamp01(((walkedTo(at) - head) * section.dir + 70) / span));
    const last = section.i === SECTIONS.length - 1;

    // ── the bench: this engineer's piece for the next car, made by hand ──
    const ahead = (run - section.mainAt) / GAP;
    const next = Math.max(0, Math.floor(ahead) + 1);
    const pr = ahead >= 0 ? ahead - Math.floor(ahead) : clamp01(1 + ahead);
    const nextVariant = variantOf(next);
    const benchUp = pop(seg(t, section.enter + Math.abs(section.main - section.build[0].p[0]) / WALK + 500, 400));
    const made = running && dead !== section.i ? pop(seg(pr, 0.03, 0.08)) * (1 - seg(pr, 0.985, 0.015)) : 0;

    // ── what has been added so far ──
    const addOns = section.slots.map((x, j) => {
      if (!running || skipped(section, j)) return null;
      const up = pop(seg(tau, tuneAt(section, j) + IMPROVE - 700, 450));
      return up > 0 ? <AddOn key={j} section={section} x={x} kind={(j + section.i) % 4} up={up} t={t} /> : null;
    });

    return {
      belt: (
        <g key={section.i}>
          {!last && <Belt x={section.to} y={y} len={ROW} w={64} turn={90} plan={seg(t, section.laid, 400)} built={seg(t, section.laid + 500, 400)} off={run} />}
          <Belt x={head} y={y} len={span} w={64} turn={section.dir > 0 ? 0 : 180} plan={reach(t)} built={reach(t - 700)} off={run} />
        </g>
      ),
      bench: (
        <g key={section.i}>
          <g transform={`translate(${section.main} ${section.walkY}) scale(${benchUp.toFixed(3)})`}>
            <rect className="ww-tf__shadow" x={-36 + SHADE[0]} y={-26 + SHADE[1]} width="72" height="52" rx="8" />
            <rect className="ww-tf__table" x="-36" y="-26" width="72" height="52" rx="8" />
          </g>
          {made > 0 && (
            <g transform={`translate(${section.main + (section.i === 2 ? 8 : 0)} ${lerp(section.walkY, y, ease(seg(pr, 0.93, 0.07))).toFixed(1)}) scale(${(CS * K * 0.82 * made).toFixed(3)})`}>
              <Piece i={section.i} variant={nextVariant} pr={pr} />
            </g>
          )}
        </g>
      ),
      over: (
        <g key={section.i}>
          {section.machines.map((machine, q) => {
            const up = pop(seg(t, section.enter + Math.abs(machine.x - section.build[0].p[0]) / WALK + 300, 450));
            if (up <= 0) return null;
            const isDead = dead === section.i && machine.kind === 'main';
            const lit = isDead ? Math.floor(t / 260) % 2 === 0 : running && !down && Math.floor(t / 420 + q + section.i) % 2 === 0;
            const half = section.box / 2;
            const side = q % 2 === 0 ? 1 : -1;
            return (
              <g key={q} transform={`translate(${machine.x} ${y}) scale(${up.toFixed(3)})`}>
                <rect className="ww-tf__shadow" x={-half + SHADE[0]} y={-46 + SHADE[1]} width={section.box} height="92" rx={section.rx} />
                <rect className="ww-tf__case" x={-half} y="-46" width={section.box} height="92" rx={section.rx} />
                <rect className="ww-tf__plate" x={-half + 9} y="-37" width={section.box - 18} height="74" rx={Math.max(4, section.rx - 6)} />
                {isDead && <rect className="ww-tf__alarm" x={-half - 7} y="-53" width={section.box + 14} height="106" rx={section.rx + 6} opacity={(0.35 + 0.65 * Math.abs(Math.sin(t / 260))).toFixed(2)} />}
                {machine.kind === 'check' ? (
                  <>
                    <path className="ww-tf__beam" d="M0 -26 V26" />
                    <circle className="ww-tf__glow" cy={(down ? 0 : 20 * Math.sin(lt / 300 + q)).toFixed(1)} r="7" />
                  </>
                ) : (
                  <g transform={`translate(${-12 * side} ${machine.kind === 'main' ? -8 : 0}) rotate(${((lt / 12) * side).toFixed(1)})`}>
                    <path className={`ww-tf__gear ww-tf__gear--${section.i}`} d={section.gear} />
                    <circle className="ww-tf__rivet" r="4" />
                  </g>
                )}
                {machine.kind === 'source' && <circle className="ww-tf__stack" cx="18" cy="-18" r="9" />}
                <circle className={lit ? (isDead ? 'ww-tf__light ww-tf__light--alarm' : 'ww-tf__light ww-tf__light--on') : 'ww-tf__light'} cx={22 * side} cy="24" r="6" />
              </g>
            );
          })}
          {addOns}
          {t >= section.enter && (
            <Person
              kind="engineer"
              k={PK}
              p={who.p}
              angle={who.angle}
              stride={who.moving ? Math.sin((who.walked / 30) * Math.PI) : 0}
              point={!running && t < section.laid ? 1 : 0}
              reach={work === 'none' ? 0 : 1}
              swing={Math.sin(t / (work === 'bench' ? 140 : 70) + section.i)}
            />
          )}
          {/* sparks where a tool meets a machine; drops of the car's own paint at the bench */}
          {(work === 'mend' || work === 'improve' || work === 'fit') &&
            [0, 1, 2].map((j) =>
              noise(section.i, j, tick) < 0.4 ? null : (
                <path
                  key={j}
                  className="ww-tf__spark"
                  d={SPARK}
                  transform={`translate(${(workAt[0] + (workAt === section.bench ? 34 : -22 + 44 * noise(j, tick, 1))).toFixed(1)} ${(workAt[1] + (side > 0 ? 30 : -46) + 16 * noise(tick, j, 2)).toFixed(1)}) scale(${(0.6 + 0.8 * noise(tick, j, 3)).toFixed(2)})`}
                />
              ),
            )}
          {work === 'bench' &&
            made > 0 &&
            [0, 1, 2].map((j) =>
              noise(section.i, j, tick, 4) < 0.5 ? null : (
                <circle
                  key={j}
                  className={`ww-tf__paint--${nextVariant.paint}`}
                  cx={(section.main - 30 + 60 * noise(j, tick, 5)).toFixed(1)}
                  cy={(section.walkY - 30 + 60 * noise(tick, j, 6)).toFixed(1)}
                  r={(2.5 + 3 * noise(tick, j, 7)).toFixed(1)}
                />
              ),
            )}
        </g>
      ),
    };
  });

  return (
    <svg
      className="ww-tf__layer"
      viewBox={VIEW}
      role="img"
      aria-label="Seen from above: one conveyor belt winds through five sections, each built and run by one engineer; the machines put the car together by themselves while each engineer customises a piece by hand at a bench, mends their section when it breaks and keeps adding to it; every car that drives off to the car park is different"
    >
      <g clipPath="url(#ww-te-site)">
        {scenes.map((scene) => scene.belt)}
        {bypass}
        {cars}
        {scenes.map((scene) => scene.bench)}
        {scenes.map((scene) => scene.over)}
        {out}
      </g>
    </svg>
  );
}

export const EngineersFactorySlide: SlideDefinition = {
  id: 'factory-engineers',
  content: () => (
    <div className="ww-gb ww-tf">
      <Ground />
      <Site />
    </div>
  ),
  notes:
    'No clicks — it plays by itself, talk over it; the first finished car reaches the car park in '
    + 'under forty seconds. And this is the factory I believe in. Same world, different people: there '
    + 'are no workers here, everybody is an engineer. It is still ONE line — follow the belt, it winds '
    + 'through five sections — but each section was built by one engineer, alone, and they are all a '
    + 'little different. The assembly itself happens without them: the car goes into a machine and '
    + 'comes out with one more piece on. So what does the engineer do all day? Three things. '
    + 'Customises — at the bench, by hand: one does the rims, one the lamps, one the shape of the '
    + 'body, one the paint, one the extras; that is why no two cars in that car park are the same. '
    + 'Mends — and watch what happens when a machine breaks: nobody waits. The neighbours come over, '
    + 'lay a bypass round the dead machine in a couple of seconds and put the missing piece on every '
    + 'passing car by hand, while its own engineer fixes it; then the bypass comes down. And improves — every '
    + 'so often they add something new to their section, so tomorrow it needs them a little less.',
};
