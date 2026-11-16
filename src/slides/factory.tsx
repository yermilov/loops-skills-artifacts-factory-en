import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';
import { useAnimating } from '../components/frameSettled';
import { useClock } from './BootstrapSlide';

/**
 * SCHEMATIC — the flow after «How do we improve it?», parked as three
 * placeholders so the order is not lost (Yarik, 12.11.2026: «just schematically
 * what we will talk after those slides»). Each one carries a visible DRAFT pill
 * and only the outline he dictated; nothing here is designed or sourced yet.
 *
 *   0. the architecture — DRAWN 16.11.2026 (ArchitectureSlide below). It now stands
 *      right after the assistant's session and before the runner: the plan (Yarik,
 *      same day) is to build it up element by element, as the system grew
 *   1. loop tasks that hunt problems — in logs, sloppy code, performance
 *   2. (was: examples of cool stuff — dropped 14.11.2026, the miniapps slide shows them)
 *   3. looks like we've built a software factory!
 *   4. my philosophy of a software factory
 *
 * Leads for when the real slides get written (not on the slides, unverified
 * for the stage): the three hunters exist in juggernaut as recurring tasks with
 * their own skills — `log-health-check`, `codebase-simplify-pass`,
 * `perf-health-check`.
 */

const Draft = () => <span className="ww-overlay ww-draft">draft · outline only</span>;

const HUNTERS = [
  { where: 'in the logs', what: 'errors and warnings nobody filed' },
  { where: 'in sloppy code', what: 'what can be simplified, now that it works' },
  { where: 'in performance', what: 'pages and queries that got slower' },
];

/** A stub for the closing beat (Yarik, 14.11.2026: «add a stub slide to the very
 *  end — how I prepared this talk»). Only the title is his. */
export const TalkPrepSlide: SlideDefinition = {
  id: 'talk-prep',
  title: 'How I prepared this talk',
  content: (
    <>
      <CornerRings corner="top-right" />
      <Draft />
    </>
  ),
  notes: 'DRAFT — stub. How this talk was prepared — with the same assistant. To design: what to show.',
};

/** The architecture, as ONE diagram (Yarik, 16.11.2026: «replace the text with a
 *  diagram; take the text on the slide as the base and explore juggernaut's code» —
 *  of the first boxes-and-arrows draft: «повна скукотіща», go and see how good ones
 *  are drawn; of the second, an animated journey: yes, ByteByteGo-like is the taste,
 *  and five things it must show — every SCREEN I reach it from, that the
 *  deterministic code runs on a Railway server, that there are TWO laptops and each
 *  polls the queue and runs Claude Code and Codex, and that the server itself
 *  integrates with external services). The practices kept from that reading: one
 *  request followed in numbered steps, nodes drawn as the things themselves,
 *  dashed lines that flow, a legend of few words — the rest is spoken. And of the
 *  third, where every group sat in a card: «навіщо все у квадратних блоках? дай
 *  діаграмі дихати» — so nothing is framed now: the server is one round node with its
 *  parts on the rim, and everything else stands free on curved lines.
 *  Facts read off ~/src/juggernaut: CLAUDE.md § Stack and § Production deployment
 *  (Hono on Bun, Postgres + PowerSync on Railway, the MCP server at /api/mcp, the
 *  Capacitor app), 26 folders under miniapps/, routes/wall.tsx («on a tablet or a
 *  TV»), apps/cli/src/start.ts (the runner) and the hosts the server code calls
 *  (Monobank, Spotify, Google Maps, Open-Meteo, TMDB, Discogs, the air-raid feed,
 *  Home Assistant). «280+» is a count of tool names in the MCP route files.
 *  Android Auto is on his word — it is not in that repository.
 *  The box is 1696 × 904 and everything in it is placed in px, so the paths below
 *  and the nodes' positions in the CSS are one drawing. */
const STEP_MS = 2600;
/** The six steps are only numbers on the lines — their words are spoken (Yarik, 16.11.2026:
 *  «remove all excessive titles»): I ask · «what's next?» · a task each · do the work ·
 *  report · sync and push. */
// What the agent reaches (MCP, the browser) is NOT a step: it is a connected system, drawn
// as a line that is always there (Yarik, 16.11.2026). The clock still has six beats — the
// fourth is the agent working — and asking the queue and getting the task are one two-way
// line with one number, so the numbers written on the lines run 1 to 4.
const STEP_COUNT = 6;

const curve = (ax: number, ay: number, bx: number, by: number) => {
  const mx = Math.round((ax + bx) / 2);
  return `M ${ax} ${ay} C ${mx} ${ay}, ${mx} ${by}, ${bx} ${by}`;
};
/** The screens stand on a shallow arc that leans towards the server; `i` is the row. */
const screenAt = (i: number) => ({ x: 250 + Math.round(60 - 60 * ((i - 3) / 3) ** 2), y: 130 + i * 108 });
/** Where every screen's line meets the server's rim. */
const HUB = [552, 410] as const;
const placeOf = (screen: { row: number; at?: [x: number, y: number] }) => {
  if (screen.at) return { x: screen.at[0], y: screen.at[1] };
  return screenAt(screen.row);
};

