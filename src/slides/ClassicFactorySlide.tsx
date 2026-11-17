import { useLayoutEffect, useState } from 'react';
import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';
import { EXPORT_MODE, clamp01, lerp, seg } from '../components/ctxScene';
import { useAnimating } from '../components/frameSettled';

/**
 * The factory everyone imagines, as a machine that plays by itself — the picture
 * the Ford photograph before it stands for, drawn in the manner of the Goldberg
 * slide (Yarik, 17.11.2026: «анімація в стилі слайду 80 … витрать багато сил щоб
 * зробити офігенну процедурну анімацію»). Five acts on one clock, his script:
 *
 *   1. very smart engineers build a factory with conveyor lines — up on a gallery
 *      they draw the plan on a board, and the building, the belt and the feeders
 *      draw themselves after it;
 *   2. ordinary people come to work on the line — six identical workers walk in
 *      through the door and take their places, two at each station;
 *   3. parts start to travel along the lines — a chassis on the main belt, and
 *      wheels, engines and bodies down the three feeders;
 *   4. the workers put them together — the belt moves a station and stops, the
 *      part comes down, the wrenches swing;
 *   5. and many identical cars come out — each one flies to the next place in the
 *      yard, the counter climbs, a full yard is shipped and it starts again.
 *
 * Then it simply keeps running, cycle after cycle, for as long as the slide is up
 * (an endless loop is ambient for the ready mark; the build is not, so that part
 * is declared with `useAnimating`). The PDF gets one fixed moment of a late cycle.
 * Everything is derived from the clock — no state, no dice — so any moment can be
 * drawn on its own. Plain SVG on the Goldberg canvas (`.ww-gb`), styles `.ww-ff…`;
 * the cars are black, of course.
 */

type P = [number, number];

// ── the clock ───────────────────────────────────────────────────────────────
/** When each act begins, ms after the slide appears. */
const T = {
  board: 200,
  plan: 700,
  bulb: 2700,
  shell: 2900,
  belt: 3500,
  feeders: 4900,
  yard: 5500,
  power: 6100,
  hire: 6700,
  run: 10700,
};
/** One beat of the line: the belt moves a station, then everybody works. */
const MOVE = 800;
const CYCLE = 2200;
/** The PDF's still: a late cycle, the wrenches in mid-swing. */
const EXPORT_AT = T.run + CYCLE * 16 + MOVE + (CYCLE - MOVE) * 0.62;

const ease = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
/** A small overshoot, for things that pop into place. */
const pop = (p: number) => (p <= 0 ? 0 : p >= 1 ? 1 : 1 + 2.4 * Math.pow(p - 1, 3) + 1.4 * Math.pow(p - 1, 2));
/** The same number every time for the same seeds: jitter without dice. */
const noise = (...seeds: number[]) => {
  const x = Math.sin(seeds.reduce((sum, seed, i) => sum + seed * (12.9898 + i * 78.233), 0)) * 43758.5453;
  return x - Math.floor(x);
};

