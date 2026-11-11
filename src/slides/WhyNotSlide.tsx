import { useEffect, useState } from 'react';
import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';

/**
 * Why the thing on the previous slide was not the assistant — one frame, no
 * title: he says «why it did not work» out loud. A kanban board: tickets land
 * in To do every 0.7 s and one gets done every 5 s, so the backlog only grows —
 * and the last ticket in, «proactive agent», is the one this talk is about.
 *
 * The ticket list is not invented: every one of them is a real round of work in
 * plun's history (github.com/yermilov/plun) — see the slide's notes.
 */

type Kind = 'story' | 'bug' | 'task';

/** Everything the harness turned out to need, in the order it was needed — as
 *  the tickets they became. */
const BACKLOG: { kind: Kind; title: string }[] = [
  { kind: 'story', title: 'streaming' },
  { kind: 'story', title: 'thinking blocks' },
  { kind: 'bug', title: '…and their order' },
  { kind: 'story', title: 'images' },
  { kind: 'story', title: 'resuming a conversation' },
  { kind: 'task', title: 'the chat UI itself' },
  { kind: 'story', title: 'a bubble per tool' },
  { kind: 'task', title: 'the CLI inside Docker' },
  { kind: 'bug', title: 'finding its session files' },
  { kind: 'bug', title: 'new event types' },
  { kind: 'story', title: 'permission prompts' },
  { kind: 'task', title: 'subscriptions and rate limits' },
  { kind: 'story', title: 'more than one agent at once' },
  { kind: 'story', title: 'proactive agent' },
];

const GLYPH: Record<Kind, string> = { story: '★', bug: '●', task: '✓' };

const EXPORT_MODE =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('export') === '1';
const TICK_MS = 100;
/** A new ticket lands in To do this often… */
const ADD_MS = 700;
/** …and one is finished only this often — the whole joke is the ratio. There
 *  is always exactly one in progress: the next is picked when the last is done. */
const WORK_MS = 5000;
const FIRST_ADD_MS = 400;
const FIRST_PICK_MS = 3000;

/** The board's clock, from the moment the slide opens. In export mode it jumps
 *  to «a while later». */
function useClock(): number {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (EXPORT_MODE) {
      setT(25_000);
      return;
    }
    const id = setInterval(() => setT((v) => v + TICK_MS), TICK_MS);
    return () => clearInterval(id);
  }, []);
  return t;
}

/** Which column every ticket is in at time t: they arrive in order, and are
 *  worked oldest-first, one at a time. */
function boardAt(t: number) {
  const added = t < FIRST_ADD_MS ? 0 : Math.min(BACKLOG.length, Math.floor((t - FIRST_ADD_MS) / ADD_MS) + 1);
  const finished = t < FIRST_PICK_MS ? 0 : Math.min(added, Math.floor((t - FIRST_PICK_MS) / WORK_MS));
  const picked = t < FIRST_PICK_MS ? 0 : Math.min(added, finished + 1);
  const ids = BACKLOG.map((_, i) => i);
  return {
    // newest on top, the way a backlog grows
    todo: ids.slice(picked, added).reverse(),
    doing: ids.slice(finished, picked),
    done: ids.slice(0, finished).reverse(),
  };
}

function Ticket({ i }: { i: number }) {
  const t = BACKLOG[i];
  return (
    <div className="ww-why__ticket">
      <span className={`ww-why__kind ww-why__kind--${t.kind}`}>{GLYPH[t.kind]}</span>
      <span className="ww-why__title">{t.title}</span>
    </div>
  );
}

function Board() {
  const cols = boardAt(useClock());
  const columns: { name: string; ids: number[]; tone: string }[] = [
    { name: 'To do', ids: cols.todo, tone: 'todo' },
    { name: 'In progress', ids: cols.doing, tone: 'doing' },
    { name: 'Done', ids: cols.done, tone: 'done' },
  ];
  return (
    <div className="ww-why__board">
      {columns.map((c) => (
        <div key={c.name} className={`ww-why__col ww-why__col--${c.tone}`}>
          <div className="ww-why__colhead">
            <span>{c.name}</span>
            <span className="ww-why__count">{c.ids.length}</span>
          </div>
          <div className="ww-why__cards">
            {/* keyed by column + id, so a ticket that moves plays its entrance again */}
            {c.ids.map((i) => (
              <Ticket key={`${c.tone}-${i}`} i={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export const WhyNotSlide: SlideDefinition = {
  id: 'why-not',
  content: () => (
    <>
      <CornerRings corner="bottom-left" />
      <div className="ww-why">
        <div className="ww-why__body">
          <h3 className="ww-why__head">
            You don’t have time to build an assistant because you are building a harness
          </h3>
          <Board />
        </div>
      </div>
    </>
  ),
  notes:
    'No title — open with it: why did it not work? '
    + 'Watch the board while you talk: To do fills up far faster than anything '
    + 'moves to In progress, let alone Done. You do not have time to build the assistant, '
    + 'because you are busy building the harness. Every week Claude Code grew something, and every week the window around it had '
    + 'to grow the same thing: streaming, thinking blocks and then their ORDER (five commits in '
    + 'one day on ordering alone), images three separate times, resuming a conversation and then '
    + 'a whole day hunting where the CLI writes its session files inside Docker, a bubble for '
    + 'every new tool, and in March 2026 a new event type that leaked into the UI. The numbers '
    + 'If the number helps: 246 commits touch the chat, 87 of them in December 2025 — but it is '
    + 'in your mouth, not on the slide. '
    + 'Two of the tickets are not from plun and I should not claim they are: subscriptions and '
    + 'rate limits, and running more than one agent at once. In plun neither was ever built — '
    + 'the only trace is a March 2026 fix to stop a new rate_limit_event from leaking into the '
    + 'UI. Both became real later, in myclaw, where usage resets and per-agent limits are '
    + 'tracked and agents are throttled by priority. They belong on this list because they are '
    + 'what a harness has to deal with, not because I solved them here. '
    + 'Be honest about the permissions one: in plun I never built it — I set '
    + 'permissionMode: bypassPermissions on day one and took Edit and Write away instead. That '
    + 'is the reason in miniature: the SDK hands you the model\'s loop, and everything a '
    + 'terminal did for free is now yours to write — so the safety net is the first thing that '
    + 'does not get written. '
    + 'And the newest ticket, on top of To do, is «proactive agent» — last in the queue, so it '
    + 'is never picked up. After all that work, it still only moves while somebody is typing at it. The '
    + 'whole rest of this talk is that ticket: something that decides what to do, does it '
    + 'while I sleep, and reports back.',
};
