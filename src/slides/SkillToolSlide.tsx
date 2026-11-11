import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';
import { buildPlay, CARD_LEFT, CtxPlay, type PlayCard, type PlayTurn } from '../components/ctxPlay';

/**
 * How a skill reaches the model — in the context-sheet language of the agent,
 * MCP and CLAUDE.md scenes (components/ctxPlay.tsx), played in one go:
 *
 *  · the harness drops the system prompt, and among its tools there is one
 *    more: Skill;
 *  · it reads the skills folder (a card, top left, in your ink — you wrote
 *    them) and puts every skill's DESCRIPTION onto the sheet — only that;
 *  · you type a task; the model, reading the sheet, matches it to a
 *    description and calls the Skill tool;
 *  · the harness loads that skill's SKILL.md and drops its body onto the sheet;
 *  · the model reads on and starts with step 1 of the process.
 *
 * Simplified for the stage: in Claude Code the skill list is in the Skill
 * tool's own description, and invoking it injects the SKILL.md body; the shape
 * — descriptions up front, body only on demand — is exactly this. The listing has
 * a budget (1% of the context window): past it, Claude Code keeps every name but
 * drops the descriptions of the least-used skills first.
 */

const CARDS: PlayCard[] = [{ name: '.claude/skills', via: '3 skills', icon: 'file', ink: 'user', box: CARD_LEFT }];

const SCENE: PlayTurn[] = [
  { who: 'harness', label: 'System:', text: 'You are Claude Code. Tools: Read, Edit, Bash, Skill.' },
  {
    who: 'harness',
    label: 'Skills:',
    // Descriptions follow revenge-of-the-skill, slide 18: open with an action verb,
    // then «TRIGGER when:» and the words a user would actually type.
    // One skill a line (¶ = line break in ctxPlay).
    text: '¶ development-process — Run the dev process for a change. TRIGGER when: starting any coding task ¶ deploy-checklist — Validate a release. TRIGGER when: cutting a release ¶ quit-vim — Escape a stuck vim. TRIGGER when: trapped in vim',
    from: 0,
    ask: 'read the descriptions',
    carry: 'descriptions',
  },
  { who: 'user', label: 'User:', text: 'add priorities to the tasks' },
  {
    who: 'model',
    label: 'Assistant:',
    text: '<|tool_call|> Skill(development-process) <|end_call|>',
    call: 'Skill(development-process)',
    card: 0,
  },
  {
    who: 'harness',
    label: 'Tool:',
    text: '# Development process · 1. Plan — approval first · 2. Implement · 3. Look back · 4. Undeniable proof · … · 9. Test on prod',
    from: 0,
    ask: 'load SKILL.md',
    carry: 'development-process/SKILL.md',
  },
  { who: 'model', label: 'Assistant:', text: '1 · Plan: priority is an enum — high, medium, low. OK?' },
];

const PLAY = buildPlay(SCENE);

export const SkillToolSlide: SlideDefinition = {
  id: 'skill-tool',
  content: () => (
    <>
      <CornerRings corner="top-right" />
      <div className="ww-ctxstage">
        <CtxPlay scene={SCENE} cards={CARDS} play={PLAY} />
      </div>
    </>
  ),
  notes:
    'How does the agent find the skill without my reminder? Same sheet as before. It plays by itself, '
    + 'about twenty seconds. The harness drops the system prompt — and there is one more tool: Skill. '
    + 'Then it reads the skills folder and writes onto the sheet every skill\'s DESCRIPTION — only the '
    + 'description, one line each; that is why I can have dozens of them. (With hundreds, the listing hits '
    + 'its budget and Claude Code drops the descriptions of the skills I use least — so keep them short.) '
    + 'I type a task. The model '
    + 'reads the sheet, sees that «TRIGGER when: starting any coding task» matches, and calls the Skill '
    + 'tool. The harness loads that one SKILL.md and drops its body onto the sheet — and the model '
    + 'starts with step one. Nobody reminded it: the description did. That is why the description is '
    + 'the most important line of a skill. '
    + 'Fine print if asked: in Claude Code the list sits inside the Skill tool\'s own description, and '
    + 'calling it injects the SKILL.md body — same shape: descriptions up front, body on demand.',
};
