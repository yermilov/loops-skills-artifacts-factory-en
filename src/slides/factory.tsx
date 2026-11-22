import { SlideDefinition } from '../types/slides';
import { CornerRings, Reveal } from '../components/wawtech';
import { useAnimating } from '../components/frameSettled';
import { useClock } from './BootstrapSlide';
import { Machine } from './GoldbergSlide';
import herdrLogo from '../assets/herdr/logo.svg';
import factorioClip from '../assets/factory/factorio-factory.mp4';
import factorioStill from '../assets/factory/factorio-factory.jpg';
import fordLine from '../assets/factory/ford-body-drop-1913.jpg';

/**
 * SCHEMATIC — the flow after «How do we improve it?», parked as three
 * placeholders so the order is not lost (Yarik, 12.11.2026: «just schematically
 * what we will talk after those slides»). Each one carries a visible DRAFT pill
 * and only the outline he dictated; nothing here is designed or sourced yet.
 *
 *   0. the architecture — DRAWN 16.11.2026 (ArchitectureSlide below). It now stands
 *      right after the assistant's session and before the runner: the plan (Yarik,
 *      same day) is to build it up element by element, as the system grew
 *   1. looks like we've built a software factory! — moved 17.11.2026 to stand right
 *      after the miniapps tree (Yarik), so the hunters now come AFTER the turn
 *   2. (was: examples of cool stuff — dropped 14.11.2026, the miniapps slide shows them)
 *   3. loop tasks that hunt problems — in logs, sloppy code, performance
 *   4. my philosophy of a software factory
 *
 * Leads for when the real slides get written (not on the slides, unverified
 * for the stage): the three hunters exist in juggernaut as recurring tasks with
 * their own skills — `log-health-check`, `codebase-simplify-pass`,
 * `perf-health-check`.
 */

/** The loop tasks that keep the system itself in shape. Each is a real recurring series in
 *  the product (read off its task list on 17.11.2026), and each one's brief is the same
 *  sentence with a different name in it: «The method of this task is the skill X. Load it
 *  and run it.» — which is the slide's point: a loop is just a skill, started on a schedule.
 *    `name`   — a name the room can read (Yarik: «придумай кожному кращі назви»); the real
 *               series title is in `series`, for the notes
 *    `skill`  — the real skill, as the brief names it
 *    `prompt` — that skill's description, cut to four or five sentences; mine, not a quote,
 *               with «myclaw» for the product
 *  Left out on purpose: the loops about my life, and the ones that only update plugins. */
const REPAIR_LOOPS: { name: string; series: string; every: string; skill: string; prompt: string[] }[] = [
  {
    name: 'Read the logs',
    series: 'Daily check: backend + frontend log errors',
    every: 'every day',
    skill: 'engineering:log-health-check',
    prompt: [
      'Probe that the backend and the frontend are up.',
      'Sweep the logs of both since the previous run — search by text, not only by level.',
      'Group what you find by cause, and set aside the signatures known to be harmless.',
      'Verify each real problem, then file it as a task.',
      'Report what was checked and what was found.',
    ],
  },
  {
    name: 'Catch what got slower',
    series: 'Daily check: performance degradations',
    every: 'every day',
    skill: 'engineering:perf-health-check',
    prompt: [
      'Measure API latency percentiles, sync times and the frontend\'s Web Vitals since the previous run.',
      'Once a week, look at every route\'s trend: that is where slow drift shows.',
      'Compare everything with the baseline the last run left.',
      'Read-only: fix nothing — file a task for every real regression.',
      'Carry the new baseline forward for the next run.',
    ],
  },
  {
    name: 'Simplify the code',
    series: 'Simplify myclaw codebase',
    every: 'every day',
    skill: 'engineering:codebase-simplify-pass',
    prompt: [
      'Pick one slice of the codebase.',
      'Run the code-simplifier agent over it.',
      'Verify every change it proposes yourself: dead code, duplication, needless indirection, over-broad exports.',
      'Ship only what strictly preserves behaviour — tests, review, deploy.',
      'Anything that would change behaviour is a different task: file it.',
    ],
  },
  {
    name: 'Polish one page',
    series: 'Daily design pass: review prod web UI + evolve the design system',
    every: 'every day',
    skill: 'engineering:design-pass',
    prompt: [
      'Rotate to one page of the live app — or to one axis no page owns, such as how it feels on touch.',
      'Open it with real production data and gather evidence: screenshots, measurements.',
      'Ship ONE measured improvement, not a redesign.',
      'Run the mechanical checks before shipping.',
      'Fold what you learned into the design system, so the next page starts from it.',
    ],
  },
  {
    name: 'Improve one skill',
    series: 'Daily: improve one marketplace skill',
    every: 'every day',
    skill: 'agent-ops:marketplace-skill-review',
    prompt: [
      'Pick ONE skill from the marketplace.',
      'Have an independent reviewer grade it against the authoring rules.',
      'Check it yourself too: is every command true, can it be executed, does it contradict itself?',
      'Fix everything the review earns — in that one skill — and ship it.',
      'A fresh reviewer re-grades it from scratch; record the grade.',
    ],
  },
  {
    name: 'Learn from the last sessions',
    series: 'Self-improvement reflection',
    every: 'every day',
    skill: 'agent-ops:self-improvement-reflection',
    prompt: [
      'Read every session log of every agent since the previous reflection.',
      'Count the waste: retries, dead ends, questions that did not need asking.',
      'Extract the lessons that transfer, and home each where every agent inherits it: a check, a tool, a skill.',
      'Remove the rules that turned out false.',
      'Suggest a new skill where the same work keeps being improvised.',
    ],
  },
  {
    name: 'The right model for each task',
    series: 'Audit model/effort of agent tasks',
    every: 'every week',
    skill: 'agent-ops:agent-model-audit',
    prompt: [
      'Walk the queues of both agents.',
      'Judge each waiting task\'s difficulty against the model table.',
      'Where the model or the effort is a tier or more off, file a proposal to change it.',
      'Never change it yourself: that is a human decision.',
      'Report what was proposed, and what the last proposals came to.',
    ],
  },
  {
    // added 20.11.2026 (task 71128310, commit d1a694a): the one-off security audit turned
    // into a daily loop — «завжди оновлюй залежності; перетвори цю задачу на луп»
    name: 'Close the security holes',
    series: 'Security audit',
    every: 'every day',
    skill: 'engineering:security-audit',
    prompt: [
      'Update every dependency — every run, always.',
      'Clear the npm advisories: fixed by the update, or unreachable from our code — say which.',
      'Audit one slice of the attack surface in depth, in rotation — plus all the code that is new since the last run.',
      'Fix what is real, each with a test: the attacker refused, the legitimate user still served.',
      'Report what moved, what was fixed, and what needs a human — a secret to rotate, a decision.',
    ],
  },
];

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
 *  (Monobank, Spotify, Google Maps, Open-Meteo, TMDB, Discogs, Open Library,
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
type Link = { id: string; d: string; steps: number[]; owner?: number; fresh?: boolean; rail?: boolean; tip?: boolean; both?: boolean; token?: boolean | 'report' };
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
  wires?: { d: string; label?: string; at?: [x: number, y: number]; one?: true; of?: string }[];
  /** the devices at home a laptop reads by itself: a row of icons standing at `at` */
  home?: { at: [x: number, y: number]; width: number; icons: Icon[] };
  /** …and what the phone app reads on the phone itself, drawn the same way */
  health?: { at: [x: number, y: number]; width: number; icons: Icon[] };
  /** a miniapp puts a task into the queue: a line inside the cloud, from the pages to the queue */
  appTask?: true;
  /** the server's cron puts the loop tasks into the queue: a line inside the cloud, on the right */
  cronTask?: true;
  /** nobody types the work on this scene (the cron or a miniapp starts it): the laptop's chat
   *  column stays idle instead of echoing the task as if I had asked for it */
  idleChat?: true;
  /** which of ON_SERVER stand in the cloud beside the server */
  onServer: string[];
  /** the server's own integrations, under it */
  services: boolean;
  /** where they stand when not under the server, and the line that leads to them */
  servicesAt?: { left: number; top: number; width: number; rail: string };
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
  /** what this scene ADDS to the one before it, lit a little so the eye finds it (Yarik,
   *  16.11.2026): `screen:<kind>`, `laptop:<name>`, `daemon`, `miniapps`, `apptask`, `home`, `cron` */
  fresh?: string[];
  /** more words written on the picture */
  /** `of` names the `fresh` key a note or a wire belongs to: it is lit with it */
  notes?: { label: string; at: [x: number, y: number]; of?: string }[];
  /** `n` is the step that lights it; `shown` is the number written, when it differs */
  /** …and `owner` the laptop whose clock it follows, when not the first */
  badges: [n: number, x: number, y: number, shown?: number, owner?: number][];
};

