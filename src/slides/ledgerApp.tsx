import { ReactNode } from 'react';
import portrait from '../assets/about/yaroslav.jpg';

/**
 * The assistant's own web app, as the «how do we improve it» slides show it — a
 * RECREATION of the real product's interface (aliased «myclaw» in this deck), not
 * a capture: the real one is full of private data. What is real is the idiom,
 * read off the running app and its design tokens on 13.11.2026:
 *   - «Studio Ledger»: warm paper, ink, Fraunces for titles, DM Sans for prose,
 *     JetBrains Mono in small caps for every label;
 *   - the shell: a sidebar of pages in labelled sections, the task views behind a
 *     «+ NEW TASK» button and an INBOX / BOARD / LOOP switch;
 *   - a task card: a dark bar on its left edge, the title in serif, then one mono
 *     row — status · who has it · priority · age;
 *   - the board's four columns: Todo · In progress · Plan review · Needs your input;
 *   - a task page: the title, «ID», a tinted card of fields in a four-column grid
 *     (status, priority, assignee, created), then a timeline hung on a rail, NEWEST
 *     FIRST: the agent's «SESSION REPORT» is a bordered card that ends in a dashed
 *     rule, a «SESSION LOG →» pill and the run's model · tokens · tools · cost; a
 *     person's comment is plain text on the rail with its images as thumbnails
 *     under it; between them, one-line events («moved in progress → paused»); a
 *     proposal with ACCEPT / REJECT. (Looked at again on 13.11.2026, on his own
 *     task pages.)
 * Every task, name and number in it is invented.
 *
 * It is drawn in the deck's own three type sizes and scaled down as ONE object
 * (`zoom` on `.ww-jg`), so an interface with a dozen small sizes adds none.
 */

/* ─── Icons: a few strokes each, in the manner of the app's own ───────────── */

const ICONS = {
  tasks: 'M8 4h8v3H8z M6 5H5v15h14V5h-1 M9 12l2 2 4-4',
  agents: 'M5 9h14v10H5z M12 5v4 M9 14h.01 M15 14h.01',
  devices: 'M3 5h13v9H3z M18 10h3v9h-3z M7 18h5',
  money: 'M4 6h16v13H4z M4 10h16 M8 14h3',
  supplies: 'M12 3l8 4.5v9L12 21l-8-4.5v-9z M4 7.5l8 4.5 8-4.5 M12 12v9',
  books: 'M4 5h7v14H4z M13 5h7v14h-7z',
  movies: 'M4 9h16v10H4z M4 9l1-4 15 3',
  health: 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z M8 12h2l1-2 2 4 1-2h2',
  nanny: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M9 14a4 4 0 0 0 6 0 M9 10h.01 M15 10h.01',
  coffee: 'M5 9h12v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z M17 11h2a2 2 0 0 1 0 4h-2 M8 3v3 M12 3v3',
  alert: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z M12 9v4 M12 16h.01',
  home: 'M13 3L5 13h6l-1 8 8-10h-6z',
  routes: 'M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M8 17h6a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h6',
  sleep: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',
  sport: 'M3 12h4l3-8 4 16 3-8h4',
  music: 'M9 18V5l11-2v13 M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  tree: 'M12 22v-6 M12 16a5 5 0 0 1-4.5-7.2A4 4 0 0 1 12 3a4 4 0 0 1 4.5 5.8A5 5 0 0 1 12 16z',
  back: 'M19 12H5 M11 6l-6 6 6 6',
  flame: 'M12 21a6 6 0 0 0 6-6c0-4-3-5-3-9-3 1-5 4-5 7-1-1-1.5-2-1.5-3C7 12 6 13.500 6 15a6 6 0 0 0 6 6z',
  clip: 'M8 12l6-6a3 3 0 0 1 4 4l-8 8a5 5 0 0 1-7-7l7-7',
  check: 'M5 12l5 5 9-10',
  cross: 'M6 6l12 12 M18 6L6 18',
  loop: 'M4 9h13l-3-3 M20 15H7l3 3',
} as const;
export type IconName = keyof typeof ICONS;

