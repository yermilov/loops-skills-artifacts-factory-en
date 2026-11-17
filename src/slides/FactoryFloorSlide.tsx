import { memo, useLayoutEffect, useState } from 'react';
import { SlideDefinition } from '../types/slides';
import { EXPORT_MODE, clamp01, lerp, seg } from '../components/ctxScene';
import { useAnimating } from '../components/frameSettled';

/**
 * The factory everyone imagines, seen from ABOVE — the second take on this slide
 * (Yarik, 17.11.2026: «може в стилі факторіо зробимо? … якщо що відкотимося»; the
 * first, a side view, is kept in ClassicFactorySlide.tsx and is one line in
 * slides/index.ts away). Then: «мені так більше подобається … ще ближче», and no
 * «cars» box with a counter — «хай вони просто виїжджають і стають на парковку».
 *
 * The genre is the factory-builder's: a site read like a map — sand, a concrete
 * apron, belts that carry things, machines that put parts on them, a car park.
 * So this one slide leaves the deck's flat lavender for a world of its own: earth
 * and steel (`--tf-*` in tokens.css), grain on the ground, a shadow under every
 * thing. The drawing itself is ours — nothing is taken from any game.
 *
 * Five acts on one clock, his script:
 *   1. very smart engineers build a factory with conveyor lines — the two of them
 *      leave the plan table, walk the site, and where they walk the line appears first as a
 *      blueprint and then for real;
 *   2. ordinary people come to work on the line — six identical workers walk in
 *      and take their places, two at each station;
 *   3. parts start to travel along the lines — a chassis on the main belt; wheels,
 *      engines and bodies down the three feeders;
 *   4. the workers put them together — the belt moves a station and stops, the
 *      part comes over, the wrenches swing;
 *   5. and many identical cars come out — each drives off the end of the belt, up
 *      the lane and into the next free bay; once the park is full the rest drive
 *      down the lane and off the slide (Yarik: «хай машини просто уїзжають за слайд»).
 *
 * And an episode that comes back every so often (Yarik, 17.11.2026: «одна лінія
 * ламається, все зупиняється і всі чекають поки інженер полагодить»): a feeder's
 * machine dies mid-beat, every belt halts where it is, the workers turn and look,
 * an engineer walks over from the table, mends it, and the line picks up exactly
 * where it stopped. So the LINE has a clock of its own that the stop holds still
 * (`lineTime`); people walking and cars already on the road stay on the real one.
 *
 * Then it keeps running for as long as the slide is up (an endless loop is ambient
 * for the ready mark; the build is not, hence `useAnimating`). The PDF gets one
 * fixed moment of a late cycle. Everything is derived from the clock — no state,
 * no dice. Two SVGs on the Goldberg canvas: the ground, drawn once (its grain is a
 * filter, and must not be recomputed every frame), and what moves, over it.
 * Styles are `.ww-tf…`.
 */

export type P = [number, number];

// ── the clock ───────────────────────────────────────────────────────────────
const T = { office: 200, power: 6300, hire: 6700, run: 10700 };
/** One beat of the line: the belt moves a station, then everybody works. */
const MOVE = 800;
const CYCLE = 2200;

// ── the breakdown: the line's clock stands still while a machine is mended ────
/** The first stop, in the middle of beat 6's move; then one every `EVERY` beats. */
const BREAK = { first: T.run + CYCLE * 6 + MOVE * 0.5, every: CYCLE * 10, stop: 6500, leave: 600, mended: 6000 };
const BREAK_PERIOD = BREAK.every + BREAK.stop;
/** Which stop this is and how long ago it began (real ms); `n` is −1 before the first. */
function breakdown(t: number): { n: number; since: number } {
  if (t < BREAK.first) return { n: -1, since: 0 };
  const n = Math.floor((t - BREAK.first) / BREAK_PERIOD);
  return { n, since: t - BREAK.first - n * BREAK_PERIOD };
}
/** The line's own time: the real one, less every stop so far. */
function lineTime(t: number): number {
  const { n, since } = breakdown(t);
  return n < 0 ? t : BREAK.first + n * BREAK.every + Math.max(0, since - BREAK.stop);
}
/** The real moment the line reaches `lt` of its own time. */
const realTime = (lt: number) => (lt <= BREAK.first ? lt : lt + BREAK.stop * (Math.floor((lt - BREAK.first) / BREAK.every) + 1));
const EXPORT_AT = realTime(T.run + CYCLE * 21 + MOVE + (CYCLE - MOVE) * 0.62);

export const ease = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
export const pop = (p: number) => (p <= 0 ? 0 : p >= 1 ? 1 : 1 + 2.4 * Math.pow(p - 1, 3) + 1.4 * Math.pow(p - 1, 2));
/** The same number every time for the same seeds: scatter without dice. */
export const noise = (...seeds: number[]) => {
  const x = Math.sin(seeds.reduce((sum, seed, i) => sum + seed * (12.9898 + i * 78.233), 0)) * 43758.5453;
  return x - Math.floor(x);
};