/** A line is drawn in the direction its task travels; `steps` are the ones that light it. */
function linksOf(scene: Scene): Link[] {
  const fresh = (key?: string) => !!key && !!scene.fresh?.includes(key);
  return [
    // every screen → the server (only the asking one is walked, in step 1) …
    ...scene.screens.filter((screen) => !screen.aside).map((screen) => {
      const at = placeOf(screen);
      return { id: `in-${screen.kind}`, d: curve(at.x + 118, at.y + 41, HUB[0], HUB[1]), steps: screen.asks ? [1] : [], rail: true, token: true, fresh: fresh(`screen:${screen.kind}`) };
    }),
    // … and the server → every screen, in step 6
    ...scene.screens.filter((screen) => !screen.aside).map((screen) => {
      const at = placeOf(screen);
      return { id: `out-${screen.kind}`, d: curve(HUB[0], HUB[1], at.x + 126, at.y + 41), steps: [6], tip: true, token: true, fresh: fresh(`screen:${screen.kind}`) };
    }),
    ...(scene.wires ?? []).map((wire, i) => ({ id: `wire-${i}`, d: wire.d, steps: [], rail: true, tip: true, both: !wire.one, fresh: fresh(wire.of) })),
    ...scene.laptops.flatMap((laptop, owner) => [
      // every line of a laptop that is new is new with it
      ...(([
      ...(laptop.ask ? [{ id: `ask-${laptop.name}`, d: laptop.ask, owner, steps: [1], rail: true, tip: true, token: true }] : []),
      // asking the queue and getting a task are ONE two-way line: `poll` is `task` walked backwards
      { id: `poll-${laptop.name}`, d: laptop.poll, owner, steps: [2], tip: true },
      { id: `task-${laptop.name}`, d: laptop.task, owner, steps: [3], rail: true, tip: true, both: true, token: true },
      { id: `report-${laptop.name}`, d: laptop.report, owner, steps: [5], rail: true, tip: true, token: 'report' as const },
      ...laptop.reach.map((d, i) => ({ id: `reach-${laptop.name}-${i}`, d, owner, steps: [], rail: true, tip: true })),
      ] as Link[]).map((link) => ({ ...link, fresh: fresh(`laptop:${laptop.name}`) }))),
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

/** What the server calls by itself, with no agent in between — read off the real API's
 *  source on 16.11.2026 (the hosts it fetches): api.spotify.com, api.monobank.ua,
 *  maps/routes/places.googleapis.com, api.open-meteo.com (weather and air quality),
 *  api.themoviedb.org (and api.tvmaze.com), api.discogs.com, openlibrary.org, and a
 *  private Home Assistant. Not drawn: push (FCM), sign-in, logs, file storage. */
const SERVICES = [
  ['Spotify', 'M9 18V5l11-2v13 M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0 M20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0'],
  ['Monobank', 'M3 9l9-5 9 5 M5 10v8 M10 10v8 M14 10v8 M19 10v8 M3 20h18'],
  ['Maps', 'M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z'],
  ['weather', 'M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9.5 4.3 4.3 0 0 0 7 18z'],
  ['TMDB', 'M4 5h16v14H4z M8 5v14 M16 5v14 M4 9.5h4 M4 14.5h4 M16 9.5h4 M16 14.5h4'],
  ['Discogs', 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'],
  ['Open Library', 'M4 5h7a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4z M20 5h-5a2 2 0 0 0-2 2'],
  ['Home Assistant', 'M3 11l9-7 9 7 M5 10v10h14V10 M10 20v-6h4v6'],
] as const;

/** The queue inside the server, top first. */
const QUEUE = ['keep track of what I read', 'slot 2', 'slot 3'] as const;

/** Railway, as the cloud the server lives in (Yarik, 16.11.2026: a circle is nobody's
 *  sign for a server — draw the hosting as a cloud, the server and its parts inside it).
 *  The two sides are arcs of one circle (centre 790 410, r 230), so every line that
 *  reaches the server ends on that circle; the top is three lobes, the bottom is flat. */
/** From the miniapps part in the cloud, out to the left and up into the queue's last slot. */
const APP_TASK = 'M 671 494 C 612 490, 598 446, 622 430';
/** …the same line when cron stands beside the miniapps and pushes them to the left… */
const APP_TASK_LEFT = 'M 634 494 C 600 484, 598 442, 622 430';
/** …and cron's own, mirrored: out to the right and up into the same slot. */
const CRON_TASK = 'M 946 494 C 982 484, 984 442, 958 430';
/** The cloud, redrawn 17.11.2026 (Yarik: «переробити з нуля щоб вона гарно виглядала»): three
 *  bumps on top, round sides, and a bottom that follows on from the sides — each bottom
 *  corner is an arc TANGENT to the side arc where they meet (centre on the side's own
 *  radius), so there is no waist. The sides are where every line lands, so they did not move. */
const CLOUD =
  'M 600 280 A 80 80 0 0 1 700 200 A 100 100 0 0 1 880 200 A 80 80 0 0 1 980 280 '
  + 'A 230 230 0 0 1 980 540 A 90 90 0 0 1 905.7 579 H 674.3 A 90 90 0 0 1 600 540 A 230 230 0 0 1 600 280 Z';
/** The database's glyph: it stands in the row of the server's parts, between the others. */
const DB_ICON = 'M5 6c0-1.7 3.1-3 7-3s7 1.3 7 3-3.1 3-7 3-7-1.3-7-3z M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6 M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3';

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
      doing: 'book tracker',
      ask: 'M 1270 275 C 1150 275, 1120 330, 1013 330',
      poll: 'M 1270 365 C 1150 365, 1130 410, 1035 410',
      task: 'M 1027 410 C 1130 410, 1150 365, 1262 365',
      // the report lands beside the database: that is where it is kept
      report: 'M 1270 410 C 1160 410, 1120 540, 990 540',
      // one trunk out of the laptop's base, then a branch to each tool under it
      reach: [1287, 1361, 1436, 1510, 1584, 1659].map((x) => `M 1473 488 V 590 C 1473 680, ${x} 650, ${x} 738`),
    },
  ],
  // «MCP» is the arrow's name; the icons are what it opens (Yarik, 16.11.2026)
  handsBy: { label: 'MCP', at: [1498, 520] },
  hands: [
    ['Gmail', 'M3 6h18v12H3z M3 7l9 6 9-6'],
    ['GCal', 'M4 5h16v15H4z M4 10h16 M8 3v4 M16 3v4'],
    ['GDrive', 'M3 6h6l2 2h10v11H3z'],
    ['IBKR', 'M3 20h18 M4 15l5-5 4 3 7-8 M15 5h5v5'],
    ['Silpo', 'M2 4h3l3 11h10l2-8H6.5 M9 20h.01 M17 20h.01'],
    ['Audible', 'M4 15v-3a8 8 0 0 1 16 0v3 M4 14h3v6H4z M17 14h3v6h-3z'],
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
  fresh: ['daemon'],
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
      doing: 'books',
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
  fresh: ['laptop:second laptop'],
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
        ['keep track of what I read', 'books'],
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
    { label: 'MCP', at: [1496, 726], of: 'laptop:second laptop' },
  ],
  badges: [
    [1, 1150, 222],
    [2, 1150, 305],
    [5, 1150, 357, 3],
    [2, 1150, 528, undefined, 1],
    [5, 1130, 596, 3, 1],
  ],
};

/** And then the web page: once the tasks have a UI of their own, that is where I ask and
 *  where the answer comes back — step 1 starts in the browser and the report ends there
 *  (Yarik, 16.11.2026: «оновлений слайд з архітектурою де додається веб сторінка з якою
 *  взаємодіє користувач»). The chat is still wired into the laptop; it just is not the
 *  way in any more. */
const SCENE_WEB: Scene = {
  ...SCENE_TWO,
  fresh: ['screen:web'],
  // off the arc, level with the hub: one straight line in and back
  screens: [{ kind: 'web', label: 'myclaw web', row: 3, at: [190, 369], asks: true }, ...SCENE_TWO.screens],
  laptops: SCENE_TWO.laptops.map((laptop) => ({ ...laptop, ask: undefined })),
  badges: [
    // the answer coming back is not numbered: it is not a step worth a badge (Yarik, 16.11.2026)
    [1, 412, 386],
    ...SCENE_TWO.badges.filter(([n]) => n !== 1),
  ],
};

/** And once an artifact is kept — «make it a miniapp» — its code lives on the server too:
 *  the pages are deployed there and run there, beside the queue and the database (Yarik,
 *  16.11.2026: «додаємо на сервер код мініапок який там крутиться тепер»). */
const SCENE_APPS: Scene = {
  ...SCENE_WEB,
  fresh: ['miniapps'],
  onServer: ['miniapps'],
};

/** And the same pages on a phone: the mobile app is one more screen of mine on the same
 *  server (Yarik, 16.11.2026: «новий архітектурний слайд де додається myclaw mobile app»). */
const SCENE_MOBILE: Scene = {
  ...SCENE_APPS,
  fresh: ['screen:phone'],
  screens: [...SCENE_APPS.screens, { kind: 'phone', label: 'myclaw app', row: 4, at: [190, 510] }],
};

/** And a page is not only something to look at: a button on it can put a task into the
 *  same queue the agents work (Yarik, 17.11.2026: «архітектурна діаграма в якій мініапп
 *  створює задачу в черзі»). Stands after the Movies frame, whose headline says so. */
const SCENE_APPTASK: Scene = {
  ...SCENE_MOBILE,
  fresh: ['apptask'],
  appTask: true,
};
/** What the apptask slide draws: SCENE_APPTASK (which the later scenes spread) with a queue of
 *  the woken series instead of the errands — the same four as MINIAPP_LOOPS, the next slide,
 *  read off the live series on 22.11.2026 (Yarik: «онови приклади на основі того як в juggernaut
 *  все реально налаштовано»): «Порекомендуй фільм/серіал…», «Купити каву», «Кава: розпізнати фото
 *  й оновити смак», «Відповісти на питання про книжки» — all four on the Claude Code agent. Nobody
 *  asks on this slide, as on the cron one: no screen starts step 1 and the chat stays idle. */
const SCENE_APPTASK_WOKEN: Scene = {
  ...SCENE_APPTASK,
  idleChat: true,
  screens: SCENE_APPTASK.screens.map((screen) => ({ ...screen, asks: undefined })),
  badges: SCENE_APPTASK.badges.filter(([n]) => n !== 1),
  laptops: SCENE_APPTASK.laptops.map((laptop, owner) => ({
    ...laptop,
    // all four series are on the Claude Code agent, so Claude Code takes them on both laptops
    busy: 'Claude Code',
    reviewer: laptop.reviewer ? 'Codex' : undefined,
    tasks:
      owner === 0
        ? [
            ['recommend a film', 'film'],
            ['buy coffee', 'coffee'],
          ]
        : [
            ['read a coffee bag photo', 'photo'],
            ['answer a book question', 'books'],
          ],
  })),
};

/** And the daemon is not only a task runner: being a program on a machine that is AT HOME,
 *  it also reads the house on a timer — the router, the camera, which devices are on the
 *  Wi-Fi — and posts what it reads to the server (Yarik, 16.11.2026: «один з лептопів
 *  періодично збирає інформацію з моїх домашніх девайсів і відправляє на сервер»). The real
 *  runner does exactly these three: internet every 30 s, camera every 15 s, presence
 *  every 2 min. Plain code, no model. */
const SCENE_HOME: Scene = {
  ...SCENE_APPTASK,
  fresh: ['home'],
  wires: [
    ...(SCENE_APPTASK.wires ?? []),
    // the devices → the second laptop, then that laptop → the server
    { d: 'M 1060 792 C 1060 740, 1180 702, 1262 702', one: true, label: 'on a timer', at: [870, 722], of: 'home' },
    { d: 'M 1270 678 C 1180 678, 1090 650, 976 572', one: true, of: 'home' },
  ],
  home: {
    at: [890, 800],
    width: 330,
    icons: [
      ['router', 'M4 14h16v5H4z M8 16.5h.1 M12 16.5h.1 M16 14V8 M12.5 5.5a5 5 0 0 1 7 0'],
      ['camera', 'M3 7h13v10H3z M16 10l5-3v10l-5-3'],
      ['Wi-Fi devices', 'M8 3h8v18H8z M11 18h2'],
    ],
  },
};

/** And the phone is a collector too: the mobile app reads Google Health on the phone —
 *  steps, sleep, workouts — and posts it to the same server, which is where the Health and
 *  Sport pages get their numbers (Yarik, 16.11.2026: «мобільний мініапп збирає дані і
 *  відправляє також на сервер з google health»). No agent in this either. */
const SCENE_HEALTH: Scene = {
  ...SCENE_HOME,
  fresh: ['health'],
  wires: [
    ...(SCENE_HOME.wires ?? []),
    // Google Health → the phone, then the phone → the server (along its own line)
    { d: 'M 250 712 V 610', one: true, of: 'health' },
    { d: curve(308, 551, HUB[0], HUB[1]), one: true, of: 'health', label: 'steps · sleep · workouts', at: [40, 812] },
  ],
  health: {
    at: [130, 720],
    width: 240,
    icons: [['Google Health', 'M12 20s-7-4.4-7-9.5A4 4 0 0 1 12 8a4 4 0 0 1 7 2.5C19 15.6 12 20 12 20z']],
  },
};

/** And the server reaches out by itself too: Spotify for the Music page, and the other
 *  services it already calls on its own timer or on a page's request (Yarik, 16.11.2026:
 *  «додається інтеграція сервера з spotify (і досліди з ким сервер ще інтегрується)»). */
const SCENE_SERVICES: Scene = {
  ...SCENE_HEALTH,
  fresh: ['services'],
  services: true,
  // up and to the left of the cloud: under it the phone's label and the home devices stand
  servicesAt: { left: -40, top: 96, width: 530, rail: 'M 590 300 L 512 250' },
};

/** And the queue fills by itself: a cron on the server puts the loop tasks into it on a
 *  schedule — nobody files them (Yarik, 17.11.2026: «додаємо на архітектурну діаграму крон до
 *  серверу який періодично додає луп таски в чергу»). So in this scene nobody asks: the
 *  web page is just a screen, and what the laptops take are the loop tasks themselves. */
const SCENE_CRON: Scene = {
  ...SCENE_SERVICES,
  fresh: ['cron'],
  cronTask: true,
  idleChat: true,
  onServer: ['miniapps', 'cron'],
  screens: SCENE_SERVICES.screens.map((screen) => ({ ...screen, asks: undefined })),
  badges: SCENE_SERVICES.badges.filter(([n]) => n !== 1),
  laptops: SCENE_SERVICES.laptops.map((laptop, owner) => ({
    ...laptop,
    tasks:
      owner === 0
        ? [
            ['check the logs', 'logs'],
            ['simplify the code', 'code'],
            ['improve a skill', 'skill'],
          ]
        : [
            ['check performance', 'perf'],
            ['design pass', 'design'],
            ['audit the models', 'audit'],
          ],
  })),
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
      doing: 'book tracker',
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
/** «It builds itself»: the same scenes in the order the deck showed them, and in the
 *  queue the task that builds the next one. The second laptop keeps its own errands. */
const BUILD_MS = 750;
const BUILD_TASKS: [queued: string, short: string][] = [
  ['add a second laptop', 'laptop'],
  ['build a web page', 'web'],
  ['host the miniapps', 'miniapps'],
  ['build the mobile app', 'mobile'],
  ['let miniapps add tasks', 'tasks'],
  ['read the home devices', 'home'],
  ['sync Google Health', 'health'],
  ['integrate Spotify', 'Spotify'],
  ['build the next thing', 'next'],
];
const BUILD_SCENES: Scene[] = [
  { ...SCENE_DAEMON, fresh: [] },
  SCENE_TWO,
  SCENE_WEB,
  SCENE_APPS,
  SCENE_MOBILE,
  SCENE_APPTASK,
  SCENE_HOME,
  SCENE_HEALTH,
  SCENE_SERVICES,
].map((scene) => ({
  ...scene,
  laptops: scene.laptops.map((laptop, owner) => (owner === 0 ? { ...laptop, tasks: BUILD_TASKS } : laptop)),
}));

const SCENES = [SCENE_FIRST, SCENE_NOW];
/** How many of them the slide shows. Today's picture (SCENE_NOW) is parked: the slide will
 *  get there one scene at a time (Yarik, 16.11.2026), so for now only the first is a frame. */
const SCENES_SHOWN = 1;

/** `build` plays a list of scenes one after another, one round of the journey each:
 *  the first laptop's task in round N is «build what scene N+1 adds», and when it
 *  reports, the picture becomes that scene («It builds itself», Yarik, 17.11.2026). */
function Architecture({ scene: given, build }: { scene: Scene; build?: Scene[] }) {
  const t = useClock(0);
  const ms = build ? BUILD_MS : STEP_MS;
  const scene = build
    ? build[Math.min(t >= Number.MAX_SAFE_INTEGER ? build.length - 1 : Math.floor(t / (ms * STEP_COUNT)), build.length - 1)]
    : given;
  const links = linksOf(scene);
  // the first days: nothing but the laptop talks to the server, so steps 1 and 6 stay on it
  const local = !scene.screens.some((screen) => screen.asks);
  // the journey plays once for the ready mark, then keeps going round; the export
  // (t at its maximum) shows every step lit
  const all = t >= Number.MAX_SAFE_INTEGER;
  const step = all ? 0 : (Math.floor(t / ms) % STEP_COUNT) + 1;
  useAnimating(!all && t < (build ? build.length : 1) * STEP_COUNT * ms);
  const on = (...ns: number[]) => all || ns.includes(step);
  // each laptop keeps its own time: `shift` steps behind the first, a new task each round
  const tick = all ? 0 : Math.floor(t / ms);
  const localTick = (owner: number) => tick - (scene.laptops[owner]?.shift ?? 0);
  const stepOf = (owner = 0) => (all || localTick(owner) < 0 ? 0 : (localTick(owner) % STEP_COUNT) + 1);
  const onFor = (owner: number | undefined, ...ns: number[]) => all || ns.includes(stepOf(owner ?? 0));
  const jobOf = (owner: number, ahead = 0) => {
    const tasks = scene.laptops[owner]?.tasks;
    if (!tasks) return undefined;
    const round = all ? 0 : Math.max(0, Math.floor(localTick(owner) / STEP_COUNT));
    // the build list is not a loop: it ends on its last task and stays there
    if (build && owner === 0) return tasks[Math.min(all ? tasks.length - 1 : round + ahead, tasks.length - 1)];
    return tasks[(round + ahead) % tasks.length];
  };
  const someone = (...ns: number[]) => scene.laptops.some((_, owner) => onFor(owner, ...ns));
  const fresh = (key: string) => (scene.fresh?.includes(key) ? ' ww-arch--new' : '');
  return (
    <div className={build ? 'ww-arch ww-arch--fast' : 'ww-arch'}>
      <svg className="ww-arch__beams" viewBox="0 0 1696 904" aria-hidden="true">
        <defs>
          <marker id="ww-arch-tip" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3.4" markerHeight="3.4" orient="auto-start-reverse">
            <path className="ww-arch__tip" d="M0 0l10 5-10 5z" />
          </marker>
          <marker id="ww-arch-tip-on" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3.4" markerHeight="3.4" orient="auto">
            <path className="ww-arch__tip ww-arch__tip--on" d="M0 0l10 5-10 5z" />
          </marker>
        </defs>
        {/* what the scene adds: a mint halo under the line */}
        {links.filter((link) => link.fresh && (link.rail || link.id.startsWith('out-'))).map((link) => (
          <path key={`new-${link.id}`} className="ww-arch__halo" d={link.d} />
        ))}
        {links.filter((link) => link.rail).map((link) => (
          <path key={link.id} className="ww-arch__rail" d={link.d} markerStart={link.both ? 'url(#ww-arch-tip)' : undefined} markerEnd={link.tip ? 'url(#ww-arch-tip)' : undefined} />
        ))}
        {/* the server's own integrations never stop: both ways, on a timer */}
        {scene.services && (
          <>
            {scene.fresh?.includes('services') && <path className="ww-arch__halo" d={scene.servicesAt?.rail ?? 'M 790 590 V 728'} />}
            <path className="ww-arch__rail" d={scene.servicesAt?.rail ?? 'M 790 590 V 728'} markerStart="url(#ww-arch-tip)" markerEnd="url(#ww-arch-tip)" />
          </>
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
            className={`ww-arch__dev${fresh(`screen:${screen.kind}`)}${screen.flip ? ' ww-arch__dev--flip' : ''}${(screen.aside ? step === 1 || step === 6 : step === 6 || (step === 1 && screen.asks)) ? ' ww-arch--hot' : ''}`}
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
            <span key={wire.label} className={`ww-arch__note${wire.of ? fresh(wire.of) : ''}`} style={{ left: wire.at[0], top: wire.at[1] }}>
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
        {/* the server's parts, one row under the queue: the database is there from the first
            day (the tasks and every session's log live in it); the pages and the cron join it */}
        <div className="ww-arch__parts">
          {[
            ...ON_SERVER.filter(([name]) => name === 'miniapps' && scene.onServer.includes(name)),
            ['database', DB_ICON] as const,
            ...ON_SERVER.filter(([name]) => name !== 'miniapps' && scene.onServer.includes(name)),
          ].map(([name, d]) => (
            <span key={name} className={`ww-arch__part${fresh(name)}${name === 'database' && !all && someone(5) ? ' ww-arch--hot' : ''}`}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d={d} />
              </svg>
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* a miniapp files a task: drawn over the cloud, which would cover a line under it */}
      {scene.appTask && (
        <svg className="ww-arch__beams" viewBox="0 0 1696 904" aria-hidden="true">
          {scene.fresh?.includes('apptask') && <path className="ww-arch__halo" d={APP_TASK} />}
          <path className="ww-arch__rail" d={scene.cronTask ? APP_TASK_LEFT : APP_TASK} markerEnd="url(#ww-arch-tip)" />
          {scene.cronTask && scene.fresh?.includes('cron') && <path className="ww-arch__halo" d={CRON_TASK} />}
          {scene.cronTask && <path className="ww-arch__rail" d={CRON_TASK} markerEnd="url(#ww-arch-tip)" />}
        </svg>
      )}

      {/* what the server talks to by itself */}
      {scene.services && (
        <div
          className={`ww-arch__ext${fresh('services')}`}
          style={scene.servicesAt && { left: scene.servicesAt.left, top: scene.servicesAt.top, width: scene.servicesAt.width }}
        >
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
        <div key={laptop.name} className={`ww-arch__mac${fresh(`laptop:${laptop.name}`)}${(lit(2, 3, 4, 5) || (laptop.chat && !scene.idleChat && lit(1, 6))) && !all ? ' ww-arch--glow' : ''}`} style={{ top: laptop.top }}>
          <div className="ww-arch__screen">
            <div className="ww-arch__mini">
              <div className={`ww-arch__panes${laptop.chat ? ' ww-arch__panes--cols' : ''}`}>
                {laptop.chat && (
                  <span className={`ww-arch__pane${lit(1, 6) && !scene.idleChat ? ' ww-arch__pane--on' : ''}`}>
                    <b>my chat</b>
                    <i>{scene.idleChat ? '○' : mine === 6 ? '✓ done' : mine === 1 || all ? (job ? `› ${job[1]}` : '› track my books') : '○'}</i>
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
                    <span className={`ww-arch__stack${fresh('daemon')}`}>
                      <em>
                        {/* the daemon drives herdr: its mark sits on the strip (Yarik, 16.11.2026) */}
                        <img src={herdrLogo} alt="herdr" />
                        {laptop.via}
                      </em>
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
        <span key={i} className={`ww-arch__note${note.of ? fresh(note.of) : ''}`} style={{ left: note.at[0], top: note.at[1] }}>
          {note.label}
        </span>
      ))}
      {([['home', scene.home], ['health', scene.health]] as const).map(
        ([key, group]) =>
          group && (
            <div key={key} className={`ww-arch__reach${fresh(key)}`} style={{ left: group.at[0], top: group.at[1], width: group.width }}>
              <div className="ww-arch__icons" style={{ gridTemplateColumns: `repeat(${group.icons.length}, 1fr)` }}>
                {group.icons.map(([name, d]) => (
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
      {/* a laptop's own tools, in a row under it */}
      {scene.laptops.map(
        (laptop) =>
          laptop.tools !== undefined && (
            <div key={laptop.name} className={`ww-arch__reach${fresh(`laptop:${laptop.name}`)}`} style={{ top: laptop.tools }}>
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
    + 'to the outside by itself, on a timer: the bank, Spotify, maps, weather, '
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

/** …and with the web page as the way in. */
export const ArchitectureWebSlide: SlideDefinition = {
  id: 'factory-architecture-web',
  content: () => (
    <>
      <CornerRings corner="top-right" />
      <Architecture scene={SCENE_WEB} />
    </>
  ),
  notes:
    'So the picture gets one more piece, and it is on my side of it. The web page talks to the '
    + 'same server and the same database as everything else. I create a task there — step one — '
    + 'it lands in the queue, a daemon on one of the laptops takes it, an agent works it and '
    + 'reports, and the answer comes back to the page I am looking at. The chat is still there, '
    + 'but I no longer have to open a terminal to ask for something.',
};

/** …and with the miniapps' code running on the server. */
export const ArchitectureAppsSlide: SlideDefinition = {
  id: 'factory-architecture-apps',
  content: () => (
    <>
      <CornerRings corner="top-right" />
      <Architecture scene={SCENE_APPS} />
    </>
  ),
  notes:
    'And that changes the picture once more. Until now the server held a queue and a database. '
    + 'A miniapp is code — a table, an API, a page — and the agent deploys it to that same server, '
    + 'where it keeps running after the task that made it is closed. So the server is no longer '
    + 'just the place the tasks wait: it is where my apps live, and the web page I open shows them.',
};

/** …and with the mobile app as a second screen. */
export const ArchitectureMobileSlide: SlideDefinition = {
  id: 'factory-architecture-mobile',
  content: () => (
    <>
      <CornerRings corner="top-right" />
      <Architecture scene={SCENE_MOBILE} />
    </>
  ),
  notes:
    'One more screen on my side. The mobile app is not a second system: it talks to the same '
    + 'server, reads the same database and shows the same miniapps — it just has a camera and is '
    + 'in my pocket. Whatever I add on the phone is on the web page a second later, and the '
    + 'agents see it too.',
};

/** …and with a laptop that reads the house. */
/** …and with a miniapp putting a task into the queue (was a reminder stub that morning). */
export const ArchitectureAppTaskSlide: SlideDefinition = {
  id: 'factory-architecture-apptask',
  content: () => (
    <>
      <CornerRings corner="top-right" />
      <Architecture scene={SCENE_APPTASK_WOKEN} />
    </>
  ),
  notes:
    'One small arrow, and it closes a loop. Until now a task came from me — from the web page, '
    + 'the phone, a chat. Now a miniapp can put one into the queue itself: a tap on a page records '
    + 'an event, a loop task waiting on it is let into the queue, and the same laptops pick it up '
    + 'like any other. The pages are no longer '
    + 'only where results land — they are one more place work starts from.',
};

export const ArchitectureHomeSlide: SlideDefinition = {
  id: 'factory-architecture-home',
  content: () => (
    <>
      <CornerRings corner="top-right" />
      <Architecture scene={SCENE_HOME} />
    </>
  ),
  notes:
    'Where does the Home page get its data? From the same daemon. It is a program on a laptop '
    + 'that stands at home, on the home network — so besides running tasks it reads the house on '
    + 'a timer: the router, the camera, which devices are on the Wi-Fi. Every few seconds to '
    + 'every couple of minutes, and each reading goes to the server. No agent and no tokens in '
    + 'this — plain code again. The server cannot see my home network; the laptop can.',
};

/** …and with the phone app sending health data. */
export const ArchitectureHealthSlide: SlideDefinition = {
  id: 'factory-architecture-health',
  content: () => (
    <>
      <CornerRings corner="top-right" />
      <Architecture scene={SCENE_HEALTH} />
    </>
  ),
  notes:
    'And where do Sleep, Health and Sport get their numbers? From the phone. The mobile app is '
    + 'not only a screen: it reads Google Health on the phone — steps, sleep, workouts — and '
    + 'sends it to the same server. Same idea as the laptop reading the house: a device that is '
    + 'already where the data is, plain code, no agent. The agents come later, when they read '
    + 'that data and tell me something about it.',
};

/** …and with the server's own integrations. */
export const ArchitectureServicesSlide: SlideDefinition = {
  id: 'factory-architecture-services',
  content: () => (
    <>
      <CornerRings corner="top-right" />
      <Architecture scene={SCENE_SERVICES} />
    </>
  ),
  notes:
    'One more kind of connection, and this one is the server\'s own. To build that playlist it '
    + 'talks to Spotify directly — reads my liked songs, creates the playlist, sets the cover. '
    + 'No agent, no laptop: the server calls the API. And Spotify is not the only one. The same '
    + 'server reads my bank through Monobank, asks Google Maps for travel times, Open-Meteo for '
    + 'the weather and air quality, TMDB for films, Discogs for records, Open Library for book '
    + 'covers, and a private Home Assistant for the devices at home. '
    + 'So there are three ways data gets in now: an agent brings it through MCP, a device of '
    + 'mine sends it, or the server fetches it itself.',
};

/** PDF capture has no video playback: export shows the last frame as a still. */
const EXPORT_MODE =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('export') === '1';

/**
 * «Looks like we have built a software factory!» — the turn, full bleed, in the
 * same treatment as «Our barebones AI assistant is ready» (AssistantReadySlide,
 * whose `ww-ready` classes it reuses): one silent shot, played once, holding on its
 * last frame, the title over it. Yarik, 17.11.2026: «what about factorio game?» —
 * the game's arc is the talk's arc (craft by hand, automate a step, automate the
 * thing that automates), and the room knows «the factory must grow».
 *
 * Clip: the LAST shot of the official «Factorio 1.0 Launch Trailer» (Wube Software,
 * YouTube BqaAjgpsoW8, 1080p — the one embedded in factorio.com/presskit), 5.3 s,
 * silent: the camera drifts over the finished base, a rocket lifts off, and the
 * crashed ship the trailer opened on comes into frame, now surrounded by factory.
 * Recorded off the playing video on 17.11.2026; cut after the wipe that opens the
 * shot and before the logo fades in. The poster / export still is its last frame.
 * Shown in a talk as commentary, like the film clips.
 */
const FACTORY_ALT =
  'Factorio 1.0 launch trailer: a sprawling automated factory, a rocket lifting off beside the crashed ship it all started from';

export const FactoryRevealSlide: SlideDefinition = {
  id: 'factory-reveal',
  content: (
    <div className="ww-ready">
      {EXPORT_MODE ? (
        <img className="ww-ready__img" src={factorioStill} alt={FACTORY_ALT} />
      ) : (
        <video
          className="ww-ready__img"
          src={factorioClip}
          poster={factorioStill}
          aria-label={FACTORY_ALT}
          autoPlay
          muted
          playsInline
          preload="auto"
        />
      )}
      <div className="ww-ready__title" role="heading" aria-level={2}>
        Looks like we have built a software factory!
      </div>
    </div>
  ),
  notes:
    'The turn. A queue, agents that work it, a human queue, artifacts, a daemon, and a tree of '
    + 'miniapps that grew out of it. (Let the clip play — five seconds.) Anyone who has played '
    + 'Factorio knows this picture: you start by crafting things by hand next to a crashed ship, '
    + 'then you automate one step, then you automate the thing that automates — and the factory '
    + 'must grow. Looks like we have built a software factory — the fourth word of the title. '
    + '(Factorio 1.0 launch trailer, Wube Software.)',
};

/** After the reveal, three slides say what kind of factory it is — it builds itself, it
 *  learns from itself, it repairs itself (Yarik, 17.11.2026). The first two show a
 *  picture the deck has already drawn, again, under a title: `ww-self` holds it. */
export const BuildsItselfSlide: SlideDefinition = {
  id: 'factory-builds-itself',
  title: 'Software factory builds your product and builds itself',
  content: () => (
    <div className="ww-self">
      <Architecture scene={BUILD_SCENES[0]} build={BUILD_SCENES} />
    </div>
  ),
  notes:
    'No clicks — it plays by itself, talk over it. It builds itself. Start from the simplest '
    + 'picture: one laptop, a daemon, a queue on the server. Now watch the queue: every task in '
    + 'it is «build the next piece of this very system». The agent takes it, does the work, '
    + 'reports — and the piece appears, in mint: a second laptop, a web page, the miniapps on '
    + 'the server, the mobile app, miniapps that add tasks, the home devices, Google Health, '
    + 'Spotify and the other services. Every element of the architecture you saw was a task in '
    + 'its own queue.',
};

export const LearnsItselfSlide: SlideDefinition = {
  id: 'factory-learns-itself',
  title: 'Software factory learns from its work',
  content: () => (
    <div className="ww-self">
      <div className="ww-gb">
        <Machine />
      </div>
    </div>
  ),
  notes:
    'No clicks — it runs by itself. It learns from itself. The machine from before: the agent '
    + 'picks a task, pulls the skills it needs, does the work — and then looks back. A skill it '
    + 'used goes back to the marketplace one version better; sometimes a brand-new skill appears. '
    + 'Watch the version numbers on the right: they never stop climbing. Nobody schedules that — '
    + 'it is the last step of every task.',
};

/** «It repairs itself», in two slides (Yarik, 17.11.2026): first the architecture with the
 *  cron that feeds the queue, then the loop tasks themselves, one per click. */
export const RepairsItselfSlide: SlideDefinition = {
  id: 'factory-repairs-itself',
  title: 'Software factory repairs itself',
  content: () => (
    <div className="ww-self">
      <Architecture scene={SCENE_CRON} />
    </div>
  ),
  notes:
    'It repairs itself — and here is the last piece of the picture. On the server there is a '
    + 'cron. On a schedule it puts loop tasks into the queue: nobody files them, nobody asks. '
    + 'Watch the queue — check the logs, simplify the code, improve a skill — and the same '
    + 'laptops pick them up like any other task. What those tasks are is the next slide.',
};

export const RepairLoopsSlide: SlideDefinition = {
  id: 'factory-repair-loops',
  title: 'Software factory repairs itself',
  maxRevealStages: REPAIR_LOOPS.length,
  initialRevealStage: 1,
  content: ({ revealStage }) => {
    const at = Math.min(Math.max(revealStage, 1), REPAIR_LOOPS.length) - 1;
    const loop = REPAIR_LOOPS[at];
    return (
      <>
        <CornerRings corner="bottom-left" />
        <div className="ww-loops">
          {/* the loops so far, the current one lit */}
          <div className="ww-loops__list">
            {REPAIR_LOOPS.map((item, i) => (
              <Reveal key={item.skill} at={i + 1} stage={revealStage}>
                <div className={i === at ? 'ww-loops__name ww-loops__name--on' : 'ww-loops__name'}>{item.name}</div>
              </Reveal>
            ))}
          </div>
          {/* the current one, as what it is: a task whose whole brief is «run this skill» */}
          <div key={loop.skill} className="ww-loops__panel ww-jg__arrive">
            <div className="ww-loops__head">
              <span>loop task</span>
              <span>{loop.every}</span>
            </div>
            <div className="ww-loops__brief">
              The method of this task is the skill <code>{loop.skill}</code>. Load it and run it.
            </div>
            <div className="ww-loops__skillhead">SKILL.md, in short</div>
            <div className="ww-loops__prompt">
              {loop.prompt.map((line) => (
                <span key={line}>{line} </span>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  },
  notes:
    'One per click. These are the real loop tasks that look after the system itself — and look at '
    + 'the right side: every one of them is the same thing. The whole brief of the task is one '
    + 'sentence: «the method of this task is the skill so-and-so; load it and run it». A loop is '
    + 'just a skill, started on a schedule. Under it, the skill in four or five sentences. '
    + REPAIR_LOOPS.map((loop, i) => `[${i + 1}] ${loop.name} — in the product it is called «${loop.series}», ${loop.every}. `).join('')
    + 'The checks file what they find as ordinary tasks in the queue; the code, design and skill '
    + 'loops ship their small fix themselves. Honest: the briefs and the skill '
    + 'names are the real ones; the names on the left are simplified for the slide, and the short '
    + 'versions are my cuts of skills that run to hundreds of lines.',
};

/** What a miniapp puts into the queue (Yarik, 22.11.2026: after «miniapps can add a task to
 *  the queue», four real examples in the repair-loops' style). Read off juggernaut at
 *  41f7af0 (21.11.2026): a miniapp never files a task itself — in the same transaction as
 *  my tap it records a LOOP EVENT (`emitLoopEvent`, packages/platform/src/loop-events.ts),
 *  a recurring series waits on that event's key, and the server releases its next
 *  occurrence into the queue; the occurrence carries a «⚡ Запущено подією …» comment.
 *    `event`  — the real key, and what emits it (from the key's own catalogue line)
 *    `series` — the real series title, translated (for the notes)
 *    `skill`  — the real skill that is the series' method (each skill says so of itself)
 *    `prompt` — that skill cut to five sentences of what it DOES; mine, not a quote
 *    `wake`   — the series' real wake rule: the debounce (it runs once that many minutes pass
 *               with no newer event, so a burst of taps is one run) and the fallback date
 *  Read off the live series on 22.11.2026 (Yarik: «онови приклади на основі того як в juggernaut
 *  все реально налаштовано»): the four briefs ARE the one sentence on the card («Метод цієї
 *  задачі — скіл X. Завантаж його і виконуй…», translated, the rest of it cut), the event keys
 *  match, and the cadences are coffee.changed 10 min / no fallback, media.suggestion.answered
 *  2 min / none, coffee.stock.low none / 18 days, books.note_message.added 5 min / 2 days.
 *  All four run on the Claude Code agent. Nine series wait on miniapp events in all (also
 *  supplies, medical documents and three for the family tree). «Купити каву» was woken by its
 *  event that very morning, 22.11.2026 10:13. */
const MINIAPP_LOOPS: { name: string; miniapp: string; event: string; why: string; wake: string; series: string; skill: string; prompt: string[] }[] = [
  {
    name: 'Read a coffee bag off its photos',
    miniapp: 'Coffee',
    event: 'coffee.changed',
    why: 'a bag got a photo',
    wake: 'runs after 10 quiet min',
    series: 'Coffee: recognise the photos and update the taste',
    skill: 'errands:coffee-intake',
    prompt: [
      'Take every bag with unread photos.',
      'Read all its photos as one label: the name on the front, the weight and the roast date on the back.',
      'Fill the card — roaster, origin, process, notes — with only what the bag says, and link it to a coffee already on file instead of a duplicate.',
      'Pick the front as the card\'s cover.',
      'If new verdicts arrived, rewrite the taste profile at the top of the page.',
    ],
  },
  {
    name: 'Recommend the next movie',
    miniapp: 'Movies',
    event: 'media.suggestion.answered',
    why: 'I tapped Add or Not this',
    wake: 'runs after 2 quiet min',
    series: 'Recommend a film / series, and a book / audiobook',
    skill: 'collections:media-recommendations',
    prompt: [
      'Find the categories with an open slot — film, series, book, audiobook.',
      'Read what I added and what I turned down, and why: that is the taste memory.',
      'Propose one title for each open slot, and explain each pick using my own ratings.',
      'Add its outside ratings — IMDb, Rotten Tomatoes, Goodreads.',
      'Report, and wait for my next tap.',
    ],
  },
  {
    name: 'Recommend which coffee to order',
    miniapp: 'Coffee',
    event: 'coffee.stock.low',
    why: 'one bag or none is left at home',
    wake: 'runs at once · else in 18 days',
    series: 'Buy coffee',
    skill: 'errands:funt-coffee-order',
    prompt: [
      'Decide whether to order at all: my newest comment, the stock on the page, my order history.',
      'Put my usual basket into the roaster\'s cart — and coffee for the army, a tenth of the order.',
      'Propose up to two coffees to try next, from my taste profile.',
      'Go as far as checkout and check the total and the delivery point.',
      'Stop before paying — paying is mine — and report.',
    ],
  },
  {
    name: 'Answer my question about a book',
    miniapp: 'Books',
    event: 'books.note_message.added',
    why: 'I asked a question in a book note',
    wake: 'runs after 5 quiet min · else in 2 days',
    series: 'Answer the questions about books',
    skill: 'collections:book-questions',
    prompt: [
      'Read every open question whose newest message is mine.',
      'Answer each one in its own thread, follow-ups included.',
      'No spoilers past where I am in the book.',
      'Read the files on the note when there are any.',
      'Report what was answered.',
    ],
  },
];

export const MiniappLoopsSlide: SlideDefinition = {
  id: 'factory-miniapp-loops',
  title: 'Miniapps put tasks into the queue',
  maxRevealStages: MINIAPP_LOOPS.length,
  initialRevealStage: 1,
  content: ({ revealStage }) => {
    const at = Math.min(Math.max(revealStage, 1), MINIAPP_LOOPS.length) - 1;
    const loop = MINIAPP_LOOPS[at];
    return (
      <>
        <CornerRings corner="bottom-left" />
        <div className="ww-loops">
          <div className="ww-loops__list">
            {MINIAPP_LOOPS.map((item, i) => (
              <Reveal key={item.event + item.skill} at={i + 1} stage={revealStage}>
                <div className={i === at ? 'ww-loops__name ww-loops__name--on' : 'ww-loops__name'}>{item.name}</div>
              </Reveal>
            ))}
          </div>
          <div key={loop.skill} className="ww-loops__panel ww-jg__arrive">
            <div className="ww-loops__head">
              <span>loop task · {loop.miniapp}</span>
              <span>⚡ waits for an event</span>
            </div>
            <div className="ww-loops__event">
              <code>{loop.event}</code> — {loop.why}
            </div>
            <div className="ww-loops__wake">{loop.wake}</div>
            <div className="ww-loops__brief">
              The method of this task is the skill <code>{loop.skill}</code>. Load it and run it.
            </div>
            <div className="ww-loops__skillhead">SKILL.md, in short</div>
            <div className="ww-loops__prompt">
              {loop.prompt.map((line) => (
                <span key={line}>{line} </span>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  },
  notes:
    'One per click — what that «Add» button, and taps like it, really do. A miniapp never files a '
    + 'task itself. In the same transaction as my tap it records an EVENT; a '
    + 'loop task is waiting on that event, and the server lets its next run into the queue — the '
    + 'run even says «started by an event». And the run is the same thing as every loop: one '
    + 'sentence that names a skill. '
    + MINIAPP_LOOPS.map((loop, i) => `[${i + 1}] ${loop.name} — on ${loop.miniapp}, when ${loop.why}, the app emits ${loop.event}, which wakes the series «${loop.series}». `).join('')
    + 'So the miniapp is the UI, and the agents are its back office. '
    + 'Under the event, the rule each one waits by: a few quiet minutes, so a burst of taps is one '
    + 'run — and some have a fallback date, so with no event at all the coffee is still checked '
    + 'after 18 days. Nine series in my queue wait on a miniapp like this. '
    + 'Honest: the events, the wait rules, the series, the briefs and the skills are the real ones '
    + '(titles and briefs translated); the short versions are my cuts of much longer skills.',
};

/** «How everyone imagines a software factory» — the picture people have in their heads,
 *  full bleed, before the philosophy slide answers it (Yarik, 17.11.2026: «додай зображення
 *  завода форда і підпис»). The photo (his pick of six): the body of a Model T
 *  lowered down a ramp onto its chassis outside the Highland Park plant, 1913 — Wikimedia
 *  Commons, «AssemblyLine.jpg», from the US National Archives, public domain. Same
 *  `ww-ready` treatment as the other full-bleed slides. */
export const FordFactorySlide: SlideDefinition = {
  id: 'factory-ford',
  content: (
    <div className="ww-ready">
      <img
        className="ww-ready__img ww-ready__img--low"
        src={fordLine}
        alt="Ford, Highland Park, 1913: a Model T body is lowered down a ramp onto its chassis"
      />
      <div className="ww-ready__title" role="heading" aria-level={2}>
        How everyone imagines a software factory
      </div>
    </div>
  ),
  notes:
    'How everyone imagines a software factory. Ford, Highland Park, 1913: a chassis rolls '
    + 'up, a body slides down the ramp onto it, and the next one is already behind — a line, and a '
    + 'person at every station doing one small thing. Swap the people for agents and you have the '
    + 'picture in most heads. Hold it for a moment: what we just walked through '
    + 'does not look like this. (Photo: Ford assembly line, 1913, public domain.)',
};