/** ms since the slide appeared, for as long as it is up (the PDF gets one fixed moment). */
function useLoopClock(): number {
  const [t, setT] = useState(() => (EXPORT_MODE ? EXPORT_AT : 0));
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

// ── geometry (the Goldberg canvas: 1700 wide, y from −110 to 750) ────────────
const FLOOR = 742;
const BELT_Y = 640;
const BELT = { x0: 90, x1: 1250, h: 24 };
const PITCH = 255;
/** Where a car stands on beat k: 0 the bare chassis, 1–3 the stations, 4 the end. */
const stop = (k: number) => 165 + PITCH * k;
const STATIONS = [1, 2, 3] as const;
const WALL = { left: 20, right: 1290 };
const GALLERY_Y = 250;
const BOARD = { x: 50, y: 70, w: 240, h: 150 };
/** A feeder runs down from its hopper to just above the car at its station. */
const feederTop = (k: number): P => [stop(k) + 178, 330];
const feederEnd = (k: number): P => [stop(k) + 58, 502];
/** A part rides ON the feeder: lifted off its line. */
const onFeeder = (k: number, u: number): P => {
  const [hx, hy] = feederTop(k);
  const [fx, fy] = feederEnd(k);
  return [lerp(hx, fx, u), lerp(hy, fy, u) - 22];
};
/** The centre of each part, from the car's own origin (its middle, on the belt). */
const MOUNT: Record<number, P> = { 1: [0, -18], 2: [37, -44], 3: [-22, -58] };

const YARD = { x: 1330, cols: 4, rows: 7, scale: 0.56 };
const YARD_SIZE = YARD.cols * YARD.rows;
const yardSlot = (n: number): P => [1385 + (n % YARD.cols) * 86, 112 + Math.floor(n / YARD.cols) * 98];

// ── the people ──────────────────────────────────────────────────────────────
/** Six workers, two at each station; the farthest walks in first, so nobody overtakes. */
const WORKERS = STATIONS.flatMap((k) => [
  { station: k, x: stop(k) - 92, face: 1 },
  { station: k, x: stop(k) + 92, face: -1 },
])
  .sort((a, b) => b.x - a.x)
  .map((worker, i) => ({ ...worker, from: T.hire + i * 380 }));
const DOOR_X = -70;
const WALK = 0.3; // px per ms

/** A figure seen from the side: legs, a body, a head, one arm. `hand` is where the arm ends. */
function Person({
  x,
  y = FLOOR,
  face,
  stride = 0,
  bob = 0,
  hand,
  kind,
  tool,
  o = 1,
}: {
  x: number;
  y?: number;
  face: number;
  stride?: number;
  bob?: number;
  hand: P;
  kind: 'worker' | 'engineer';
  tool?: number;
  o?: number;
}) {
  const shoulder: P = [face * 6, -132];
  return (
    <g transform={`translate(${x.toFixed(1)} ${(y - bob).toFixed(1)})`} opacity={o}>
      <line className="ww-ff__limb" x1="0" y1="-72" x2={(-stride * 15).toFixed(1)} y2={bob.toFixed(1)} />
      <line className="ww-ff__limb" x1="0" y1="-72" x2={(stride * 15).toFixed(1)} y2={bob.toFixed(1)} />
      <rect className={kind === 'worker' ? 'ww-ff__overall' : 'ww-ff__coat'} x="-20" y="-142" width="40" height="76" rx="12" />
      {kind === 'engineer' && <line className="ww-ff__tie" x1={face * 6} y1="-136" x2={face * 6} y2="-104" />}
      <circle className="ww-ff__head" cx="0" cy="-162" r="17" />
      {kind === 'worker' ? (
        // a flat cap, the same on every one of them
        <path className="ww-ff__cap" d={`M-18 -168 A18 16 0 0 1 18 -168 Z M${face * 12} -170 h${face * 16} v4 h${-face * 16} Z`} />
      ) : (
        <>
          <path className="ww-ff__hat" d="M-20 -170 A20 19 0 0 1 20 -170 Z M-24 -170 h48 v5 h-48 Z" />
          <circle className="ww-ff__glass" cx={face * 5} cy="-160" r="5" />
          <circle className="ww-ff__glass" cx={face * 15} cy="-160" r="5" />
        </>
      )}
      <line className="ww-ff__limb ww-ff__limb--arm" x1={shoulder[0]} y1={shoulder[1]} x2={hand[0].toFixed(1)} y2={hand[1].toFixed(1)} />
      {tool !== undefined && (
        <g transform={`translate(${hand[0].toFixed(1)} ${hand[1].toFixed(1)}) rotate(${(face > 0 ? tool : 180 - tool).toFixed(1)})`}>
          <line className="ww-ff__tool" x1="0" y1="0" x2="26" y2="0" />
          <path className="ww-ff__tool" d="M26 -7 a8 8 0 1 0 0 14" />
        </g>
      )}
    </g>
  );
}

// ── the car, and its parts ──────────────────────────────────────────────────
const Wheels = () => (
  <>
    {[-36, 36].map((wx) => (
      <g key={wx}>
        <circle className="ww-ff__wheel" cx={wx} cy="0" r="16" />
        <circle className="ww-ff__hub" cx={wx} cy="0" r="4" />
      </g>
    ))}
  </>
);
const Engine = () => (
  <>
    <rect className="ww-ff__metal" x="-22" y="-15" width="44" height="30" rx="5" />
    <path className="ww-ff__grille" d="M12 -9 v18 M5 -9 v18 M-2 -9 v18" />
  </>
);
const Body = () => (
  <>
    <path className="ww-ff__metal" d="M-34 28 V-10 A16 16 0 0 1 -18 -26 H18 A16 16 0 0 1 34 -10 V28 Z" />
    <rect className="ww-ff__window" x="-24" y="-16" width="20" height="20" rx="4" />
    <rect className="ww-ff__window" x="4" y="-16" width="20" height="20" rx="4" />
  </>
);
const PART = { 1: Wheels, 2: Engine, 3: Body } as const;

/** `parts[k]` is how far part k still is from its place: undefined — not there yet, [0, 0] — on. */
function Car({ x, y, s = 1, o = 1, parts }: { x: number; y: number; s?: number; o?: number; parts: Record<number, P | undefined> }) {
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(3)})`} opacity={o}>
      {/* the body goes on first in the drawing, so the wheels and the frame stand over it */}
      {[3, 2].map((k) => {
        const off = parts[k];
        const Part = PART[k as 2 | 3];
        return (
          off && (
            <g key={k} transform={`translate(${(MOUNT[k][0] + off[0]).toFixed(1)} ${(MOUNT[k][1] + off[1]).toFixed(1)})`}>
              <Part />
            </g>
          )
        );
      })}
      <line className="ww-ff__chassis" x1="-58" y1="-26" x2="58" y2="-26" />
      {parts[1] && (
        <g transform={`translate(${(MOUNT[1][0] + parts[1][0]).toFixed(1)} ${(MOUNT[1][1] + parts[1][1]).toFixed(1)})`}>
          <Wheels />
        </g>
      )}
    </g>
  );
}
const WHOLE: Record<number, P> = { 1: [0, 0], 2: [0, 0], 3: [0, 0] };

function gearPath(r: number, teeth: number): string {
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
const GEAR_BIG = gearPath(34, 10);
const GEAR_SMALL = gearPath(22, 7);
const SPARK = 'M0 -9 L2.4 -2.4 L9 0 L2.4 2.4 L0 9 L-2.4 2.4 L-9 0 L-2.4 -2.4 Z';

/** A line that draws itself: `p` from 0 to 1. */
const drawn = (p: number) => ({ pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - clamp01(p) });

function Factory() {
  const t = useLoopClock();
  useAnimating(!EXPORT_MODE && t < T.run + CYCLE);

  // ── act 1: the plan, then the building after it ──
  const pBoard = pop(seg(t, T.board, 500));
  const pPlan = seg(t, T.plan, 2000);
  const bulb = t >= T.bulb && t < T.bulb + 1500 ? 1 - Math.abs(seg(t, T.bulb, 1500) * 2 - 1) : 0;
  const pShell = seg(t, T.shell, 1000);
  const pBelt = seg(t, T.belt, 1600);
  const pFeed = seg(t, T.feeders, 1100);
  const pYard = seg(t, T.yard, 600);
  const powered = t >= T.power;

  // ── acts 3–5: the line's own beat ──
  const tr = t - T.run;
  const cyc = tr < 0 ? -1 : Math.floor(tr / CYCLE);
  const ph = tr < 0 ? 0 : tr - cyc * CYCLE;
  const m = cyc < 0 ? 0 : ease(seg(ph, 0, MOVE));
  const w = cyc < 0 ? 0 : seg(ph, MOVE, CYCLE - MOVE);
  const beltOff = cyc < 0 ? 0 : PITCH * (cyc + m);
  /** Is there a car at station k on this beat, being worked on? */
  const busy = (k: number) => cyc - k >= 0 && w > 0;
  const reach = (k: number) => (busy(k) ? seg(w, 0.08, 0.22) * (1 - seg(w, 0.9, 0.1)) : 0);

  // the cars on the belt: car c is on beat k = cyc − c
  const cars = [];
  for (let k = 0; k <= 4; k++) {
    const c = cyc - k;
    if (c < 0) continue;
    const parts: Record<number, P | undefined> = {};
    for (const s of STATIONS) {
      if (k > s) parts[s] = [0, 0];
      else if (k === s && w > 0) {
        // off the feeder's end and down onto the car
        const a = ease(seg(w, 0, 0.36));
        const [fx, fy] = onFeeder(s, 1);
        parts[s] = [(fx - stop(s) - MOUNT[s][0]) * (1 - a), (fy - BELT_Y - MOUNT[s][1]) * (1 - a)];
      }
    }
    if (k === 0) {
      cars.push(<Car key={c} x={stop(0) - 70 * (1 - m)} y={BELT_Y} o={seg(ph, 0, MOVE * 0.6)} parts={parts} />);
    } else if (k < 4 || w === 0) {
      cars.push(<Car key={c} x={stop(k - 1) + PITCH * m} y={BELT_Y} parts={parts} />);
    } else {
      // finished: off the end of the belt and into its place in the yard
      const a = ease(seg(w, 0.04, 0.8));
      const [sx, sy] = yardSlot(c % YARD_SIZE);
      cars.push(
        <Car key={c} x={lerp(stop(4), sx, a)} y={lerp(BELT_Y, sy, a) - 70 * Math.sin(a * Math.PI)} s={lerp(1, YARD.scale, a)} parts={WHOLE} />,
      );
    }
  }
  // the yard: every car that has landed, of the batch now being filled; a full batch is shipped
  const landed = cyc - 4 + (w >= 0.84 ? 1 : 0);
  const batch = Math.floor(Math.max(0, cyc - 4) / YARD_SIZE);
  const parked = [];
  for (let c = batch * YARD_SIZE; c < landed; c++) {
    const [sx, sy] = yardSlot(c % YARD_SIZE);
    parked.push(<Car key={c} x={sx} y={sy} s={YARD.scale} parts={WHOLE} />);
  }
  const shipping = cyc - 4 > 0 && (cyc - 4) % YARD_SIZE === 0 && w < 0.84;
  if (shipping) {
    const out = ease(seg(ph, 0, MOVE + 300));
    for (let n = 0; n < YARD_SIZE; n++) {
      const [sx, sy] = yardSlot(n);
      parked.push(<Car key={`gone-${n}`} x={sx + 150 * out} y={sy} s={YARD.scale} o={1 - out} parts={WHOLE} />);
    }
  }

  // the parts on their way down the feeders: one arriving, one behind it
  const riding = STATIONS.flatMap((k) => {
    const Part = PART[k];
    const list = [];
    const lead = cyc - k >= 0 && w === 0; // for the car pulling in now
    const next = cyc + 1 - k >= 0; // for the one after it
    if (lead) list.push({ key: `${k}-lead`, u: lerp(0.5, 1, m), s: 1 });
    if (next) list.push({ key: `${k}-next`, u: w === 0 ? lerp(0, 0.5, m) : 0.5, s: w === 0 ? pop(seg(ph, 0, MOVE * 0.5)) : 1 });
    return list.map(({ key, u, s }) => {
      const [px, py] = onFeeder(k, u);
      return (
        <g key={key} transform={`translate(${px.toFixed(1)} ${py.toFixed(1)}) scale(${s.toFixed(2)})`}>
          <Part />
        </g>
      );
    });
  });

  return (
    <svg
      className="ww-gb__svg"
      viewBox="0 -110 1700 860"
      role="img"
      aria-label="Engineers draw a factory, workers walk in to its conveyor line, parts come down the feeders, the workers assemble them, and identical cars fill a yard"
    >
      {/* the yard the cars end up in */}
      <g opacity={pYard}>
        <rect className="ww-gb__frame" x={YARD.x} y="-110" width="370" height="860" rx="24" />
        <text className="ww-gb__label" x={YARD.x + 28} y="-58">cars</text>
        <text className="ww-ff__count" x="1672" y="-58" textAnchor="end">{`× ${Math.max(0, landed)}`}</text>
      </g>

      {/* the building: a sawtooth roof, two walls with a door in each, a chimney */}
      <g className="ww-ff__line">
        <path d="M20 0 L220 -80 L274 0 L474 -80 L528 0 L728 -80 L782 0 L982 -80 L1036 0 L1236 -80 L1290 0" {...drawn(pShell)} />
        <path d={`M${WALL.left} 0 V540 M${WALL.left} ${FLOOR} H${WALL.right} M${WALL.right} 0 V500 M${WALL.right} 690 V${FLOOR}`} {...drawn(pShell)} />
        <path d="M1150 -30 V-96 H1186 V-44" {...drawn(pShell)} />
      </g>
      {powered &&
        [0, 1, 2, 3, 4].map((j) => {
          const age = ((t - T.power) / 2600 + j / 5) % 1;
          return (
            <circle
              key={j}
              className="ww-ff__smoke"
              cx={(1168 + 34 * age + 14 * Math.sin(j * 2.1 + age * 5)).toFixed(1)}
              cy={(-104 - 96 * age).toFixed(1)}
              r={(9 + 17 * age).toFixed(1)}
              opacity={((1 - age) * 0.9).toFixed(2)}
            />
          );
        })}

      {/* the gallery: a plan on a board, and the people who drew it */}
      <g className="ww-ff__line ww-ff__line--thin" opacity={seg(t, T.board, 400)}>
        <path d={`M${WALL.left} ${GALLERY_Y} H540 M540 ${GALLERY_Y} V${GALLERY_Y - 44} M${WALL.left} ${GALLERY_Y - 44} H540 M200 ${GALLERY_Y} V${GALLERY_Y - 44} M370 ${GALLERY_Y} V${GALLERY_Y - 44} M${WALL.left} ${GALLERY_Y + 70} L90 ${GALLERY_Y}`} />
      </g>
      <g transform={`translate(${BOARD.x + BOARD.w / 2} ${BOARD.y + BOARD.h / 2}) scale(${pBoard.toFixed(3)}) translate(${-BOARD.w / 2} ${-BOARD.h / 2})`}>
        <rect className="ww-ff__board" width={BOARD.w} height={BOARD.h} rx="10" />
        <g className="ww-ff__plan">
          <path d="M22 112 H218" {...drawn(seg(pPlan, 0, 0.3))} />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${106 + i * 44} 46 L${82 + i * 44} 96`} {...drawn(seg(pPlan, 0.3 + i * 0.12, 0.2))} />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={40 + i * 44} cy="104" r="7" {...drawn(seg(pPlan, 0.62 + i * 0.07, 0.16))} />
          ))}
          <path d="M22 30 H76 M22 44 H58" {...drawn(seg(pPlan, 0.86, 0.14))} />
        </g>
      </g>
      <text className="ww-gb__row" x={BOARD.x} y={BOARD.y - 22} opacity={seg(t, T.board, 400)}>engineers</text>
      {[350, 420, 490].map((ex, i) => {
        const here = pop(seg(t, T.board + 150 + i * 160, 450));
        // while the plan is drawn the first one points at it; once the line runs they just watch
        const pointing = i === 0 ? seg(t, T.plan, 300) * (1 - seg(t, T.bulb + 300, 500)) : 0;
        const face = t < T.shell ? -1 : 1;
        const nod = 2.5 * Math.sin(t / 520 + i * 1.7);
        return (
          <Person
            key={ex}
            kind="engineer"
            x={ex}
            y={GALLERY_Y - 6}
            face={face}
            bob={nod * (i === 0 ? 0.4 : 1)}
            o={here}
            hand={[lerp(face * 13, -62, pointing), lerp(-86, -178, pointing)]}
          />
        );
      })}
      {bulb > 0 && (
        <g transform={`translate(420 ${(GALLERY_Y - 218).toFixed(1)}) scale(${(0.6 + 0.5 * bulb).toFixed(2)})`} opacity={Math.min(1, bulb * 2).toFixed(2)}>
          <circle className="ww-ff__bulb" r="15" />
          <path className="ww-ff__line ww-ff__line--thin" d="M-7 15 h14 M0 -24 v-9 M22 -16 l7 -6 M-22 -16 l-7 -6" />
        </g>
      )}

      {/* the feeders: a hopper under the roof, a belt down to the station */}
      {STATIONS.map((k, i) => {
        const [hx, hy] = feederTop(k);
        const [fx, fy] = feederEnd(k);
        const p = seg(pFeed, i * 0.18, 0.64);
        return (
          <g key={k}>
            <path className="ww-ff__line ww-ff__line--thin" d={`M${hx} 0 V${hy - 74}`} {...drawn(p)} />
            <path className="ww-ff__hopper" d={`M${hx - 36} ${hy - 74} H${hx + 36} L${hx + 14} ${hy - 22} H${hx - 14} Z`} opacity={p} />
            <line className="ww-ff__feed" x1={hx} y1={hy} x2={fx} y2={fy} {...drawn(p)} />
            <line className="ww-ff__feed ww-ff__feed--in" x1={hx} y1={hy} x2={fx} y2={fy} {...drawn(p)} />
            {[0.14, 0.38, 0.62, 0.86].map((u) => (
              <circle key={u} className="ww-ff__roller" cx={lerp(hx, fx, u)} cy={lerp(hy, fy, u)} r={4 * pop(seg(p, u * 0.7, 0.3))} />
            ))}
          </g>
        );
      })}
      {riding}

      {/* the people on the floor stand BEHIND the belt: drawn before it */}
      <text className="ww-gb__row" x={WALL.left + 22} y="596" opacity={seg(t, T.hire + 400, 500) * (1 - seg(t, T.run - 400, 400))}>workers</text>
      {WORKERS.map((worker, i) => {
        if (t < worker.from) return null;
        const walked = Math.min(worker.x - DOOR_X, (t - worker.from) * WALK);
        const there = walked >= worker.x - DOOR_X;
        const step = walked / 40;
        const r = reach(worker.station);
        const swing = Math.sin(w * Math.PI * 8 + i);
        const breathe = 1.6 * Math.sin(t / 640 + i * 2.3);
        return (
          <Person
            key={i}
            kind="worker"
            x={DOOR_X + walked}
            face={there ? worker.face : 1}
            stride={there ? 0 : Math.sin(step * Math.PI)}
            bob={there ? breathe * (1 - r) : 3.5 * Math.abs(Math.sin(step * Math.PI))}
            hand={[
              lerp(there ? worker.face * 13 : 14 * Math.sin(step * Math.PI), worker.face * 54, r),
              lerp(-86, -100 + 9 * swing, r),
            ]}
            tool={there ? lerp(70, -18 + 26 * swing, r) : undefined}
          />
        );
      })}

      {/* the main belt: a drive at each end, rollers, cleats that travel with it */}
      <g opacity={seg(pBelt, 0, 0.12)}>
        <rect className="ww-ff__beltbody" x={BELT.x0} y={BELT_Y} width={(BELT.x1 - BELT.x0) * pBelt} height={BELT.h} rx={BELT.h / 2} />
        {Array.from({ length: 21 }, (_, i) => BELT.x0 + 18 + i * 56).map((rx, i) => {
          const there = pop(seg(pBelt, (rx - BELT.x0) / (BELT.x1 - BELT.x0), 0.12));
          const a = beltOff / 11;
          return (
            <g key={i} transform={`translate(${rx} ${BELT_Y + BELT.h / 2}) scale(${there.toFixed(2)})`}>
              <circle className="ww-ff__roller" r="7" />
              <line className="ww-ff__spoke" x1={(-6 * Math.cos(a)).toFixed(1)} y1={(-6 * Math.sin(a)).toFixed(1)} x2={(6 * Math.cos(a)).toFixed(1)} y2={(6 * Math.sin(a)).toFixed(1)} />
            </g>
          );
        })}
        {pBelt >= 1 &&
          Array.from({ length: 20 }, (_, i) => {
            const span = BELT.x1 - BELT.x0 - 40;
            const cx = BELT.x0 + 20 + ((i * 58 + beltOff) % span);
            return <line key={i} className="ww-ff__cleat" x1={cx.toFixed(1)} y1={BELT_Y - 1} x2={cx.toFixed(1)} y2={BELT_Y - 7} />;
          })}
        <path
          className="ww-ff__line"
          d={[150, 420, 700, 980, 1190].map((lx) => `M${lx} ${BELT_Y + BELT.h} V${FLOOR}`).join(' ')}
          {...drawn(seg(pBelt, 0.5, 0.5))}
        />
      </g>
      <g opacity={pop(seg(t, T.power - 500, 500))}>
        <g transform={`translate(1218 ${FLOOR - 40}) rotate(${(beltOff * 0.9).toFixed(1)})`}>
          <path className="ww-gb__gear" d={GEAR_BIG} />
          <circle className="ww-gb__hub" r="6" />
        </g>
        <g transform={`translate(1166 ${FLOOR - 26}) rotate(${(-beltOff * 0.9 * (34 / 22) + 14).toFixed(1)})`}>
          <path className="ww-gb__gear" d={GEAR_SMALL} />
          <circle className="ww-gb__hub" r="4.5" />
        </g>
      </g>

      {/* the cars: on the belt, and in the yard */}
      {cars}
      {parked}

      {/* where a wrench meets a part */}
      {STATIONS.map((k) =>
        busy(k) && w > 0.36 && w < 0.92
          ? [0, 1, 2, 3].map((j) => {
              const tick = Math.floor(w * 14);
              if (noise(cyc, k, j, tick) < 0.45) return null;
              const side = j % 2 ? 1 : -1;
              return (
                <path
                  key={`${k}-${j}`}
                  className="ww-ff__spark"
                  d={SPARK}
                  transform={`translate(${(stop(k) + side * (30 + 34 * noise(k, j, tick))).toFixed(1)} ${(BELT_Y - 30 - 70 * noise(j, tick, k)).toFixed(1)}) scale(${(0.6 + 0.9 * noise(tick, j, cyc)).toFixed(2)})`}
                />
              );
            })
          : null,
      )}
    </svg>
  );
}

export const ClassicFactorySlide: SlideDefinition = {
  id: 'factory-classic',
  content: () => (
    <>
      <CornerRings corner="top-right" />
      <div className="ww-gb">
        <Factory />
      </div>
    </>
  ),
  notes:
    'No clicks — it plays by itself, talk over it; about ten seconds until the line runs, then it '
    + 'keeps going. This is the factory in that photograph, as a machine. First, very smart engineers '
    + 'build it: up on the gallery they draw the plan, and the building, the conveyor and the feeders '
    + 'appear after it. Then ordinary people come to work on the line — identical, two at each '
    + 'station. Parts start to travel: a chassis on the main belt; wheels, engines, bodies down the '
    + 'feeders. The belt moves one station and stops, the part comes down, the wrenches swing — and '
    + 'out the other end come cars. Many. All the same. Watch the counter. '
    + 'That is the picture: the intelligence is in the people who designed the line, and on the line '
    + 'nobody needs any.',
};
