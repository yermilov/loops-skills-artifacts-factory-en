import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';

/**
 * SCHEMATIC — the flow after «How do we improve it?», parked as three
 * placeholders so the order is not lost (Yarik, 12.11.2026: «just schematically
 * what we will talk after those slides»). Each one carries a visible DRAFT pill
 * and only the outline he dictated; nothing here is designed or sourced yet.
 *
 *   0. the architecture our system ended up with — a diagram, right after the
 *      herdr slides (added the same night; goes BEFORE the hunters)
 *   1. loop tasks that hunt problems — in logs, sloppy code, performance
 *   2. examples of cool stuff I did with my AI assistant (added the same night)
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

/** The parts the previous slides introduced, in the order they appeared — the
 *  raw material for the diagram, not the diagram. */
const PARTS = [
  'web UI: the board, my queue, artifacts and pages',
  'the task queue (API) — two queues, pacing, model per task',
  'the daemon: a plain loop',
  'herdr: a pane per task',
  'agents: Claude Code, Codex, OpenCode — and they talk',
];

export const ArchitectureSlide: SlideDefinition = {
  id: 'factory-architecture',
  title: 'The architecture we ended up with',
  content: (
    <>
      <CornerRings corner="top-right" />
      <ul>
        {PARTS.map((part) => (
          <li key={part}>{part}</li>
        ))}
      </ul>
      <Draft />
    </>
  ),
  notes:
    'DRAFT — outline only. To draw: the architecture our system ended up with, as ONE diagram — '
    + 'the web UI, the task queue, the daemon, herdr and its panes, the agents. The list on the '
    + 'slide is only the inventory of parts from the previous slides.',
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

export const CoolStuffSlide: SlideDefinition = {
  id: 'factory-cool-stuff',
  title: 'Cool stuff I did with my AI assistant',
  content: (
    <>
      <CornerRings corner="top-right" />
      <ul>
        <li>example one — to be chosen</li>
        <li>example two — to be chosen</li>
        <li>example three — to be chosen</li>
      </ul>
      <Draft />
    </>
  ),
  notes:
    'DRAFT — outline only. Examples of cool stuff I did with my AI assistant: the examples are '
    + 'not chosen yet.',
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