/** `owner` is the laptop whose own clock lights the line (laptops need not move in step). */
type Link = { id: string; d: string; steps: number[]; owner?: number; rail?: boolean; tip?: boolean; both?: boolean; token?: boolean | 'report' };
type ScreenKind = 'web' | 'phone' | 'term' | 'claude' | 'car' | 'tablet' | 'tv';
type Icon = readonly [name: string, d: string];

/** One state of the system: the slide builds the picture up scene by scene, the way
 *  the thing itself grew (Yarik, 16.11.2026) — the drawing code is the same for all. */
type Scene = {
  /** `row` is the place on the arc; `asks` marks the screen step 1 starts from; an `aside`
   *  screen has no line to the server — it is wired to something else (see `wires`); `at`
   *  places a screen off the arc, `flip` writes its name on the right */
  screens: { kind: ScreenKind; label: string; row: number; asks?: true; aside?: true; at?: [x: number, y: number]; flip?: true }[];
  /** connections that are simply there, not steps: the chat glyph into the laptop's chat
   *  column, the phone driving that chat. A `label` is written at `at` */
  wires?: { d: string; label?: string; at?: [x: number, y: number] }[];
  /** which of ON_SERVER stand in the cloud beside the server */
  onServer: string[];
  /** the server's own integrations, under it */
  services: boolean;
  /** three lines of their own: `poll` and `report` run laptop → server, `task` server → laptop;
   *  `reach` goes to what the agent is connected to; `ask` is the chat on that laptop
   *  putting a new task into the queue */
  laptops: {
    name: string;
    top: number;
    chat?: true;
    ask?: string;
    agents: string[];
    busy: string;
    doing: string;
    /** what starts the agents: a strip over their panes (the daemon, once /loop is gone) */
    via?: string;
    /** the agent that reviews the busy one's work before it reports */
    reviewer?: string;
    /** how many steps behind the first laptop this one runs — they need not move in step */
    shift?: number;
    /** the tasks it works, one per round: the name in the queue, and the word in its pane */
    tasks?: [queued: string, short: string][];
    /** its OWN tools: the `top` of a row of the scene's `hands` under this laptop */
    tools?: number;
    poll: string;
    task: string;
    report: string;
    reach: string[];
  }[];
  hands: readonly Icon[];
  /** the name written beside the line that leads to them */
  handsBy?: { label: string; at: [x: number, y: number] };
  /** more words written on the picture */
  notes?: { label: string; at: [x: number, y: number] }[];
  /** `n` is the step that lights it; `shown` is the number written, when it differs */
  /** …and `owner` the laptop whose clock it follows, when not the first */
  badges: [n: number, x: number, y: number, shown?: number, owner?: number][];
};

/** A line is drawn in the direction its task travels; `steps` are the ones that light it. */
function linksOf(scene: Scene): Link[] {
  return [
    // every screen → the server (only the asking one is walked, in step 1) …
    ...scene.screens.filter((screen) => !screen.aside).map((screen) => {
      const at = placeOf(screen);
      return { id: `in-${screen.kind}`, d: curve(at.x + 118, at.y + 41, HUB[0], HUB[1]), steps: screen.asks ? [1] : [], rail: true, token: true };
    }),
    // … and the server → every screen, in step 6
    ...scene.screens.filter((screen) => !screen.aside).map((screen) => {
      const at = placeOf(screen);
      return { id: `out-${screen.kind}`, d: curve(HUB[0], HUB[1], at.x + 126, at.y + 41), steps: [6], tip: true, token: true };
    }),
    ...(scene.wires ?? []).map((wire, i) => ({ id: `wire-${i}`, d: wire.d, steps: [], rail: true, tip: true, both: true })),
    ...scene.laptops.flatMap((laptop, owner) => [
      ...(laptop.ask ? [{ id: `ask-${laptop.name}`, d: laptop.ask, owner, steps: [1], rail: true, tip: true, token: true }] : []),
      // asking the queue and getting a task are ONE two-way line: `poll` is `task` walked backwards
      { id: `poll-${laptop.name}`, d: laptop.poll, owner, steps: [2], tip: true },
      { id: `task-${laptop.name}`, d: laptop.task, owner, steps: [3], rail: true, tip: true, both: true, token: true },
      { id: `report-${laptop.name}`, d: laptop.report, owner, steps: [5], rail: true, tip: true, token: 'report' as const },
      ...laptop.reach.map((d, i) => ({ id: `reach-${laptop.name}-${i}`, d, owner, steps: [], rail: true, tip: true })),
    ]),
  ];
}

