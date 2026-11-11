import type { ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';
import { CodeBlock } from '../components/CodeBlock';
import { Code, Emphasis } from '../components/SlideElements';

/**
 * «A skill is a unit of knowledge» — the answer to the Memento question, built on
 * the skill-directory slide of the earlier talk (revenge-of-the-skill, slide 17:
 * a directory tree that grows in lockstep with the bullets, zooming into SKILL.md
 * on the beat that is about the file).
 *
 * The specimen is not a toy here: it is the development process from two slides
 * back, packaged as a skill — so «how do I make it always work like this?» gets
 * its answer on screen. The inline-command beats of the original are left out;
 * this talk needs the shape, not the full anatomy.
 */

const TREE: { stage: number; label: string; children?: string[] }[] = [
  { stage: 1, label: 'SKILL.md' },
  { stage: 2, label: 'references/', children: ['review.md', 'prod-check.md'] },
  { stage: 3, label: 'scripts/', children: ['verify.sh'] },
];

function tree(stage: number): string {
  const nodes = TREE.filter((n) => stage >= n.stage);
  const lines = ['development-process/'];
  nodes.forEach((node, i) => {
    const last = i === nodes.length - 1;
    lines.push((last ? '└── ' : '├── ') + node.label);
    node.children?.forEach((child, j) => {
      lines.push((last ? '    ' : '│   ') + (j === node.children!.length - 1 ? '└── ' : '├── ') + child);
    });
  });
  return lines.join('\n');
}

/** The SKILL.md beat zooms from the tree into the file itself. How the model gets
 *  to it (descriptions in the system prompt, the Skill tool) is the next slide. */
const FILE_STAGE = 1;

// No `name:` — it defaults to the directory name, so the example leaves it out.
// Quoted, so the colon in «TRIGGER when:» stays text (unquoted, the frontmatter does
// not parse, and Claude Code then loads the skill with no description at all); the
// line break inside the quotes folds into a space.
const SKILL_MD = `---
description: "Run the dev process for a change.
  TRIGGER when: starting any coding task."
---
# Development process
1. Plan — approval first
2. Implement
3. Look back — what can be simplified?
4. Undeniable proof it works
5. Run the checks
6. Read references/review.md when reviewing
7. Commit and push
8. Launch scripts/verify.sh when deployed
9. Read references/prod-check.md when on prod`;

/** On the references/ and scripts/ beats, under the tree: the SKILL.md lines that
 *  point at them — the «read X when Y» and «run this» in the file itself. */
const POINTERS: Record<number, string> = {
  2: `6. Read references/review.md when reviewing
9. Read references/prod-check.md when on prod`,
  3: `8. Launch scripts/verify.sh when deployed`,
};

/** One bullet per beat; the newest three stay on screen (sliding window). */
const BULLETS: ReactNode[] = [
  <>
    a skill is a <Emphasis color="magenta">directory</Emphasis> that packages a unit of knowledge
  </>,
  <>
    <Code>SKILL.md</Code> is the <Emphasis color="magenta">only required file</Emphasis> — it should have a
    description and text
  </>,
  <>
    <Code>references/</Code> — extra knowledge, read only when the instructions say{' '}
    <Emphasis color="magenta">read X when Y</Emphasis>
  </>,
  <>
    <Code>scripts/</Code> — deterministic automation: only its <Emphasis color="magenta">output</Emphasis>{' '}
    comes back into context, never the code
  </>,
];
const WINDOW = 3;

/** On the SKILL.md beat, next to the file: what makes its description good —
 *  revenge-of-the-skill, slide 18 («frontmatter — identity & activation»). */
const DESCRIPTION_TIPS: ReactNode[] = [
  <>what the skill does + <Emphasis color="magenta">when</Emphasis> to use it</>,
  <>open with an action verb — <Code>Run…</Code>, <Code>Validate…</Code></>,
  <>add <Code>TRIGGER when:</Code> + the words users type</>,
  <>≤ 1024 chars — it is <Emphasis color="magenta">all the model sees</Emphasis> at startup</>,
];

/** The slide is split around the Skill-tool scene: `from` is the beat this part
 *  starts on, so the second part picks up where the first left off. */
function unitSlide(id: string, from: number, count: number, notes: string): SlideDefinition {
  return {
    id,
    title: 'Skill — a unit of knowledge',
    maxRevealStages: count - 1,
    content: ({ revealStage }) => {
      const stage = from + revealStage;
      const first = Math.max(0, stage - WINDOW + 1);
      return (
        <>
          <CornerRings corner="bottom-right" />
          <div className="ww-skillunit">
            <div className="ww-skillunit__specimen">
              {stage === FILE_STAGE ? (
                <CodeBlock language="markdown" filename="development-process/SKILL.md" code={SKILL_MD} />
              ) : (
                <>
                  <CodeBlock language="bash" filename="tree .claude/skills/development-process" code={tree(stage)} />
                  {POINTERS[stage] && (
                    <div className="ww-skillunit__pointer reveal-in">
                      <CodeBlock language="markdown" filename="in SKILL.md" code={POINTERS[stage]} />
                    </div>
                  )}
                </>
              )}
            </div>
            {stage === FILE_STAGE ? (
              // the file beat: its bullet, then how to write the line that matters most
              <div className="ww-skillunit__notes reveal-in">
                <ul>
                  <li>{BULLETS[FILE_STAGE]}</li>
                </ul>
                <h3 className="ww-skillunit__tipshead">a good description</h3>
                <ul className="ww-skillunit__tips">
                  {DESCRIPTION_TIPS.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <ul className="ww-skillunit__notes">
                {BULLETS.map((b, i) =>
                  i <= stage && i >= first ? (
                    <li key={i} className={i === stage ? 'reveal-in' : undefined}>
                      {b}
                    </li>
                  ) : null,
                )}
              </ul>
            )}
          </div>
        </>
      );
    },
    notes,
  };
}

/** Beats 1–2: the directory, then SKILL.md. */
export const SkillUnitSlide = unitSlide(
  'skill-unit',
  0,
  2,
  'The answer: you do not remind it — you give it a skill. A skill is a unit of knowledge, and on '
    + 'disk it is just a directory — here, the process from two slides back, packaged as one. '
    + '[reveal] SKILL.md is the only required file, and it should have two things: a description up '
    + 'top, then the text — the instructions, here the nine steps. (The name is optional: it defaults '
    + 'to the directory name.) And the description is the line that '
    + 'matters most: say what it does AND when to use it, open with a verb, add «TRIGGER when:» with '
    + 'the words people actually type, keep it under 1024 characters — because at startup it is all the '
    + 'model sees. How does the model get from there to the steps? Next.',
);

/** After the Skill-tool scene: what else a skill directory can carry — one beat
 *  each, every one followed by its own scene (SkillFilesSlide.tsx). */
export const SkillUnitRefsSlide = unitSlide(
  'skill-unit-refs',
  2,
  1,
  'Back to the directory. references/ — extra knowledge it reads only when the instructions say so: '
    + 'read the review file when you are reviewing. Watch it happen.',
);

export const SkillUnitScriptsSlide = unitSlide(
  'skill-unit-scripts',
  3,
  1,
  'scripts/ — deterministic automation: launch the verify script when deployed. Only the output comes '
    + 'back into context, never the code. Watch.',
);
