import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';
import { buildPlay, CARD_LEFT, CtxPlay, type PlayCard, type PlayTurn } from '../components/ctxPlay';

/**
 * The two optional parts of a skill, each played out in the context-sheet language
 * (components/ctxPlay.tsx), right after the beat that introduces it:
 *
 *  · references/ — the loaded SKILL.md says «read X when Y»; at that step the
 *    model calls Read, and only then does the file land on the sheet;
 *  · scripts/ — «launch X when Y»; the model calls Bash, the harness runs the
 *    script, and only its OUTPUT lands on the sheet — never the code.
 *
 * The skill directory is a card in your ink (you wrote it), top left.
 */

const CARDS: PlayCard[] = [{ name: 'the skill', via: 'development-process', icon: 'file', ink: 'user', box: CARD_LEFT }];

const SYSTEM: PlayTurn = { who: 'harness', label: 'System:', text: 'You are Claude Code. Tools: Read, Edit, Bash, Skill.' };

const READ_SCENE: PlayTurn[] = [
  SYSTEM,
  {
    who: 'harness',
    label: 'Skill:',
    text: '# Development process · … · 5. Run the checks · 6. Read references/review.md when reviewing · …',
  },
  {
    who: 'model',
    label: 'Assistant:',
    text: '<|tool_call|> Read(references/review.md) <|end_call|>',
    call: 'Read(references/review.md)',
    card: 0,
  },
  {
    who: 'harness',
    label: 'Tool:',
    text: 'Review checklist · ties ordered by age? · index on every filter? · input validated?',
    from: 0,
    ask: 'read review.md',
    carry: 'references/review.md',
  },
  { who: 'model', label: 'Assistant:', text: '6 · Review: ordered by age ✓ — but there is no index on (status, priority).' },
];

const SCRIPT_SCENE: PlayTurn[] = [
  SYSTEM,
  {
    who: 'harness',
    label: 'Skill:',
    text: '# Development process · … · 7. Commit and push · 8. Launch scripts/verify.sh when deployed · …',
  },
  {
    who: 'model',
    label: 'Assistant:',
    text: '<|tool_call|> Bash(scripts/verify.sh) <|end_call|>',
    call: 'Bash(scripts/verify.sh)',
    card: 0,
  },
  {
    who: 'harness',
    label: 'Tool:',
    text: 'deploy 9e2b7d1 live · /api/healthz ok · migrations 2/2 ✓',
    from: 0,
    ask: 'run verify.sh',
    carry: 'output only',
  },
  { who: 'model', label: 'Assistant:', text: '8 · Deploy verified — on to step 9, test on prod.' },
];

const READ_PLAY = buildPlay(READ_SCENE);
const SCRIPT_PLAY = buildPlay(SCRIPT_SCENE);

export const SkillReadRefSlide: SlideDefinition = {
  id: 'skill-read-ref',
  content: () => (
    <>
      <CornerRings corner="top-right" />
      <div className="ww-ctxstage">
        <CtxPlay scene={READ_SCENE} cards={CARDS} play={READ_PLAY} />
      </div>
    </>
  ),
  notes:
    'Plays by itself. The skill is already on the sheet — and step 6 says: read references/review.md '
    + 'when reviewing. Until now that file was not in the context at all. The model gets to step 6, '
    + 'calls Read, the harness fetches the file from the skill directory and drops it onto the sheet — '
    + 'and the model reviews against it. Knowledge that costs nothing until the moment it is needed.',
};

export const SkillRunScriptSlide: SlideDefinition = {
  id: 'skill-run-script',
  content: () => (
    <>
      <CornerRings corner="top-right" />
      <div className="ww-ctxstage">
        <CtxPlay scene={SCRIPT_SCENE} cards={CARDS} play={SCRIPT_PLAY} />
      </div>
    </>
  ),
  notes:
    'Same thing for a script. Step 8: launch scripts/verify.sh when deployed. The model calls Bash; the '
    + 'harness runs the script — and look at what comes back onto the sheet: only its output, three '
    + 'checks. The code of the script never enters the context. Deterministic, cheap, and the model '
    + 'cannot improvise it.',
};
