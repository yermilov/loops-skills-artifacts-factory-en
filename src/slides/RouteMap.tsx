/**
 * A maps app showing three ways from the car service to the office — the picture
 * the «assistant is ready» session does NOT get (Claude describes the same three
 * routes in a paragraph), and the picture the Artifacts slide then draws as the
 * agent's answer.
 *
 * A recreation in the idiom of a consumer maps app (light land, white streets,
 * yellow arterials, blue water, the chosen route in blue and the alternatives in
 * grey) — not a capture of any product. The geography is a SKETCH of Kyiv: Podil
 * on top by the river, the centre below, the blue metro line with its real
 * station order (Tarasa Shevchenka → Kontraktova → Poshtova → Maidan → Ploshcha
 * Ukrainskykh Heroiv → Olimpiiska). Streets are not to scale, the service and the
 * times are illustrative; the notes of both slides say so.
 *
 * Everything is drawn in one SVG at 1320×840, with the deck's code-size type, and
 * scaled down as one object — so the small map labels are not a fifth font size.
 */

type Point = [number, number];

const A: Point = [690, 110]; // the service, in Podil
const B: Point = [515, 700]; // the office
/** The blue line, north to south. */
const STATIONS: Point[] = [
  [745, 165],
  [775, 245],
  [850, 325],
  [765, 430],
  [645, 555],
  [565, 650],
];

const METRO = `M${STATIONS[0].join(' ')} L${STATIONS[1].join(' ')} C 800 290, 850 290, ${STATIONS[2].join(' ')} C 850 380, 800 400, ${STATIONS[3].join(' ')} C 720 470, 680 510, ${STATIONS[4].join(' ')} L${STATIONS[5].join(' ')}`;
const DRIVE = `M${A.join(' ')} L 940 180 C 955 250, 1000 300, 985 400 C 920 430, 800 440, 700 525 C 630 590, 560 650, ${B.join(' ')}`;
const WALK = `M${A.join(' ')} C 640 190, 610 280, 585 370 C 560 480, 535 590, ${B.join(' ')}`;

/** The ways to get there, in the order the app lists them. */
export const ROUTES = [
  { mode: 'Metro', time: '24 min', detail: '5 stops, no change' },
  { mode: 'Taxi', time: '16–30 min', detail: 'the embankment, ~190 UAH' },
  { mode: 'On foot', time: '1 h 10', detail: '5.6 km, over the hill' },
] as const;

function Bubble({ at, text, picked = false }: { at: Point; text: string; picked?: boolean }) {
  const w = text.length * 17 + 36;
  return (
    <g transform={`translate(${at[0]} ${at[1]})`} className="ww-map__bubble">
      <rect className="ww-map__card" x={-w / 2} y="-26" width={w} height="52" rx="26" />
      <text className={`ww-map__text${picked ? ' ww-map__text--route' : ''}`} y="10" textAnchor="middle">
        {text}
      </text>
    </g>
  );
}

/** Podil's street grid (regular, tilted) and the centre's (looser, tilted the other way). */
function Streets() {
  const lines: JSX.Element[] = [];
  for (let y = 40; y <= 330; y += 48) lines.push(<path key={`ph${y}`} d={`M500 ${y} L1000 ${y}`} />);
  for (let x = 500; x <= 1000; x += 62) lines.push(<path key={`pv${x}`} d={`M${x} 20 L${x} 340`} />);
  const centre: JSX.Element[] = [];
  for (let y = 380; y <= 980; y += 60) centre.push(<path key={`ch${y}`} d={`M-140 ${y} L1000 ${y}`} />);
  for (let x = -96; x <= 1000; x += 78) centre.push(<path key={`cv${x}`} d={`M${x} 360 L${x} 1000`} />);
  return (
    <g className="ww-map__street">
      <g transform="rotate(-16 750 180)">{lines}</g>
      <g transform="rotate(11 520 600)">{centre}</g>
      <path d="M0 150 L 470 250" />
      <path d="M0 300 L 430 330" />
      <path d="M140 0 L 220 360" />
      <path d="M330 0 L 380 350" />
    </g>
  );
}

/** `pick`: which of ROUTES is the chosen one — the metro (0, the default) or the
 *  taxi (1). The artifact on the task page is clickable, and a click re-draws it. */