export function useLoopClock(exportAt = EXPORT_AT): number {
  const [t, setT] = useState(() => (EXPORT_MODE ? exportAt : 0));
  useLayoutEffect(() => {
    if (EXPORT_MODE) return;
    const start = performance.now();
    let id = requestAnimationFrame(function tick(now) {
      setT(now - start);
      id = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(id);
  }, []);
  return t;
}

// ── the site (the Goldberg canvas: 1700 wide, y from −110 to 750) ─────────────
export const VIEW = '0 -110 1700 860';
/** The main belt runs left to right; its middle is the line the cars ride. */
const MAIN = { x0: 96, x1: 1236, y: 486, w: 96 };
/** The cars and the people are drawn small and shown at this size: read from the room. */
export const K = 1.4;
const PITCH = 250;
/** Where a car stands on beat k: 0 the bare chassis, 1–3 the stations, 4 the end. */
const stop = (k: number) => 176 + PITCH * k;
const STATIONS = [1, 2, 3] as const;
/** A feeder comes down from its machine to the edge of the main belt. */
const FEED = { y0: -6, y1: 434, w: 76 };
const feedAt = (u: number) => lerp(FEED.y0 + 52, FEED.y1 - 46, u);
/** The centre of each part on the car, from the car's own middle (it faces right). */
const MOUNT: Record<number, P> = { 1: [0, 0], 2: [33, 0], 3: [-12, 0] };
const WORK_Y = 578;
const AISLE_Y = 676;
/** How far a thing's shadow falls: the sun is up and to the left. */
export const SHADE: P = [7, 9];

// ── the car park: a lane up the middle, bays nose-in on both sides ───────────
const LOT = { x: 1296, lane: 1498, left: 1394, right: 1602, row: 64, scale: 0.62 };
type Bay = { x: number; y: number; angle: number; path: P[] };
/** In the order they fill: the nearest first, so the park grows away from the gate. */
const BAYS: Bay[] = (() => {
  const bay = (j: number, side: 1 | -1): Bay => {
    const y = MAIN.y + LOT.row * j;
    const x = side > 0 ? LOT.right : LOT.left;
    // from where the car stands at the end of the belt (beat 4), so it rolls off without a jump
    const path: P[] = j === 0 ? [[stop(4), MAIN.y], [x, y]] : [[stop(4), MAIN.y], [LOT.lane, MAIN.y], [LOT.lane, y], [x, y]];
    return { x, y, angle: side > 0 ? 0 : 180, path };
  };
  const list: Bay[] = [bay(0, 1)];
  for (let d = 1; d <= 9; d++) {
    // the road comes in on the left at row 0, so that side starts a row out
    for (const j of d <= 3 ? [-d, d] : [-d]) list.push(bay(j, -1), bay(j, 1));
  }
  return list;
})();
/** With every bay taken, a car turns down the lane and drives off the picture. */
const EXIT: P[] = [[stop(4), MAIN.y], [LOT.lane, MAIN.y], [LOT.lane, 860]];
const DRIVE = 0.42; // px per ms
export const pathLength = (path: P[]) => path.slice(1).reduce((sum, p, i) => sum + Math.hypot(p[0] - path[i][0], p[1] - path[i][1]), 0);
/** A point `dist` along a path of straight runs, turning through each corner over `turn` px. */
export function follow(path: P[], dist: number, turn = 46): { p: P; angle: number } {
  const dirs = path.slice(1).map((p, i) => (Math.atan2(p[1] - path[i][1], p[0] - path[i][0]) * 180) / Math.PI);
  let left = Math.max(0, dist);
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (left <= len || i === path.length - 2) {
      const u = clamp01(left / len);
      let angle = dirs[i];
      // near a corner the nose swings from this run's heading to the next one's
      const next = dirs[i + 1];
      const prev = dirs[i - 1];
      const spin = (from: number, to: number, p: number) => from + ((((to - from) % 360) + 540) % 360 - 180) * p;
      if (next !== undefined && len - left < turn / 2) angle = spin(dirs[i], next, 0.5 * (1 - (len - left) / (turn / 2)));
      else if (prev !== undefined && left < turn / 2) angle = spin(prev, dirs[i], 0.5 + 0.5 * (left / (turn / 2)));
      return { p: [lerp(a[0], b[0], u), lerp(a[1], b[1], u)], angle };
    }
    left -= len;
  }
  return { p: path[path.length - 1], angle: dirs[dirs.length - 1] };
}

// ── act 1: who walks where, and what appears behind them ─────────────────────
export type Key = { at: number; p: P };
/** A walk as a list of moments: where the figure is at each, straight lines between. */
export function along(keys: Key[], t: number): { p: P; angle: number; moving: boolean; walked: number } {
  let walked = 0;
  let angle = 0;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    const len = Math.hypot(b.p[0] - a.p[0], b.p[1] - a.p[1]);
    if (len > 0) angle = (Math.atan2(b.p[1] - a.p[1], b.p[0] - a.p[0]) * 180) / Math.PI;
    if (t < b.at) {
      const u = clamp01((t - a.at) / (b.at - a.at));
      return { p: [lerp(a.p[0], b.p[0], u), lerp(a.p[1], b.p[1], u)], angle, moving: len > 0 && t > a.at, walked: walked + len * u };
    }
    walked += len;
  }
  return { p: keys[keys.length - 1].p, angle, moving: false, walked };
}