export function Ico({ name }: { name: IconName }) {
  return (
    <svg className="ww-jg__ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

/* ─── The shell ───────────────────────────────────────────────────────────── */

export type NavGroup = { section: string; items: { name: string; icon: IconName }[] };
const NAV: NavGroup[] = [
  {
    section: 'Tasks & agents',
    items: [
      { name: 'Tasks', icon: 'tasks' },
      { name: 'Agents', icon: 'agents' },
    ],
  },
  {
    section: 'Daily',
    items: [
      { name: 'Money', icon: 'money' },
      { name: 'Supplies', icon: 'supplies' },
      { name: 'Books', icon: 'books' },
      { name: 'Movies', icon: 'movies' },
      { name: 'Health', icon: 'health' },
      { name: 'Coffee', icon: 'coffee' },
    ],
  },
  {
    // the product's own word, and its own section of the sidebar
    section: 'Miniapps',
    items: [
      { name: 'Threat forecast', icon: 'alert' },
      { name: 'Home', icon: 'home' },
    ],
  },
];

/** The app: the sidebar of pages, and whatever the page is. `lit` marks several
 *  sidebar rows at once — the pages slide lights the ones it is showing. `pages`
 *  narrows the sidebar to the pages the story has reached (the deck reveals the
 *  app gradually); a section left with no page is not drawn. `fresh` is the row
 *  that has just been added: it eases in. `nav` replaces the sidebar's groups
 *  outright (the miniapps slide lists them in the order it reveals them) and
 *  `dense` draws its rows small, for a sidebar of fifteen. */
export function App({
  active,
  lit = [],
  pages,
  fresh,
  nav: groups = NAV,
  dense = false,
  children,
}: {
  active: string;
  lit?: string[];
  pages?: string[];
  fresh?: string;
  nav?: NavGroup[];
  dense?: boolean;
  children: ReactNode;
}) {
  const nav = groups.map((group) => ({
    ...group,
    items: pages ? group.items.filter((item) => pages.includes(item.name)) : group.items,
  })).filter((group) => group.items.length > 0);
  return (
    <div className="ww-jg">
      <aside className={`ww-jg__nav${dense ? ' ww-jg__nav--dense' : ''}`}>
        <div className="ww-jg__me">
          <img className="ww-jg__avatar" src={portrait} alt="" />
          <span className="ww-jg__name">Yaroslav Yermilov</span>
        </div>
        {nav.map((group) => (
          <div key={group.section} className="ww-jg__navgroup">
            <span className="ww-jg__label">{group.section}</span>
            {group.items.map((item) => (
              <span
                key={item.name}
                className={`ww-jg__navitem${item.name === active ? ' ww-jg__navitem--on' : ''}${
                  lit.includes(item.name) ? ' ww-jg__navitem--lit' : ''
                }${item.name === fresh ? ' ww-jg__arrive' : ''}`}
              >
                <Ico name={item.icon} />
                {item.name}
              </span>
            ))}
          </div>
        ))}
      </aside>
      <main className="ww-jg__main">{children}</main>
    </div>
  );
}

/** The task views' top bar: filters on the left (the board has them), then the
 *  «+ NEW TASK» button and the view switch — `switcher={false}` leaves the switch
 *  out until the deck has explained the views. */
export function TaskBar({
  view,
  filters,
  switcher = true,
}: {
  view: 'Inbox' | 'Board' | 'Loop';
  filters?: ReactNode;
  switcher?: boolean;
}) {
  return (
    <div className="ww-jg__bar">
      <span className="ww-jg__filters">{filters}</span>
      <span className="ww-jg__new">+ New task</span>
      {switcher && (
        <span className="ww-jg__switch">
          {(['Inbox', 'Board', 'Loop'] as const).map((name) => (
            <span key={name} className={name === view ? 'ww-jg__switch--on' : undefined}>
              {name}
            </span>
          ))}
        </span>
      )}
    </div>
  );
}

/* ─── Tasks ───────────────────────────────────────────────────────────────── */

export type Status = 'todo' | 'doing' | 'plan' | 'input' | 'paused' | 'blocked' | 'done';
export const STATUS: Record<Status, string> = {
  todo: 'Todo',
  doing: 'In progress',
  plan: 'Plan review',
  input: 'Needs your input',
  paused: 'Paused',
  blocked: 'Blocked',
  done: 'Done',
};
/** Who has the task: me, or one of the agents (an agent is violet — the app's
 *  «AI actor» hue — and always carries its name, never the colour alone). */
export type Who = '@me' | 'Claude Code' | 'Codex CLI';
export type Task = { title: string; status: Status; who: Who; high?: boolean; age: string };

export function StatusMark({ status }: { status: Status }) {
  return <span className={`ww-jg__mark ww-jg__mark--${status}`} aria-hidden="true" />;
}

export function WhoMark({ who }: { who: Who }) {
  return (
    <span className={`ww-jg__who${who === '@me' ? '' : ' ww-jg__who--agent'}`}>
      <span className="ww-jg__whodot" aria-hidden="true" />
      {who}
    </span>
  );
}

/** A task card. `withStatus`: the inbox says the status on the card; a board column
 *  already does. */
export function TaskCard({
  task,
  withStatus = false,
  selected = false,
  children,
}: {
  task: Task;
  withStatus?: boolean;
  selected?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className={`ww-jg__card${selected ? ' ww-jg__card--on' : ''}`}>
      <span className="ww-jg__cardtitle">{task.title}</span>
      <span className="ww-jg__meta">
        {withStatus && (
          <span className={`ww-jg__status ww-jg__status--${task.status}`}>
            <StatusMark status={task.status} />
            {STATUS[task.status]}
          </span>
        )}
        <WhoMark who={task.who} />
        {task.high && (
          <span className="ww-jg__high">
            <Ico name="flame" />
            High
          </span>
        )}
        <span className="ww-jg__age">{task.age}</span>
      </span>
      {children}
    </div>
  );
}

/** The tinted card of fields at the top of a task page. */
export function Fields({ fields }: { fields: { label: string; value: string; tone?: 'time' | 'danger' | 'hold' }[] }) {
  return (
    <div className="ww-jg__fields">
      {fields.map((field) => (
        <span key={field.label} className="ww-jg__field">
          <span className="ww-jg__label">{field.label}</span>
          <span className={`ww-jg__pill${field.tone ? ` ww-jg__pill--${field.tone}` : ''}`}>{field.value}</span>
        </span>
      ))}
    </div>
  );
}

/** One entry of a task's timeline: the author on the rail, the card beside it.
 *  `plain`: no card — how the app draws a person's own comment. */
export function Comment({
  who,
  tag,
  when,
  kind = 'note',
  plain = false,
  children,
}: {
  who: Who;
  tag?: string;
  when: string;
  kind?: 'note' | 'proposal';
  plain?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="ww-jg__entry">
      {who === '@me' ? (
        <img className="ww-jg__railmark" src={portrait} alt="" />
      ) : (
        <span className="ww-jg__railmark ww-jg__railmark--agent" aria-hidden="true" />
      )}
      <div
        className={`ww-jg__comment${kind === 'proposal' ? ' ww-jg__comment--proposal' : ''}${
          plain ? ' ww-jg__comment--plain' : ''
        }`}
      >
        <span className="ww-jg__commenthead">
          <span className="ww-jg__label ww-jg__label--ink">{who}</span>
          {tag && <span className={`ww-jg__label ww-jg__label--${kind === 'proposal' ? 'time' : 'agent'}`}>{tag}</span>}
          <span className="ww-jg__label ww-jg__when">{when}</span>
        </span>
        {children}
      </div>
    </div>
  );
}

/** A one-line event between the comments: who moved the task, and where. */
export function Event({ children, when }: { children: ReactNode; when: string }) {
  return (
    <div className="ww-jg__entry ww-jg__event">
      <span className="ww-jg__eventdot" aria-hidden="true" />
      <span className="ww-jg__label">
        {children} <span className="ww-jg__when">{when}</span>
      </span>
    </div>
  );
}

/** An attached image, as the thumbnail the app shows under a comment. */
export function Thumb({ src, alt }: { src: string; alt: string }) {
  return <img className="ww-jg__thumb" src={src} alt={alt} />;
}

/** The foot of a session report: the transcript, and what the run cost. */
export function SessionFoot({ children }: { children: ReactNode }) {
  return (
    <span className="ww-jg__foot">
      <span className="ww-jg__log">Session log →</span>
      <span className="ww-jg__label">{children}</span>
    </span>
  );
}

export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="ww-jg__chip">
      <Ico name="clip" />
      {children}
    </span>
  );
}

/** ACCEPT / REJECT under an agent's proposal. */
export function Verdict() {
  return (
    <span className="ww-jg__verdict">
      <span className="ww-jg__accept">
        <Ico name="check" />
        Accept
      </span>
      <span className="ww-jg__reject">
        <Ico name="cross" />
        Reject
      </span>
    </span>
  );
}