/** One screen, drawn — a 120 × 88 miniature per kind. */
function Device({ kind }: { kind: ScreenKind }) {
  const phone = <rect className="is-body" x="38" y="2" width="44" height="84" rx="9" />;
  return (
    <svg viewBox="0 0 120 88" aria-hidden="true">
      {kind === 'web' && (
        <>
          <rect className="is-body" x="3" y="5" width="114" height="78" rx="8" />
          <path d="M3 22h114 M12 13.5h.1 M20 13.5h.1 M28 13.5h.1" />
          <rect className="is-soft" x="11" y="30" width="24" height="45" rx="3" />
          <rect className="is-soft" x="42" y="30" width="66" height="12" rx="3" />
          <rect className="is-soft" x="42" y="47" width="66" height="12" rx="3" />
          <rect className="is-mint" x="42" y="64" width="40" height="11" rx="3" />
        </>
      )}
      {kind === 'phone' && (
        <>
          {phone}
          <rect className="is-soft" x="45" y="13" width="30" height="13" rx="3" />
          <rect className="is-soft" x="45" y="31" width="30" height="13" rx="3" />
          <rect className="is-mint" x="45" y="49" width="30" height="13" rx="3" />
          <path d="M54 78h12" />
        </>
      )}
      {kind === 'term' && (
        <>
          <rect className="is-dark" x="3" y="5" width="114" height="78" rx="8" />
          <path className="is-claude" d="M14 26l11 9-11 9" />
          <path className="is-light" d="M33 45h24 M14 63h62" />
        </>
      )}
      {kind === 'claude' && (
        <>
          {phone}
          <path className="is-claude" d="M60 20v30 M47 27.5l26 15 M73 27.5l-26 15" />
          <rect className="is-soft" x="45" y="60" width="30" height="12" rx="3" />
          <path d="M54 80h12" />
        </>
      )}
      {kind === 'car' && (
        <>
          <rect className="is-body" x="14" y="4" width="92" height="52" rx="8" />
          <rect className="is-soft" x="22" y="12" width="34" height="36" rx="4" />
          <rect className="is-mint" x="62" y="12" width="36" height="15" rx="3" />
          <rect className="is-soft" x="62" y="33" width="36" height="15" rx="3" />
          <path d="M32 88a28 28 0 0 1 56 0 M60 60v10 M38 80h44" />
        </>
      )}
      {kind === 'tablet' && (
        <>
          <rect className="is-body" x="12" y="8" width="96" height="72" rx="9" />
          <rect className="is-soft" x="20" y="16" width="38" height="26" rx="3" />
          <rect className="is-mint" x="62" y="16" width="38" height="26" rx="3" />
          <rect className="is-soft" x="20" y="46" width="80" height="26" rx="3" />
        </>
      )}
      {kind === 'tv' && (
        <>
          <rect className="is-body" x="3" y="3" width="114" height="68" rx="5" />
          <path d="M42 85h36 M60 71v14" />
          <rect className="is-soft" x="11" y="11" width="30" height="52" rx="3" />
          <rect className="is-soft" x="45" y="11" width="30" height="24" rx="3" />
          <rect className="is-mint" x="45" y="39" width="30" height="24" rx="3" />
          <rect className="is-soft" x="79" y="11" width="30" height="52" rx="3" />
        </>
      )}
    </svg>
  );
}