const TABLE: P = [176, 10];
/** The one who lays the main line: out of the office, along the whole site, and back. */
const LAYER: Key[] = [
  { at: 0, p: [230, 92] },
  { at: 900, p: [230, 92] },
  { at: 1500, p: [MAIN.x0 + 10, 584] },
  { at: 3700, p: [MAIN.x1 - 10, 584] },
  { at: 4000, p: [MAIN.x1 - 10, 640] },
  { at: 6200, p: [230, 640] },
  { at: 6900, p: [230, 92] },
];
/** The one who lays the feeders: stops beside each while it is planned. */
const FEEDER_AT = [2100, 3100, 4100];
const RIGGER: Key[] = [
  { at: 0, p: [286, 10] },
  { at: 1300, p: [286, 10] },
  { at: 1600, p: [330, 232] },
  { at: FEEDER_AT[0], p: [stop(1) + 96, 232] },
  { at: FEEDER_AT[0] + 500, p: [stop(1) + 96, 232] },
  { at: FEEDER_AT[1], p: [stop(2) + 96, 232] },
  { at: FEEDER_AT[1] + 500, p: [stop(2) + 96, 232] },
  { at: FEEDER_AT[2], p: [stop(3) + 96, 232] },
  { at: FEEDER_AT[2] + 500, p: [stop(3) + 96, 232] },
  { at: 6100, p: [330, 232] },
  { at: 6600, p: [286, 10] },
];
/** The line follows the layer as a blueprint, and turns real a little behind. */
const planTo = (t: number) => (t >= 1500 ? clamp01((along(LAYER, t).p[0] - MAIN.x0) / (MAIN.x1 - MAIN.x0)) : 0);
const builtTo = (t: number) => ease(seg(t, 3000, 1900));
const feedPlan = (i: number, t: number) => seg(t, FEEDER_AT[i], 500);
const feedBuilt = (i: number, t: number) => ease(seg(t, FEEDER_AT[i] + 900, 500));

/** Where the mender stands at machine k, and the way there from the table and back. */
const REPAIR_SPEED = 0.42; // px per ms
const repairWalk = (k: number): Key[] => {
  const home = RIGGER[0].p;
  const spot: P = [stop(k) - 104, -38];
  const way: P[] = [home, [home[0] + 14, 66], [spot[0], 66], spot];
  const keys: Key[] = [{ at: 0, p: home }];
  let at = BREAK.leave;
  way.forEach((p, i) => {
    if (i > 0) at += Math.hypot(p[0] - way[i - 1][0], p[1] - way[i - 1][1]) / REPAIR_SPEED;
    keys.push({ at, p });
  });
  at = Math.max(at, BREAK.mended);
  keys.push({ at, p: spot });
  [...way].reverse().forEach((p, i, back) => {
    if (i > 0) at += Math.hypot(p[0] - back[i - 1][0], p[1] - back[i - 1][1]) / REPAIR_SPEED;
    keys.push({ at, p });
  });
  return keys;
};

/** Six workers, two at each station; the farthest walks in first, so nobody overtakes. */
const WORKERS = STATIONS.flatMap((k) => [
  { station: k, x: stop(k) - 58 },
  { station: k, x: stop(k) + 58 },
])
  .sort((a, b) => b.x - a.x)
  .map((worker, i) => ({ ...worker, from: T.hire + i * 380 }));
const WALK = 0.3; // px per ms

// ── the people, from above: a shadow, feet, two arms, shoulders, a hat ────────
export function Person({
  p,
  angle,
  kind,
  stride = 0,
  reach = 0,
  swing = 0,
  point = 0,
  o = 1,
  k = K,
}: {
  p: P;
  /** degrees; 0 looks right, −90 looks up the picture */
  angle: number;
  kind: 'worker' | 'engineer';
  stride?: number;
  reach?: number;
  swing?: number;
  point?: number;
  o?: number;
  /** how big the figure is drawn; the engineers' own factory has more of them and draws them smaller */
  k?: number;
}) {
  const left: P = [lerp(9 - stride * 7, 36, Math.max(reach, point)), lerp(-21, -6 + 7 * swing, reach) - 12 * point];
  const right: P = [lerp(9 + stride * 7, 34, reach), lerp(21, 7 - 7 * swing, reach)];
  return (
    <g opacity={o}>
      <ellipse className="ww-tf__shadow" cx={(p[0] + SHADE[0]).toFixed(1)} cy={(p[1] + SHADE[1]).toFixed(1)} rx={22 * k * 0.8} ry={22 * k * 0.8} />
      <g transform={`translate(${p[0].toFixed(1)} ${p[1].toFixed(1)}) rotate(${angle.toFixed(1)}) scale(${k})`}>
        <ellipse className="ww-tf__foot" cx={(stride * 11).toFixed(1)} cy="-9" rx="9" ry="5.5" />
        <ellipse className="ww-tf__foot" cx={(-stride * 11).toFixed(1)} cy="9" rx="9" ry="5.5" />
        <line className={`ww-tf__arm ww-tf__arm--${kind}`} x1="2" y1="-19" x2={left[0].toFixed(1)} y2={left[1].toFixed(1)} />
        <line className={`ww-tf__arm ww-tf__arm--${kind}`} x1="2" y1="19" x2={right[0].toFixed(1)} y2={right[1].toFixed(1)} />
        {reach > 0.05 && (
          <line className="ww-tf__tool" x1={right[0].toFixed(1)} y1={right[1].toFixed(1)} x2={(right[0] + 16).toFixed(1)} y2={(right[1] - 4 * swing).toFixed(1)} />
        )}
        <ellipse className={kind === 'worker' ? 'ww-tf__overall' : 'ww-tf__coat'} rx="13" ry="24" />
        {kind === 'worker' ? (
          <>
            <path className="ww-tf__cap" d="M7 -10 A16 16 0 0 1 7 10 Z" />
            <circle className="ww-tf__cap" cx="1" r="12" />
            <circle className="ww-tf__capdot" cx="1" r="3" />
          </>
        ) : (
          <>
            <circle className="ww-tf__hat" cx="2" r="13.5" />
            <path className="ww-tf__ridge" d="M-9 0 H13" />
          </>
        )}
      </g>
    </g>
  );
}

