import type { ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';
import { CodeBlock } from '../components/CodeBlock';
import { Code } from '../components/SlideElements';

/**
 * «Self-learning system» — DRAFT. The loop from the myclaw session, now with a
 * skill doing the work: the same two columns as «Skill — a unit of knowledge»
 * (SkillUnitSlide.tsx), the do-task SKILL.md on the left growing one step a
 * click, the bullets on the right.
 */

// Frontmatter in the shape the description tips asked for: an action verb, then
// «TRIGGER when:»; quoted, so the colon stays text. Lines ≤ ~47 mono chars (panel width).
const HEAD = `---
description: "Do one task and learn from it.
  TRIGGER when: picking up a task to work on."
---
# Do a task`;

/** In file order; `at` is the step beat it appears on. Reading the previous session
 *  logs comes last: it only makes sense once «upload the session log» is on screen, so
 *  it is inserted on top, the list renumbers, and the new line is bold — no motion,
 *  like every other step here; the bold is what shows it is new. */
const STEPS: { text: string; at: number }[] = [
  { text: 'Read the previous session logs', at: 7 },
  { text: 'Do the task', at: 1 },
  { text: 'Analyze the skills you used', at: 2 },
  { text: 'Suggest changes to them, or new skills', at: 3 },
  { text: 'Commit skill changes to the marketplace', at: 4 },
  { text: 'Attach the session log to the task', at: 5 },
  { text: 'Decide: done, or needs more work', at: 6 },
];

const BULLETS: ReactNode[] = [
  <>
    now let&apos;s create a <Code>do-task</Code> skill
  </>,
  <>
    so the loop becomes <Code>/loop fetch the next task and /do-task</Code>
  </>,
];

/** Beat 0: the skill (frontmatter only); 1: the loop; 2: the steps start, one a beat —
 *  no bullet of their own: the file shows them. */
const STEPS_FROM = 2;

export const SelfLearningSlide: SlideDefinition = {
  id: 'self-learning',
  title: 'Self-learning system',
  maxRevealStages: STEPS_FROM + STEPS.length - 1,
  content: ({ revealStage }) => {
    const shownSteps = Math.max(0, revealStage - STEPS_FROM + 1);
    const visible = STEPS.filter((s) => s.at <= shownSteps);
    const code = [HEAD, ...visible.map((s, i) => `${i + 1}. ${s.text}`)].join('\n');
    // the step that appeared last, after the renumbering, goes bold: it was inserted on top
    const lastAt = Math.max(...STEPS.map((s) => s.at));
    const fresh = shownSteps === lastAt ? [HEAD.split('\n').length + visible.findIndex((s) => s.at === lastAt) + 1] : [];
    const shownBullets = Math.min(BULLETS.length, revealStage + 1);
    return (
      <>
        <CornerRings corner="bottom-right" />
        <div className="ww-skillunit">
          <div className="ww-skillunit__specimen">
            <CodeBlock language="markdown" filename="do-task/SKILL.md" code={code} highlightLines={fresh} />
          </div>
          <ul className="ww-skillunit__notes">
            {BULLETS.slice(0, shownBullets).map((b, i) => (
              <li key={i} className={i === revealStage ? 'reveal-in' : undefined}>
                {b}
              </li>
            ))}
          </ul>
        </div>
      </>
    );
  },
  notes:
    'DRAFT. Now let\'s turn the loop itself into a skill: do-task. [reveal] So the loop becomes: '
    + 'fetch the next task, and /do-task. [reveal] And here is what do-task does. First, do the task. '
    + '[reveal] Then look back at the skills it used — [reveal] and suggest changes to them, or new '
    + 'skills. [reveal] Commit those to the marketplace, so every machine gets them on the next '
    + 'auto-update. [reveal] Upload the session log to the server and attach it to the task. '
    + '[reveal] Decide: is it done, or does it need more work? If it needs more, the task goes back '
    + 'to the queue — [reveal] so one more step goes on top: read the previous session logs, and the '
    + 'next run picks up where this one stopped. Every task makes the skills a bit better — that is '
    + 'the self-learning part.',
};
