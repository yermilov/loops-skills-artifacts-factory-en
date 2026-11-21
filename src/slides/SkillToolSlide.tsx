import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';
import { buildPlay, firstUserAt, CARD_LEFT, CtxPlay, type PlayCard, type PlayTurn } from '../components/ctxPlay';

/**
 * How a skill reaches the model — in the context-sheet language of the agent,
 * MCP and AGENTS.md scenes (components/ctxPlay.tsx), played in one go:
 *
 *  · the harness drops the system prompt — no special tool for skills;
 *  · it reads the skills folder (a card, top left, in your ink — you wrote
 *    them) and puts every skill's DESCRIPTION onto the sheet — only that — with
 *    one line on how to use one: Read its SKILL.md;
 *  · you type a task; the model, reading the sheet, matches it to a
 *    description and reads that skill's SKILL.md — a plain Read: a skill is a file;
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
  { who: 'harness', label: '', text: 'You are Claude Code. Tools: Read, Edit, Bash.' },
  // One sentence at a time (Yarik, 22.11.2026), so the sheet fills and scrolls line by
  // line: the frame's opening, then the descriptions fetched from the folder — one skill
  // a slab — then how to use one. Descriptions follow revenge-of-the-skill, slide 18:
  // open with an action verb, then «TRIGGER when:» and the words a user would actually type.
  { who: 'harness', label: '', text: 'Here is the list of the skills available to you:' },
  {
    who: 'harness',
    label: '',
    text: 'development-process — Run the dev process for a change. TRIGGER when: starting any coding task',
    from: 0,
    ask: 'read the descriptions',
    carry: 'descriptions',
  },
  { who: 'harness', label: '', text: 'deploy-checklist — Validate a release. TRIGGER when: cutting a release' },
  { who: 'harness', label: '', text: 'quit-vim — Escape a stuck vim. TRIGGER when: trapped in vim' },
  {
    who: 'harness',
    label: '',
    text: 'If you want to use a skill, invoke the Read tool to read the content of its skill-name/SKILL.md file.',
  },
  { who: 'user', label: 'User:', text: 'add priorities to the tasks' },
  {
    who: 'model',
    label: 'Assistant:',
    text: '<|tool_call|> Read(development-process/SKILL.md) <|end_call|>',
    call: 'Read(development-process/SKILL.md)',
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

/** Beat 1 is the harness setting up — its system prompt and the skills' descriptions;
 *  beat 2 starts with your first message (as on the MCP slide). */
const STOPS = [firstUserAt(SCENE, PLAY)];

export const SkillToolSlide: SlideDefinition = {
  id: 'skill-tool',
  maxRevealStages: STOPS.length,
  content: ({ revealStage }) => (
    <>
      <CornerRings corner="top-right" />
      <div className="ww-ctxstage">
        <CtxPlay scene={SCENE} cards={CARDS} play={PLAY} stage={revealStage} stops={STOPS} />
      </div>
    </>
  ),
  notes:
    'How does the agent find the skill without my reminder? Same sheet as before. It plays by itself, '
    + 'in two clicks. The harness drops the system prompt — no special tool for skills. '
    + 'Then it reads the skills folder and writes onto the sheet: here is the list of the skills available '
    + 'to you — every skill\'s DESCRIPTION, only the description, one line each — and if you want to use '
    + 'one, read its SKILL.md; that is why I can have dozens of them. (With hundreds, the listing hits '
    + 'its budget and Claude Code drops the descriptions of the skills I use least — so keep them short.) '
    + '[reveal] I type a task. The model '
    + 'reads the sheet, sees that «TRIGGER when: starting any coding task» matches, and reads that '
    + 'skill\'s SKILL.md — an ordinary Read, a skill is just a file. The harness drops its body onto the '
    + 'sheet — and the model '
    + 'starts with step one. Nobody reminded it: the description did. That is why the description is '
    + 'the most important line of a skill. '
    + 'Fine print if asked: Claude Code does this through its Skill tool — the list sits in that tool\'s '
    + 'description, and calling it injects the SKILL.md body; shown here as a Read because that is all it '
    + 'amounts to — same shape: descriptions up front, body on demand.',
};