// ── the car from above, and its parts ───────────────────────────────────────
export const Wheels = () => (
  <>
    {[-30, 30].flatMap((wx) => [-27, 27].map((wy) => <rect key={`${wx}${wy}`} className="ww-tf__tyre" x={wx - 11} y={wy - 5} width="22" height="10" rx="4" />))}
  </>
);
export const Engine = () => (
  <>
    <rect className="ww-tf__metal" x="-15" y="-17" width="30" height="34" rx="7" />
    <path className="ww-tf__gloss" d="M-8 -11 H6 M-8 11 H6" />
    <circle className="ww-tf__lamp" cx="10" cy="-10" r="3.5" />
    <circle className="ww-tf__lamp" cx="10" cy="10" r="3.5" />
  </>
);
const Body = () => (
  <>
    <rect className="ww-tf__metal" x="-34" y="-22" width="68" height="44" rx="11" />
    <rect className="ww-tf__window" x="16" y="-16" width="10" height="32" rx="4" />
    <rect className="ww-tf__window" x="-28" y="-13" width="7" height="26" rx="3" />
    <rect className="ww-tf__gloss ww-tf__gloss--roof" x="-14" y="-15" width="24" height="30" rx="6" />
  </>
);
const PART = { 1: Wheels, 2: Engine, 3: Body } as const;
/** Where part k still is, from its place on the car, and how big: undefined — not there yet. */
type Fit = { dx: number; dy: number; s: number };
const ON: Fit = { dx: 0, dy: 0, s: 1 };
const WHOLE: Record<number, Fit> = { 1: ON, 2: ON, 3: ON };