const SERVICES = [
  ['Monobank', 'M3 9l9-5 9 5 M5 10v8 M10 10v8 M14 10v8 M19 10v8 M3 20h18'],
  ['Spotify', 'M9 18V5l11-2v13 M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0 M20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0'],
  ['Maps', 'M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z'],
  ['Home Assistant', 'M3 11l9-7 9 7 M5 10v10h14V10 M10 20v-6h4v6'],
  ['weather', 'M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9.5 4.3 4.3 0 0 0 7 18z'],
  ['TMDB', 'M4 5h16v14H4z M8 5v14 M16 5v14 M4 9.5h4 M4 14.5h4 M16 9.5h4 M16 14.5h4'],
  ['Discogs', 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'],
  ['air-raid alerts', 'M6 17v-6a6 6 0 0 1 12 0v6 M4 17h16 M10 20.5h4'],
] as const;

/** The queue inside the server, top first. */
const QUEUE = ['keep track of my coffee', 'slot 2', 'slot 3'] as const;

/** Railway, as the cloud the server lives in (Yarik, 16.11.2026: a circle is nobody's
 *  sign for a server — draw the hosting as a cloud, the server and its parts inside it).
 *  The two sides are arcs of one circle (centre 790 410, r 230), so every line that
 *  reaches the server ends on that circle; the top is three lobes, the bottom is flat. */
const CLOUD =
  'M 600 280 A 80 80 0 0 1 700 215 A 100 100 0 0 1 880 215 A 80 80 0 0 1 980 280 '
  + 'A 230 230 0 0 1 980 540 A 70 70 0 0 1 910 640 H 670 A 70 70 0 0 1 600 540 A 230 230 0 0 1 600 280 Z';

/** What else lives in the cloud beside the server and its queue. */
const ON_SERVER = [
  ['miniapps', 'M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z'],
  ['MCP tools', 'M9 3v5 M15 3v5 M6 8h12v4a6 6 0 0 1-12 0z M12 18v3'],
  ['cron', 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2'],
] as const;

const PLUG = 'M9 3v5 M15 3v5 M6 8h12v4a6 6 0 0 1-12 0z M12 18v3';

/** How it started: one laptop, two columns on its screen — my chat with Claude Code, and
 *  a /loop that works the queue on the server and reaches the outside through MCP tools.
 *  The chat is also drawn as its own glyph, wired into that left column: it is the
 *  user's entry point. Then Anthropic's Claude app on the phone, which just drives that
 *  chat through /remote-control. Both are connections, not steps (Yarik, 16.11.2026). */
const SCENE_FIRST: Scene = {
  screens: [
    { kind: 'term', label: 'Claude Code chat', row: 0, at: [1264, 110], aside: true },
    { kind: 'claude', label: 'Claude app', row: 0, at: [1360, 110], aside: true, flip: true },
  ],
  // both go straight into the laptop's chat column
  wires: [
    { d: 'M 1320 200 V 246' },
    { d: 'M 1420 200 V 246', label: '/remote-control', at: [1442, 202] },
  ],
  onServer: [],
  services: false,
  laptops: [
    {
      name: 'my laptop',
      top: 255,
      chat: true,
      // two columns on the one screen: my chat, and the /loop that works the queue
      agents: ['/loop'],
      busy: '/loop',
      doing: 'coffee tracker',
      ask: 'M 1270 275 C 1150 275, 1120 330, 1013 330',
      poll: 'M 1270 365 C 1150 365, 1130 410, 1035 410',
      task: 'M 1027 410 C 1130 410, 1150 365, 1262 365',
      // the report lands beside the database: that is where it is kept
      report: 'M 1270 410 C 1160 410, 1120 540, 990 540',
      // one trunk out of the laptop's base, then a branch to each tool under it
      reach: [1306, 1417, 1529, 1640].map((x) => `M 1473 488 V 590 C 1473 680, ${x} 650, ${x} 738`),
    },
  ],
  // «MCP» is the arrow's name; the icons are what it opens (Yarik, 16.11.2026)
  handsBy: { label: 'MCP', at: [1498, 520] },
  hands: [
    ['mail', 'M3 6h18v12H3z M3 7l9 6 9-6'],
    ['calendar', 'M4 5h16v15H4z M4 10h16 M8 3v4 M16 3v4'],
    ['files', 'M3 6h6l2 2h10v11H3z'],
    ['bank', 'M3 9l9-5 9 5 M5 10v8 M10 10v8 M14 10v8 M19 10v8 M3 20h18'],
  ],
  badges: [
    [1, 1182, 287],
    [2, 1160, 381],
    [5, 1138, 475, 3],
  ],
};

/** After the runner and the any-agent slides: the same picture, with the /loop gone.
 *  A daemon — plain code — polls the queue and opens an agent per task, Claude Code or
 *  Codex, and the other one reviews the work before it is reported (Yarik, 16.11.2026:
 *  «після 92 треба поставити оновлений архітектурний слайд на основі 90»). */
const SCENE_DAEMON: Scene = {
  ...SCENE_FIRST,
  // the chat is no longer Claude Code's alone: either agent can be the way in
  screens: SCENE_FIRST.screens.map((screen) =>
    screen.kind === 'term' ? { ...screen, label: 'Claude Code / Codex chat' } : screen,
  ),
  laptops: [
    {
      ...SCENE_FIRST.laptops[0],
      via: 'daemon',
      agents: ['Claude Code', 'Codex'],
      busy: 'Claude Code',
      doing: 'coffee',
      reviewer: 'Codex',
    },
  ],
};

/** And then a second laptop: it runs only the daemon — no chat of mine on it — but it
 *  polls the same queue on the same server and has the same MCP tools (Yarik,
 *  16.11.2026). Everything moves up to make room; the first laptop's line to the tools
 *  runs down the right edge and joins the second one's trunk. */
const SCENE_TWO: Scene = {
  ...SCENE_DAEMON,
  screens: SCENE_DAEMON.screens.map((screen) => ({ ...screen, at: [screen.at![0], 5] as [number, number] })),
  wires: [
    { d: 'M 1320 96 V 141' },
    { d: 'M 1420 96 V 141', label: '/remote-control', at: [1442, 98] },
  ],
  // each has its OWN MCP tools, works its OWN tasks, and they do not move in step
  // (Yarik, 16.11.2026): the second runs two steps behind, on a list of its own
  laptops: [
    {
      ...SCENE_DAEMON.laptops[0],
      top: 150,
      tasks: [
        ['keep track of my coffee', 'coffee'],
        ['book the car service', 'car'],
        ['plan the weekend trip', 'trip'],
      ],
      ask: 'M 1270 170 C 1150 170, 1120 300, 1008 300',
      poll: 'M 1270 260 C 1150 260, 1130 350, 1038 350',
      task: 'M 1030 350 C 1130 350, 1150 260, 1262 260',
      report: 'M 1270 305 C 1160 305, 1130 410, 1036 410',
      reach: ['M 1473 378 V 410'],
      tools: 420,
    },
    {
      name: 'second laptop',
      top: 500,
      via: 'daemon',
      agents: ['Claude Code', 'Codex'],
      busy: 'Codex',
      doing: 'cover',
      reviewer: 'Claude Code',
      shift: 2,
      tasks: [
        ['draw a playlist cover', 'cover'],
        ['sort the photo archive', 'photos'],
        ['renew the insurance', 'renewal'],
      ],
      poll: 'M 1270 590 C 1150 590, 1130 480, 1040 480',
      task: 'M 1032 480 C 1130 480, 1150 590, 1262 590',
      report: 'M 1270 660 C 1160 660, 1100 540, 1000 540',
      reach: ['M 1473 728 V 760'],
      tools: 770,
    },
  ],
  handsBy: undefined,
  notes: [
    { label: 'MCP', at: [1496, 376] },
    { label: 'MCP', at: [1496, 726] },
  ],
  badges: [
    [1, 1150, 222],
    [2, 1150, 305],
    [5, 1150, 357, 3],
    [2, 1150, 528, undefined, 1],
    [5, 1130, 596, 3, 1],
  ],
};

/** Where it stands today: every screen, the server's own integrations, two laptops with
 *  both agents on each — a different one takes the task on each in the journey. */
const SCENE_NOW: Scene = {
  screens: [
    { kind: 'web', label: 'myclaw web', row: 0 },
    { kind: 'phone', label: 'myclaw app', row: 1, asks: true },
    { kind: 'term', label: 'Claude Code · Codex chat', row: 2 },
    { kind: 'claude', label: 'Claude app', row: 3 },
    { kind: 'car', label: 'Android Auto', row: 4 },
    { kind: 'tablet', label: 'wall · tablet', row: 5 },
    { kind: 'tv', label: 'wall · TV', row: 6 },
  ],
  onServer: ON_SERVER.map(([name]) => name),
  services: true,
  laptops: [
    {
      name: 'laptop 1',
      top: 100,
      agents: ['Claude Code', 'Codex'],
      busy: 'Claude Code',
      doing: 'coffee tracker',
      poll: 'M 1270 205 C 1150 205, 1130 335, 1023 335',
      task: 'M 1015 335 C 1130 335, 1150 205, 1262 205',
      report: 'M 1270 260 C 1180 260, 1150 375, 1025 375',
      reach: ['M 1648 200 H 1676 V 742'],
    },
    {
      name: 'laptop 2',
      top: 410,
      agents: ['Claude Code', 'Codex'],
      busy: 'Codex',
      doing: 'car service',
      poll: 'M 1270 515 C 1150 515, 1130 485, 1023 485',
      task: 'M 1015 485 C 1130 485, 1150 515, 1262 515',
      report: 'M 1270 570 C 1150 570, 1110 530, 994 530',
      reach: ['M 1648 510 H 1676 V 742'],
    },
  ],
  hands: [
    ['browser', 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M3 12h18 M12 3c3 3.3 3 14.7 0 18 M12 3c-3 3.3-3 14.7 0 18'],
    ['MCP connectors', PLUG],
    ['shell', 'M4 5h16v14H4z M7 10l3 2-3 2 M12 15h5'],
  ],
  badges: [
    [1, 465, 325],
    [6, 506, 410, 4],
    [2, 1140, 270],
    [5, 1116, 350, 3],
    [2, 1140, 500],
    [5, 1179, 561, 3],
  ],
};

/** The scenes in the order the slide reveals them. */
const SCENES = [SCENE_FIRST, SCENE_NOW];
/** How many of them the slide shows. Today's picture (SCENE_NOW) is parked: the slide will
 *  get there one scene at a time (Yarik, 16.11.2026), so for now only the first is a frame. */
const SCENES_SHOWN = 1;

function Architecture({ scene }: { scene: Scene }) {
  const links = linksOf(scene);
  // the first days: nothing but the laptop talks to the server, so steps 1 and 6 stay on it
  const local = !scene.screens.some((screen) => screen.asks);
  const t = useClock(0);
  // the journey plays once for the ready mark, then keeps going round; the export
  // (t at its maximum) shows every step lit
  const all = t >= Number.MAX_SAFE_INTEGER;
  const step = all ? 0 : (Math.floor(t / STEP_MS) % STEP_COUNT) + 1;
  useAnimating(!all && t < STEP_COUNT * STEP_MS);
  const on = (...ns: number[]) => all || ns.includes(step);
  // each laptop keeps its own time: `shift` steps behind the first, a new task each round
  const tick = all ? 0 : Math.floor(t / STEP_MS);
  const localTick = (owner: number) => tick - (scene.laptops[owner]?.shift ?? 0);
  const stepOf = (owner = 0) => (all || localTick(owner) < 0 ? 0 : (localTick(owner) % STEP_COUNT) + 1);
  const onFor = (owner: number | undefined, ...ns: number[]) => all || ns.includes(stepOf(owner ?? 0));
  const jobOf = (owner: number, ahead = 0) => {
    const tasks = scene.laptops[owner]?.tasks;
    if (!tasks) return undefined;
    const round = all ? 0 : Math.max(0, Math.floor(localTick(owner) / STEP_COUNT));
    return tasks[(round + ahead) % tasks.length];
  };
  const someone = (...ns: number[]) => scene.laptops.some((_, owner) => onFor(owner, ...ns));
  return (
    <div className="ww-arch">
      <svg className="ww-arch__beams" viewBox="0 0 1696 904" aria-hidden="true">
        <defs>
          <marker id="ww-arch-tip" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3.4" markerHeight="3.4" orient="auto-start-reverse">
            <path className="ww-arch__tip" d="M0 0l10 5-10 5z" />
          </marker>
          <marker id="ww-arch-tip-on" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3.4" markerHeight="3.4" orient="auto">
            <path className="ww-arch__tip ww-arch__tip--on" d="M0 0l10 5-10 5z" />
          </marker>
        </defs>
        {links.filter((link) => link.rail).map((link) => (
          <path key={link.id} className="ww-arch__rail" d={link.d} markerStart={link.both ? 'url(#ww-arch-tip)' : undefined} markerEnd={link.tip ? 'url(#ww-arch-tip)' : undefined} />
        ))}
        {/* the server's own integrations never stop: both ways, on a timer */}
        {scene.services && (
          <path className="ww-arch__rail" d="M 790 652 V 728" markerStart="url(#ww-arch-tip)" markerEnd="url(#ww-arch-tip)" />
        )}
        {links.filter((link) => onFor(link.owner, ...link.steps)).map((link) => (
          <path key={`${link.id}-${stepOf(link.owner)}`} className="ww-arch__beam" d={link.d} pathLength={1} markerEnd={link.tip ? 'url(#ww-arch-tip-on)' : undefined} />
        ))}
      </svg>
      {links.filter((link) => link.token && !all && onFor(link.owner, ...link.steps)).map((link) => (
        <span key={`${link.id}-${stepOf(link.owner)}`} className={`ww-arch__token${link.token === 'report' ? ' ww-arch__token--report' : ''}`} style={{ offsetPath: `path('${link.d}')` }} aria-hidden="true" />
      ))}

      {/* me: every screen it reaches me on — no frame, just the things */}
      {scene.screens.map((screen) => {
        const at = placeOf(screen);
        return (
          <span
            key={screen.kind}
            className={`ww-arch__dev${screen.flip ? ' ww-arch__dev--flip' : ''}${(screen.aside ? step === 1 || step === 6 : step === 6 || (step === 1 && screen.asks)) ? ' ww-arch--hot' : ''}`}
            style={{ left: at.x, top: at.y }}
          >
            <i>{screen.label}</i>
            <Device kind={screen.kind} />
          </span>
        );
      })}

      {(scene.wires ?? []).map(
        (wire) =>
          wire.label && wire.at && (
            <span key={wire.label} className="ww-arch__note" style={{ left: wire.at[0], top: wire.at[1] }}>
              {wire.label}
            </span>
          ),
      )}

      {/* Railway: a cloud, and in it the server, its queue and what else lives there */}
      <svg
        className={`ww-arch__cloud${(local ? someone(2, 3, 5) : on(1, 2, 3, 5, 6)) && !all ? ' ww-arch--glow' : ''}`}
        viewBox="0 0 1696 904"
        aria-hidden="true"
      >
        <path d={CLOUD} />
      </svg>
      <div className="ww-arch__api">
        <div className="ww-arch__apihead">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 4h16v6H4z M4 14h16v6H4z M7 7h.1 M7 17h.1 M12 10v4" />
          </svg>
          <strong>server</strong>
        </div>
        {/* the queue, as what it is: named tasks waiting — the top one is asked for, then taken */}
        <div className="ww-arch__queue">
          <i>task queue</i>
          {(() => {
            // laptops with tasks of their own: what waits is each one's current task until
            // it is taken, and behind those the ones they will take next
            if (scene.laptops.some((laptop) => laptop.tasks)) {
              const now = scene.laptops.flatMap((_, owner) => {
                const job = jobOf(owner);
                return job && onFor(owner, 1, 2) ? [{ title: job[0], hot: !all && stepOf(owner) === 2 }] : [];
              });
              const next = scene.laptops.flatMap((_, owner) => {
                const job = jobOf(owner, onFor(owner, 1, 2) ? 1 : stepOf(owner) === 0 ? 0 : 1);
                return job ? [{ title: job[0], hot: false }] : [];
              });
              const waiting = [...now, ...next].filter((slot, i, list) => list.findIndex((other) => other.title === slot.title) === i);
              return waiting.slice(0, QUEUE.length).map((slot) => (
                <span key={slot.title} className={`ww-arch__slot ww-arch__slot--full ww-arch__slot--now${slot.hot ? ' ww-arch__slot--hot' : ''}`}>
                  {slot.title}
                </span>
              ));
            }
            return QUEUE.map((title, i) => {
            // the queue is empty until I have asked; the task waits there until a laptop takes it
            const waiting = i === 0 && (all || step === 1 || step === 2);
            return (
              <span
                key={title}
                className={`ww-arch__slot${waiting ? ' ww-arch__slot--full' : ''}${waiting && on(2) && !all ? ' ww-arch__slot--hot' : ''}`}
              >
                {waiting ? title : ' '}
              </span>
            );
            });
          })()}
        </div>
        {/* the database is there from the first day: the tasks and every session's log live in it */}
        <div className={`ww-arch__apihead ww-arch__apihead--db${!all && someone(5) ? ' ww-arch--hot' : ''}`}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 6c0-1.7 3.1-3 7-3s7 1.3 7 3-3.1 3-7 3-7-1.3-7-3z M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6 M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />
          </svg>
          <span>
            <strong>database</strong>
            <i>tasks · session logs</i>
          </span>
        </div>
        {scene.onServer.length > 0 && (
          <div className="ww-arch__icons" style={{ gridTemplateColumns: `repeat(${scene.onServer.length}, 1fr)` }}>
            {ON_SERVER.filter(([name]) => scene.onServer.includes(name)).map(([name, d]) => (
              <span key={name}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d={d} />
                </svg>
                {name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* what the server talks to by itself */}
      {scene.services && (
        <div className="ww-arch__ext">
          <div className="ww-arch__icons">
            {SERVICES.map(([name, d]) => (
              <span key={name}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d={d} />
                </svg>
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* the factory: two laptops, each polls the queue and runs both agents */}
      {scene.laptops.map((laptop, owner) => {
        const mine = stepOf(owner);
        const lit = (...ns: number[]) => all || ns.includes(mine);
        const busyNow = all || (mine >= 3 && mine <= 5);
        const job = jobOf(owner);
        const doing = job ? job[1] : laptop.doing;
        return (
        <div key={laptop.name} className={`ww-arch__mac${(lit(2, 3, 4, 5) || (laptop.chat && lit(1, 6))) && !all ? ' ww-arch--glow' : ''}`} style={{ top: laptop.top }}>
          <div className="ww-arch__screen">
            <div className="ww-arch__mini">
              <div className={`ww-arch__panes${laptop.chat ? ' ww-arch__panes--cols' : ''}`}>
                {laptop.chat && (
                  <span className={`ww-arch__pane${lit(1, 6) ? ' ww-arch__pane--on' : ''}`}>
                    <b>my chat</b>
                    <i>{mine === 6 ? '✓ done' : mine === 1 || all ? (job ? `› ${job[1]}` : '› track my coffee') : '○'}</i>
                  </span>
                )}
                {(() => {
                  // the reviewer joins once the work is under way, before the report
                  const reviewing = (agent: string) => agent === laptop.reviewer && (all || mine === 4 || mine === 5);
                  const panes = laptop.agents.map((agent) => {
                    const busy = busyNow && agent === laptop.busy;
                    return (
                      <span key={agent} className={`ww-arch__pane${busy || reviewing(agent) ? ' ww-arch__pane--on' : ''}`}>
                        <b>{agent}</b>
                        <i>{busy ? `⏺ ${doing}` : reviewing(agent) ? '⏺ review' : '○ idle'}</i>
                      </span>
                    );
                  });
                  if (!laptop.via) return panes;
                  return (
                    <span className="ww-arch__stack">
                      <em>{laptop.via}</em>
                      {panes}
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>
          <span className="ww-arch__base" />
        </div>
        );
      })}

      {(scene.notes ?? []).map((note, i) => (
        <span key={i} className="ww-arch__note" style={{ left: note.at[0], top: note.at[1] }}>
          {note.label}
        </span>
      ))}
      {/* a laptop's own tools, in a row under it */}
      {scene.laptops.map(
        (laptop) =>
          laptop.tools !== undefined && (
            <div key={laptop.name} className="ww-arch__reach" style={{ top: laptop.tools }}>
              <div className="ww-arch__icons" style={{ gridTemplateColumns: `repeat(${scene.hands.length}, 1fr)` }}>
                {scene.hands.map(([name, d]) => (
                  <span key={name}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d={d} />
                    </svg>
                    {name}
                  </span>
                ))}
              </div>
            </div>
          ),
      )}
      {scene.handsBy && (
        <span className="ww-arch__note" style={{ left: scene.handsBy.at[0], top: scene.handsBy.at[1] }}>
          {scene.handsBy.label}
        </span>
      )}
      {/* what the agents reach with their own hands */}
      {!scene.laptops.some((laptop) => laptop.tools !== undefined) && (
      <div className="ww-arch__reach">
        <div className="ww-arch__icons" style={{ gridTemplateColumns: `repeat(${scene.hands.length}, 1fr)` }}>
          {scene.hands.map(([name, d]) => (
            <span key={name}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d={d} />
              </svg>
              {name}
            </span>
          ))}
        </div>
      </div>
      )}

      {scene.badges.map(([n, x, y, shown, owner], i) => (
        <b key={i} className={`ww-arch__badge${onFor(owner, n) || (n === 2 && onFor(owner, 3)) ? ' ww-arch__badge--on' : ''}`} style={{ left: x, top: y }}>
          {shown ?? n}
        </b>
      ))}
    </div>
  );
}

export const ArchitectureSlide: SlideDefinition = {
  id: 'factory-architecture',
  maxRevealStages: SCENES_SHOWN - 1,
  content: ({ revealStage }) => {
    const stage = Math.min(Math.max(revealStage, 0), SCENES_SHOWN - 1);
    return (
      <>
        <CornerRings corner="top-right" />
        <Architecture key={stage} scene={SCENES[stage]} />
      </>
    );
  },
  notes:
    'BUILT UP IN SCENES. Scene 1 — how it started: ONE laptop works a task queue that lives on '
    + 'the server; the agent on it reaches the outside through MCP tools. My way in is a Claude '
    + 'Code chat in one half of its screen, and a /loop in the other works the queue. From the '
    + 'phone, Anthropic\'s Claude app just drives that same chat through /remote-control. '
    + 'PARKED, not on the slide yet — where it stands today: '
    + 'One picture of everything so far — and it is a loop; it plays by itself, follow the numbers. '
    + '[1] I ask — from whatever screen is in front of me: the myclaw web page, the myclaw app on '
    + 'the phone, a Claude Code or Codex chat, the Claude app, Android Auto in the car; the tablet '
    + 'and the TV at home are dashboards. Everything lands on ONE server, on Railway. That part is '
    + 'deliberately boring and deterministic: a task queue, a database, 26 miniapps, cron jobs, '
    + 'and one MCP server that exposes all of it as tools. There is NO AI inside it. It also talks '
    + 'to the outside by itself, on a timer: the bank, Spotify, maps, weather, the air-raid feed, '
    + 'the house. [2] I have two laptops, and on each a runner — a plain loop — asks the queue '
    + '«what\'s next?». [3] Each takes a task and opens an agent on it: Claude Code or Codex, both '
    + 'on both machines, reading the same skills. [4] The agent does the work with its own hands: '
    + 'the browser, MCP connectors, the shell. [5] It reports back — a report, an artifact, data — '
    + 'through the same MCP server. [6] And the server syncs it to every screen and pushes me a '
    + 'notification. (The runner and herdr are the next two slides.) Numbers as of 16 November: '
    + '26 miniapps, 280-odd MCP tools.',
};

/** The architecture again, after the runner and the any-agent slides have changed it. */
export const ArchitectureDaemonSlide: SlideDefinition = {
  id: 'factory-architecture-daemon',
  content: () => (
    <>
      <CornerRings corner="top-right" />
      <Architecture scene={SCENE_DAEMON} />
    </>
  ),
  notes:
    'The same picture as before the last two slides, with one thing changed on the laptop. The '
    + '/loop is gone: a daemon — plain code — polls the queue, and for every task it opens an '
    + 'agent with the model the task asks for: Claude Code or Codex. And before the work is '
    + 'reported, the other agent reviews it. Everything else stands as it was: the queue and the '
    + 'database on the server, my chat and the Claude app as the way in, MCP tools as the way out.',
};

/** …and with a second laptop that only runs the daemon. */
export const ArchitectureTwoSlide: SlideDefinition = {
  id: 'factory-architecture-two',
  content: () => (
    <>
      <CornerRings corner="top-right" />
      <Architecture scene={SCENE_TWO} />
    </>
  ),
  notes:
    'And since the queue lives on the server and the daemon is just a program, nothing stops me '
    + 'from starting it on a second laptop. That one has no chat of mine — it only runs the '
    + 'daemon. But it polls the same queue on the same server, takes its own tasks, reports into '
    + 'the same database, and has MCP tools of its own. Two machines, one queue: each works a '
    + 'different task, at its own pace — whichever asks first gets the next one.',
};

export const HuntersSlide: SlideDefinition = {
  id: 'factory-hunters',
  title: 'Loop tasks that hunt problems',
  content: (
    <>
      <CornerRings corner="bottom-left" />
      <div className="ww-columns" style={{ ['--cols' as string]: 3 }}>
        {HUNTERS.map((hunter) => (
          <div key={hunter.where}>
            <h3>{hunter.where}</h3>
            <p>{hunter.what}</p>
          </div>
        ))}
      </div>
      <Draft />
    </>
  ),
  notes:
    'DRAFT — outline only. Loop tasks that hunt problems: recurring tasks nobody has to file. One '
    + 'reads the logs, one looks for sloppy code, one watches performance — and each files what it '
    + 'finds as an ordinary task in the queue.',
};

export const FactoryRevealSlide: SlideDefinition = {
  id: 'factory-reveal',
  content: (
    <>
      <CornerRings corner="bottom-left" />
      <CornerRings corner="top-right" />
      <div className="ww-statement">
        <div className="ww-block">Looks like we have built a software factory!</div>
      </div>
      <Draft />
    </>
  ),
  notes:
    'DRAFT — outline only. The turn: a queue, agents that work it, a human queue, artifacts, a '
    + 'daemon, and now tasks that create tasks. Looks like we have built a software factory — the '
    + 'fourth word of the title.',
};

export const FactoryPhilosophySlide: SlideDefinition = {
  id: 'factory-philosophy',
  title: 'My philosophy of a software factory',
  content: (
    <>
      <CornerRings corner="top-right" />
      <ul>
        <li>principle one — to be written</li>
        <li>principle two — to be written</li>
        <li>principle three — to be written</li>
      </ul>
      <Draft />
    </>
  ),
  notes: 'DRAFT — outline only. My philosophy of a software factory: the principles are not written yet.',
};
