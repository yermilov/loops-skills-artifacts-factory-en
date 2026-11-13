import { ReactNode } from 'react';

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
 *   - a task page: the title, «ID», a tinted card of fields (status, priority,
 *     assignee, model), then a timeline of comments hung on a rail, the agent's
 *     own tagged «SESSION REPORT», a proposal with ACCEPT / REJECT.
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

const NAV: { section: string; items: { name: string; icon: IconName }[] }[] = [
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
      { name: 'Threat forecast', icon: 'alert' },
    ],
  },
];

/** The app: the sidebar of pages, and whatever the page is. `lit` marks several
 *  sidebar rows at once — the pages slide lights the ones it is showing. */
export function App({ active, lit = [], children }: { active: string; lit?: string[]; children: ReactNode }) {
  return (
    <div className="ww-jg">
      <aside className="ww-jg__nav">
        <div className="ww-jg__me">
          <span className="ww-jg__avatar">Y</span>
          <span>
            <span className="ww-jg__name">Yaroslav</span>
            <span className="ww-jg__label">you@myclaw.app</span>
          </span>
        </div>
        {NAV.map((group) => (
          <div key={group.section} className="ww-jg__navgroup">
            <span className="ww-jg__label">{group.section}</span>
            {group.items.map((item) => (
              <span
                key={item.name}
                className={`ww-jg__navitem${item.name === active ? ' ww-jg__navitem--on' : ''}${
                  lit.includes(item.name) ? ' ww-jg__navitem--lit' : ''
                }`}
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
 *  «+ NEW TASK» button and the view switch. */
export function TaskBar({ view, filters }: { view: 'Inbox' | 'Board' | 'Loop'; filters?: ReactNode }) {
  return (
    <div className="ww-jg__bar">
      <span className="ww-jg__filters">{filters}</span>
      <span className="ww-jg__new">+ New task</span>
      <span className="ww-jg__switch">
        {(['Inbox', 'Board', 'Loop'] as const).map((name) => (
          <span key={name} className={name === view ? 'ww-jg__switch--on' : undefined}>
            {name}
          </span>
        ))}
      </span>
    </div>
  );
}

/* ─── Tasks ───────────────────────────────────────────────────────────────── */

export type Status = 'todo' | 'doing' | 'plan' | 'input' | 'done';
export const STATUS: Record<Status, string> = {
  todo: 'Todo',
  doing: 'In progress',
  plan: 'Plan review',
  input: 'Needs your input',
  done: 'Done',
};
/** Who has the task: me, or one of the agents (an agent is violet — the app's
 *  «AI actor» hue — and always carries its name, never the colour alone). */
export type Who = '@me' | 'My Claude Code' | 'My Codex CLI';
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

/** One entry of a task's timeline: the author on the rail, the card beside it. */
export function Comment({
  who,
  tag,
  when,
  kind = 'note',
  children,
}: {
  who: Who;
  tag?: string;
  when: string;
  kind?: 'note' | 'proposal';
  children: ReactNode;
}) {
  return (
    <div className="ww-jg__entry">
      <span className={`ww-jg__railmark${who === '@me' ? '' : ' ww-jg__railmark--agent'}`} aria-hidden="true">
        {who === '@me' ? 'Y' : ''}
      </span>
      <div className={`ww-jg__comment${kind === 'proposal' ? ' ww-jg__comment--proposal' : ''}`}>
        <span className="ww-jg__commenthead">
          <span className="ww-jg__label ww-jg__label--ink">{who === '@me' ? 'Yaroslav' : who}</span>
          {tag && <span className={`ww-jg__label ww-jg__label--${kind === 'proposal' ? 'time' : 'agent'}`}>{tag}</span>}
          <span className="ww-jg__label ww-jg__when">{when}</span>
        </span>
        {children}
      </div>
    </div>
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