function Car({ x, y, s = 1, o = 1, angle = 0, parts }: { x: number; y: number; s?: number; o?: number; angle?: number; parts: Record<number, Fit | undefined> }) {
  const part = (k: 1 | 2 | 3) => {
    const fit = parts[k];
    const Part = PART[k];
    return (
      fit && (
        <g transform={`translate(${(MOUNT[k][0] + fit.dx).toFixed(1)} ${(MOUNT[k][1] + fit.dy).toFixed(1)}) scale(${fit.s.toFixed(2)})`}>
          <Part />
        </g>
      )
    );
  };
  const whole = parts[3] === ON;
  return (
    <g opacity={o}>
      {whole && (
        <g transform={`translate(${(x + SHADE[0] * s).toFixed(1)} ${(y + SHADE[1] * s).toFixed(1)}) rotate(${angle.toFixed(1)}) scale(${(s * K).toFixed(3)})`}>
          <rect className="ww-tf__shadow" x="-48" y="-27" width="98" height="54" rx="12" />
        </g>
      )}
      <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle.toFixed(1)}) scale(${(s * K).toFixed(3)})`}>
        {part(1)}
        <path className="ww-tf__chassis" d="M-44 -12 H44 M-44 12 H44 M-30 -24 V24 M30 -24 V24" />
        {part(2)}
        {part(3)}
      </g>
    </g>
  );
}

export function gearPath(r: number, teeth: number): string {
  const ri = r * 0.76;
  const s = (2 * Math.PI) / teeth;
  const pt = (rad: number, a: number) => `${(rad * Math.cos(a)).toFixed(1)},${(rad * Math.sin(a)).toFixed(1)}`;
  const pts: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const a = i * s;
    pts.push(pt(ri, a), pt(r, a + s * 0.15), pt(r, a + s * 0.45), pt(ri, a + s * 0.6));
  }
  return `M${pts.join('L')}Z`;
}
export const GEAR = gearPath(24, 9);
export const SPARK = 'M0 -9 L2.4 -2.4 L9 0 L2.4 2.4 L0 9 L-2.4 2.4 L-9 0 L-2.4 -2.4 Z';

/** The ground: drawn once. Sand with grain and pebbles, a concrete apron, the car park. */
const Ground = memo(function Ground() {
  return (
    <svg className="ww-tf__layer" viewBox={VIEW} aria-hidden="true">
      <defs>
        <clipPath id="ww-tf-site">
          <rect x="0" y="-110" width="1700" height="860" rx="28" />
        </clipPath>
        {/* grain: fractal noise turned into patches of a darker sand */}
        <filter id="ww-tf-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="4" seed="11" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.5 -0.55" />
          <feComposite in="SourceGraphic" operator="in" />
        </filter>
        <filter id="ww-tf-speckle" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="4" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 2.2 -1.25" />
          <feComposite in="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <g clipPath="url(#ww-tf-site)">
        <rect className="ww-tf__sand" x="0" y="-110" width="1700" height="860" />
        <rect className="ww-tf__sand ww-tf__sand--dark" x="0" y="-110" width="1700" height="860" filter="url(#ww-tf-grain)" />
        <rect className="ww-tf__sand ww-tf__sand--speck" x="0" y="-110" width="1700" height="860" filter="url(#ww-tf-speckle)" />
        {Array.from({ length: 90 }, (_, i) => {
          const x = 1300 * noise(i, 1);
          const y = -110 + 860 * noise(i, 2);
          const r = 3 + 7 * noise(i, 3);
          return <ellipse key={i} className="ww-tf__pebble" cx={x.toFixed(1)} cy={y.toFixed(1)} rx={r.toFixed(1)} ry={(r * (0.55 + 0.4 * noise(i, 4))).toFixed(1)} transform={`rotate(${(180 * noise(i, 5)).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})`} />;
        })}

        {/* the apron the line stands on, and the aisle the workers come in by */}
        <rect className="ww-tf__shadow" x={60 + SHADE[0]} y={410 + SHADE[1]} width="1222" height="304" rx="20" />
        <rect className="ww-tf__concrete" x="60" y="410" width="1222" height="304" rx="20" />
        <rect className="ww-tf__concrete ww-tf__concrete--speck" x="60" y="410" width="1222" height="304" rx="20" filter="url(#ww-tf-speckle)" />
        <path className="ww-tf__joint" d={[200, 440, 690, 940, 1180].map((x) => `M${x} 410 V714`).join(' ')} />
        <path className="ww-tf__aisle" d={`M0 ${AISLE_Y - 34} H1180 M0 ${AISLE_Y + 34} H1180`} />

        {/* the office: a slab of its own */}
        <rect className="ww-tf__shadow" x={20 + SHADE[0]} y={-96 + SHADE[1]} width="330" height="226" rx="18" />
        <rect className="ww-tf__concrete" x="20" y="-96" width="330" height="226" rx="18" />

        {/* the car park: asphalt, a lane, painted bays */}
        <rect className="ww-tf__asphalt" x={LOT.x} y="-110" width={1700 - LOT.x} height="860" />
        <rect className="ww-tf__asphalt" x={MAIN.x1 - 4} y={MAIN.y - 44} width={LOT.x - MAIN.x1 + 8} height="88" />
        <rect className="ww-tf__asphalt ww-tf__asphalt--speck" x={LOT.x} y="-110" width={1700 - LOT.x} height="860" filter="url(#ww-tf-speckle)" />
        <path className="ww-tf__lane" d={`M${LOT.lane} -100 V${MAIN.y - 60} M${LOT.lane} ${MAIN.y + 60} V740`} />
        {BAYS.map((bay, i) => {
          const inner = bay.angle === 0 ? bay.x - 52 : bay.x + 52;
          const outer = bay.angle === 0 ? bay.x + 60 : bay.x - 60;
          return <path key={i} className="ww-tf__bay" d={`M${inner} ${bay.y - LOT.row / 2} H${outer} V${bay.y + LOT.row / 2} H${inner}`} />;
        })}
      </g>
    </svg>
  );
});

/** A length of belt, along x or down y: a shadow, the bed, rollers and chevrons that travel. */
export function Belt({
  x,
  y,
  len,
  w,
  down,
  turn = down ? 90 : 0,
  plan,
  built,
  off,
}: {
  x: number;
  y: number;
  len: number;
  w: number;
  down?: true;
  /** which way it runs, in degrees: 0 to the right, 90 down, 180 to the left */
  turn?: number;
  plan: number;
  built: number;
  off: number;
}) {
  const tile = 50;
  const done = len * built;
  // the shadow falls the same way on the picture whichever way the belt is turned
  const rad = (turn * Math.PI) / 180;
  const shade: P = [SHADE[0] * Math.cos(rad) + SHADE[1] * Math.sin(rad), -SHADE[0] * Math.sin(rad) + SHADE[1] * Math.cos(rad)];
  // everything is drawn along x from the origin, and a feeder is the same thing turned
  return (
    <g transform={`translate(${x} ${y}) rotate(${turn})`}>
      {Array.from({ length: Math.ceil(len / tile) }, (_, i) => {
        const there = clamp01((plan * len - i * tile) / tile);
        const gone = clamp01((done - i * tile) / tile);
        return there > 0 && gone < 1 ? (
          <rect key={i} className="ww-tf__plan" x={i * tile + 3} y={-w / 2 + 3} width={Math.min(tile, len - i * tile) - 6} height={w - 6} rx="8" opacity={there * (1 - gone)} />
        ) : null;
      })}
      {built > 0 && (
        <>
          <rect className="ww-tf__shadow" x={shade[0].toFixed(1)} y={(-w / 2 + shade[1]).toFixed(1)} width={done} height={w} rx="10" />
          <rect className="ww-tf__bed" x="0" y={-w / 2} width={done} height={w} rx="10" />
          {Array.from({ length: Math.ceil(len / 23) }, (_, i) => {
            const rx = 8 + ((i * 23 + off) % (len - 16));
            return rx < done - 8 ? <line key={i} className="ww-tf__slat" x1={rx.toFixed(1)} y1={-w / 2 + 9} x2={rx.toFixed(1)} y2={w / 2 - 9} /> : null;
          })}
          {Array.from({ length: Math.ceil(len / 92) }, (_, i) => {
            const cx = 24 + ((i * 92 + off) % (len - 48));
            return cx < done - 20 ? <path key={i} className="ww-tf__chevron" d={`M${(cx - 8).toFixed(1)} ${-w * 0.2} l${w * 0.18} ${w * 0.2} l${-w * 0.18} ${w * 0.2}`} /> : null;
          })}
          <path className="ww-tf__rail" d={`M6 ${-w / 2 + 5} H${Math.max(6, done - 6)} M6 ${w / 2 - 5} H${Math.max(6, done - 6)}`} />
        </>
      )}
    </g>
  );
}

function Floor() {
  const t = useLoopClock();
  useAnimating(!EXPORT_MODE && t < T.run + CYCLE);

  // ── acts 3–5: the line's own beat ──
  const stopped = breakdown(t);
  const down = stopped.n >= 0 && stopped.since < BREAK.stop;
  /** The machine that is down, 0 when none; and how much everybody is standing about. */
  const broken = down && stopped.since < BREAK.mended ? STATIONS[stopped.n % STATIONS.length] : 0;
  const idle = down ? ease(seg(stopped.since, 250, 500)) * (1 - ease(seg(stopped.since, BREAK.mended, BREAK.stop - BREAK.mended))) : 0;
  const lt = lineTime(t);
  const tr = lt - T.run;
  const cyc = tr < 0 ? -1 : Math.floor(tr / CYCLE);
  const ph = tr < 0 ? 0 : tr - cyc * CYCLE;
  const m = cyc < 0 ? 0 : ease(seg(ph, 0, MOVE));
  const w = cyc < 0 ? 0 : seg(ph, MOVE, CYCLE - MOVE);
  const beltOff = cyc < 0 ? 0 : PITCH * (cyc + m);
  const feedOff = cyc < 0 ? 0 : 160 * (cyc + m);
  const busy = (k: number) => cyc - k >= 0 && w > 0;
  const reach = (k: number) => (busy(k) ? seg(w, 0.08, 0.22) * (1 - seg(w, 0.9, 0.1)) : 0);
  const powered = t >= T.power;

  // the cars on the belt: car c is on beat k = cyc − c; from the end of the belt it drives itself
  const cars = [];
  for (let k = 0; k <= 4; k++) {
    const c = cyc - k;
    if (c < 0 || (k === 4 && w > 0)) continue;
    const parts: Record<number, Fit | undefined> = {};
    for (const s of STATIONS) {
      if (k > s) parts[s] = ON;
      else if (k === s && w > 0) {
        // off the end of the feeder and over onto the car
        const a = ease(seg(w, 0, 0.36));
        parts[s] = { dx: -MOUNT[s][0] * (1 - a), dy: ((feedAt(1) - MAIN.y) / K) * (1 - a), s: lerp(0.8, 1, a) };
      }
    }
    cars.push(
      k === 0 ? (
        <Car key={c} x={stop(0) - 70 * (1 - m)} y={MAIN.y} o={seg(ph, 0, MOVE * 0.6)} parts={parts} />
      ) : (
        <Car key={c} x={stop(k - 1) + PITCH * m} y={MAIN.y} parts={parts} />
      ),
    );
  }

  // the car park: car c left the belt at the start of its beat 4's work — for bay c while
  // there is one, and after that down the lane and off the picture. It drives on the real
  // clock: a car already on the road does not wait for the line.
  const leftAt = (c: number) => realTime(T.run + (c + 4) * CYCLE + MOVE);
  const newest = cyc - 4 - (w > 0 ? 0 : 1);
  const out = [];
  const exitLength = pathLength(EXIT);
  for (let c = 0; c <= newest; c++) {
    const bay = BAYS[c] as Bay | undefined;
    const dist = (t - leftAt(c)) * DRIVE;
    if (!bay && dist >= exitLength) continue;
    const at = !bay ? follow(EXIT, dist) : dist >= pathLength(bay.path) ? { p: [bay.x, bay.y] as P, angle: bay.angle } : follow(bay.path, dist);
    // it leaves the belt at the belt's size and is its road size a little way out of the gate
    const s = lerp(1, LOT.scale, ease(clamp01(dist / 150)));
    out.push(<Car key={c} x={at.p[0]} y={at.p[1]} angle={at.angle} s={s} parts={WHOLE} />);
  }

  // the parts on their way down the feeders: one arriving, one behind it
  const riding = STATIONS.flatMap((k) => {
    const Part = PART[k];
    const list = [];
    if (cyc - k >= 0 && w === 0) list.push({ key: `${k}-lead`, u: lerp(0.5, 1, m), s: 0.8 });
    if (cyc + 1 - k >= 0) list.push({ key: `${k}-next`, u: w === 0 ? lerp(0, 0.5, m) : 0.5, s: 0.8 * (w === 0 ? pop(seg(ph, 0, MOVE * 0.5)) : 1) });
    return list.map(({ key, u, s }) => (
      <g key={key} transform={`translate(${stop(k)} ${feedAt(u).toFixed(1)}) scale(${(s * K).toFixed(2)})`}>
        <Part />
      </g>
    ));
  });

  const layer = along(LAYER, t);
  // the rigger is the one who mends: out to the machine, and back to the table after the line restarts
  const mending = stopped.n >= 0 ? STATIONS[stopped.n % STATIONS.length] : 0;
  const repair = repairWalk(mending || 1);
  const fixFrom = repair[4].at;
  const fixing = mending > 0 && stopped.since >= fixFrom && stopped.since < BREAK.mended;
  const rigger = mending && stopped.since < repair[repair.length - 1].at ? along(repair, stopped.since) : along(RIGGER, t);

  return (
    <svg
      className="ww-tf__layer"
      viewBox={VIEW}
      role="img"
      aria-label="Seen from above: engineers lay out a conveyor line, workers walk in and take their places, parts come down three feeders, the workers assemble them, and identical cars drive off to fill a car park; now and then a machine breaks, the whole line stops and waits, and an engineer walks over to mend it"
    >
      <g clipPath="url(#ww-tf-site)">
        {/* the office: the plan table. No words anywhere on this picture (Yarik: «всі підписи позабирай») */}
        <g opacity={pop(seg(t, T.office, 500))}>
          <rect className="ww-tf__shadow" x={TABLE[0] - 72 + SHADE[0]} y={TABLE[1] - 44 + SHADE[1]} width="144" height="88" rx="10" />
          <g transform={`translate(${TABLE[0] - 72} ${TABLE[1] - 44})`}>
            <rect className="ww-tf__table" width="144" height="88" rx="10" />
            <path className="ww-tf__sheet" d="M16 62 H128 M40 62 V30 M72 62 V30 M104 62 V30 M16 18 H56" />
          </g>
        </g>

        {/* the feeders: a belt down to the main line, a machine at the top of each */}
        {STATIONS.map((k, i) => (
          <Belt key={k} x={stop(k)} y={FEED.y0} len={FEED.y1 - FEED.y0} w={FEED.w} down plan={feedPlan(i, t)} built={feedBuilt(i, t)} off={feedOff} />
        ))}
        {/* the main line, and where a car stops on it to be worked on */}
        <Belt x={MAIN.x0} y={MAIN.y} len={MAIN.x1 - MAIN.x0} w={MAIN.w} plan={planTo(t)} built={builtTo(t)} off={beltOff} />
        {STATIONS.map((k) =>
          stop(k) + 82 < MAIN.x0 + (MAIN.x1 - MAIN.x0) * builtTo(t) ? <rect key={k} className="ww-tf__pad" x={stop(k) - 82} y={MAIN.y - MAIN.w / 2 + 9} width="164" height={MAIN.w - 18} rx="8" /> : null,
        )}
        {riding}
        {cars}

        {STATIONS.map((k, i) => {
          const x = stop(k);
          const up = pop(seg(t, FEEDER_AT[i] + 1300, 500));
          const dead = broken === k;
          const lit = dead ? Math.floor(t / 260) % 2 === 0 : powered && !down && Math.floor(t / 420 + i) % 2 === 0;
          return (
            <g key={k}>
              <g transform={`translate(${x} -52) scale(${up.toFixed(3)})`}>
                <rect className="ww-tf__shadow" x={-62 + SHADE[0]} y={-50 + SHADE[1]} width="124" height="100" rx="14" />
                <rect className="ww-tf__case" x="-62" y="-50" width="124" height="100" rx="14" />
                <rect className="ww-tf__plate" x="-50" y="-38" width="100" height="76" rx="8" />
                {[-52, 52].flatMap((rx) => [-40, 40].map((ry) => <circle key={`${rx}${ry}`} className="ww-tf__rivet" cx={rx} cy={ry} r="3" />))}
                {dead && <rect className="ww-tf__alarm" x="-70" y="-58" width="140" height="116" rx="20" opacity={(0.35 + 0.65 * Math.abs(Math.sin(t / 260))).toFixed(2)} />}
                <g transform={`translate(-12 0) rotate(${(powered ? (lt - T.power) / 14 : 0).toFixed(1)})`}>
                  <path className="ww-tf__gear" d={GEAR} />
                  <circle className="ww-tf__rivet" r="5" />
                </g>
                <circle className="ww-tf__stack" cx="30" cy="-16" r="11" />
                <circle className={lit ? (dead ? 'ww-tf__light ww-tf__light--alarm' : 'ww-tf__light ww-tf__light--on') : 'ww-tf__light'} cx="30" cy="20" r="6" />
              </g>
              {powered &&
                [0, 1, 2, 3].map((j) => {
                  const age = ((t - T.power) / 2400 + j / 4 + i * 0.3) % 1;
                  return (
                    <circle
                      key={j}
                      className={dead ? 'ww-tf__smoke ww-tf__smoke--soot' : 'ww-tf__smoke'}
                      cx={(x + 30 + 60 * age + 10 * Math.sin(j * 2.1 + age * 5)).toFixed(1)}
                      cy={(-68 - 46 * age).toFixed(1)}
                      r={(8 + 20 * age).toFixed(1)}
                      opacity={((1 - age) * (dead ? 1 : 1 - idle)).toFixed(2)}
                    />
                  );
                })}
            </g>
          );
        })}

        {/* the engineers: two of them (Yarik, 17.11.2026); both walk the site and come back to the table */}
        {t >= T.office && (
          <>
            <Person
              kind="engineer"
              p={layer.p}
              angle={layer.moving ? layer.angle : -90}
              stride={layer.moving ? Math.sin((layer.walked / 34) * Math.PI) : 0}
              point={t >= 1500 && t < 3700 ? 1 : 0}
              o={pop(seg(t, T.office + 250, 400))}
            />
            <Person
              kind="engineer"
              p={rigger.p}
              angle={rigger.moving ? rigger.angle : fixing ? 0 : 180}
              stride={rigger.moving ? Math.sin((rigger.walked / 34) * Math.PI) : 0}
              point={FEEDER_AT.some((at) => t >= at && t < at + 500) ? 1 : 0}
              reach={fixing ? seg(stopped.since, fixFrom, 300) : 0}
              swing={Math.sin(t / 70)}
              o={pop(seg(t, T.office + 400, 400))}
            />
          </>
        )}

        {/* the workers: in along the aisle, then up to the line */}
        {WORKERS.map((worker, i) => {
          if (t < worker.from) return null;
          const walk = along(
            [
              { at: worker.from, p: [-50, AISLE_Y] },
              { at: worker.from + (worker.x + 50) / WALK, p: [worker.x, AISLE_Y] },
              { at: worker.from + (worker.x + 50 + AISLE_Y - WORK_Y) / WALK, p: [worker.x, WORK_Y] },
            ],
            t,
          );
          return (
            <Person
              key={i}
              kind="worker"
              p={walk.p}
              angle={walk.moving ? walk.angle : -90 + ((Math.atan2(-52 - WORK_Y, stop(mending || 1) - worker.x) * 180) / Math.PI + 90) * idle}
              stride={walk.moving ? Math.sin((walk.walked / 34) * Math.PI) : 0}
              reach={reach(worker.station)}
              swing={Math.sin(w * Math.PI * 8 + i)}
            />
          );
        })}

        {/* where a wrench meets a part */}
        {STATIONS.map((k) =>
          busy(k) && w > 0.36 && w < 0.92
            ? [0, 1, 2, 3].map((j) => {
                const tick = Math.floor(w * 14);
                if (noise(cyc, k, j, tick) < 0.45) return null;
                return (
                  <path
                    key={`${k}-${j}`}
                    className="ww-tf__spark"
                    d={SPARK}
                    transform={`translate(${(stop(k) - 78 + 156 * noise(k, j, tick)).toFixed(1)} ${(MAIN.y + 34 + 26 * noise(j, tick, k)).toFixed(1)}) scale(${(0.7 + 1 * noise(tick, j, cyc)).toFixed(2)})`}
                  />
                );
              })
            : null,
        )}

        {/* and where the mender's meets the machine */}
        {fixing &&
          [0, 1, 2].map((j) => {
            const tick = Math.floor(t / 90);
            if (noise(stopped.n, j, tick) < 0.4) return null;
            return (
              <path
                key={j}
                className="ww-tf__spark"
                d={SPARK}
                transform={`translate(${(stop(mending) - 62 + 26 * noise(j, tick)).toFixed(1)} ${(-64 + 52 * noise(tick, j, 3)).toFixed(1)}) scale(${(0.7 + noise(tick, j, 7)).toFixed(2)})`}
              />
            );
          })}

        {/* the cars that have left the line: on the road, in their bays, or on their way out */}
        {out}
      </g>
    </svg>
  );
}

export const FactoryFloorSlide: SlideDefinition = {
  id: 'factory-floor',
  content: () => (
    <div className="ww-gb ww-tf">
      <Ground />
      <Floor />
    </div>
  ),
  notes:
    'No clicks — it plays by itself, talk over it; about ten seconds until the line runs, then it '
    + 'keeps going. This is the factory in that photograph, from above. First, very smart engineers '
    + 'build it: they leave the plan table, walk the site, and where they walk the line appears — '
    + 'first as a blueprint, then for real. Then ordinary people come to work on it — identical, two '
    + 'at each station. Parts start to travel: a chassis on the main belt; wheels, engines, bodies '
    + 'down the feeders. The belt moves one station and stops, the part comes over, the wrenches '
    + 'swing — and off the end drive cars, one after another, into the car park, and when it is full, '
    + 'off the slide. Many. All the same. About half a minute in, and then again every half minute, '
    + 'one machine breaks: every belt stops, everybody on the line turns and waits, and one of the '
    + 'engineers walks over and mends it. Nobody on the line can. '
    + 'That is the picture: the intelligence is in the people who designed the line, and on the line '
    + 'nobody needs any.',
};