export function RouteMap({ bare = false, pick = 0 }: { bare?: boolean; pick?: 0 | 1 }) {
  const metro = pick === 0;
  return (
    <svg
      className="ww-map__art"
      viewBox={bare ? '330 80 940 640' : '0 0 1320 840'}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="A map with three routes from the car service to the office: metro, taxi and on foot"
    >
      <rect className="ww-map__land" x="0" y="0" width="1320" height="840" />
      <Streets />
      <path className="ww-map__park" d="M905 240 C 965 300, 985 420, 968 570 L 915 610 C 890 490, 880 370, 862 280 Z" />
      <rect className="ww-map__park" x="330" y="455" width="120" height="86" rx="14" transform="rotate(11 390 498)" />
      <rect className="ww-map__park" x="120" y="610" width="170" height="120" rx="18" transform="rotate(11 205 670)" />

      {/* arterials: an edge under each, so they read as roads and not as paint */}
      {[
        'M960 0 C 935 140, 1010 260, 992 400 C 975 540, 1040 700, 1022 840',
        'M905 330 C 800 400, 640 520, 420 840',
        'M620 200 C 575 360, 520 520, 480 840',
        'M500 135 L 960 205',
        'M0 545 L 720 470',
      ].map((d) => (
        <g key={d}>
          <path className="ww-map__arterialedge" d={d} />
          <path className="ww-map__arterial" d={d} />
        </g>
      ))}

      <path
        className="ww-map__water"
        d="M1010 0 C 980 140, 1060 260, 1040 400 C 1020 540, 1090 700, 1070 840 L1320 840 L1320 0 Z"
      />
      <path className="ww-map__land" d="M1170 420 C 1230 400, 1262 470, 1240 560 C 1222 640, 1160 660, 1148 580 C 1140 520, 1130 440, 1170 420 Z" />
      <path className="ww-map__park" d="M1178 446 C 1218 436, 1238 486, 1222 548 C 1208 606, 1172 620, 1166 568 C 1160 520, 1152 458, 1178 446 Z" />
      <path className="ww-map__arterialedge" d="M1000 372 L 1320 340" />
      <path className="ww-map__arterial" d="M1000 372 L 1320 340" />

      <text className="ww-map__label" x="590" y="60">PODIL</text>
      <text className="ww-map__label" x="70" y="470">SHEVCHENKIVSKYI</text>
      <text className="ww-map__label" x="760" y="700">PECHERSK</text>
      <text className="ww-map__label ww-map__label--water" x="1120" y="230">Dnipro</text>

      {/* the alternatives, in grey, under the chosen one */}
      <path className="ww-map__walk" d={WALK} />
      {metro ? (
        <>
          <path className="ww-map__altedge" d={DRIVE} />
          <path className="ww-map__alt" d={DRIVE} />
          {/* the chosen route: a short walk, the metro, a short walk */}
          <path className="ww-map__walk ww-map__walk--route" d={`M${A.join(' ')} L${STATIONS[0].join(' ')}`} />
          <path className="ww-map__walk ww-map__walk--route" d={`M${STATIONS[5].join(' ')} L${B.join(' ')}`} />
          <path className="ww-map__routeedge" d={METRO} />
          <path className="ww-map__route" d={METRO} pathLength={1} />
          {STATIONS.map(([x, y]) => (
            <circle key={`${x}-${y}`} className="ww-map__station" cx={x} cy={y} r="9" />
          ))}
        </>
      ) : (
        <>
          <path className="ww-map__altedge" d={METRO} />
          <path className="ww-map__alt" d={METRO} />
          {/* the chosen route: the car, door to door */}
          <path className="ww-map__routeedge" d={DRIVE} />
          <path key="drive" className="ww-map__route" d={DRIVE} pathLength={1} />
        </>
      )}

      <Bubble at={[596, 318]} text="1 h 10" />
      {metro ? (
        <>
          <Bubble at={[905, 455]} text="16–30 min" />
          <g className="ww-map__picked">
            <Bubble at={[720, 500]} text="24 min" picked />
          </g>
        </>
      ) : (
        <>
          <Bubble at={[720, 500]} text="24 min" />
          <g className="ww-map__picked" key="drivetime">
            <Bubble at={[905, 455]} text="16–30 min" picked />
          </g>
        </>
      )}

      {/* A: where I leave the car. B: where I am going. */}
      <circle className="ww-map__origin" cx={A[0]} cy={A[1]} r="15" />
      <g transform={`translate(${B[0]} ${B[1]})`}>
        <g className="ww-map__pin">
          <path d="M0 0 C -26 -34, -30 -52, -30 -64 A 30 30 0 1 1 30 -64 C 30 -52, 26 -34, 0 0 Z" />
          <circle cy="-64" r="11" />
        </g>
      </g>

      {!bare && (
        <>
          {/* the directions card: from, to, and the three ways */}
          <g transform="translate(28 28)">
            <rect className="ww-map__card ww-map__card--panel" width="452" height="372" rx="22" />
            <circle className="ww-map__origin" cx="42" cy="50" r="11" />
            <text className="ww-map__text" x="76" y="61">AutoHub Podil</text>
            <path className="ww-map__rule" d="M76 86 L 428 86" />
            <circle className="ww-map__dot" cx="42" cy="122" r="11" />
            <text className="ww-map__text" x="76" y="133">Office</text>
            <path className="ww-map__rule" d="M0 166 L 452 166" />
            {ROUTES.map((route, i) => (
              <g key={route.mode} transform={`translate(0 ${166 + i * 66})`}>
                {i === 0 && <rect className="ww-map__chosen" x="12" y="8" width="428" height="54" rx="14" />}
                <text className={`ww-map__text${i === 0 ? ' ww-map__text--route' : ''}`} x="32" y="46">
                  {route.mode}
                </text>
                <text className={`ww-map__text${i === 0 ? ' ww-map__text--route' : ' ww-map__text--dim'}`} x="420" y="46" textAnchor="end">
                  {route.time}
                </text>
              </g>
            ))}
          </g>

          {/* zoom, and the scale */}
          <g transform="translate(1232 700)">
            <rect className="ww-map__card ww-map__card--panel" width="60" height="112" rx="14" />
            <path className="ww-map__glyph" d="M18 28 L 42 28 M30 16 L 30 40 M18 84 L 42 84" />
            <path className="ww-map__rule" d="M8 56 L 52 56" />
          </g>
          <g transform="translate(40 800)">
            <path className="ww-map__glyph" d="M0 -8 L 0 0 L 120 0 L 120 -8" />
            <text className="ww-map__label" x="136" y="6">500 m</text>
          </g>
        </>
      )}
    </svg>
  );
}

/** The app window around it, for the session slide. */
export function MapsWindow() {
  return (
    <div className="ww-map">
      <div className="ww-asst__finderbar">
        <span className="ww-dot ww-dot--red" />
        <span className="ww-dot ww-dot--amber" />
        <span className="ww-dot ww-dot--green" />
        <span className="ww-asst__findertitle">Maps</span>
      </div>
      <RouteMap />
    </div>
  );
}
