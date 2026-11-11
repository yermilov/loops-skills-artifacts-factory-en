import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';
import { buildPlay, CARD_LEFT, CtxPlay, type PlayCard, type PlayTurn } from '../components/ctxPlay';

/**
 * What that CLAUDE.md the session just wrote actually IS, in two beats, with
 * no title — the file names itself.
 *
 * Beats 1–5 — the structure I recommend, one section per click, each with what
 *          it holds and who writes it: the vision is yours, folders / commands
 *          / architecture you ask the agent for, principles are the handful of
 *          things it keeps getting wrong, each «instead do X and remember it in
 *          CLAUDE.md».
 * Beat 6 — where it goes, played in the context-sheet language of the
 *          coding-agent and MCP slides (components/ctxPlay.tsx): the file sits
 *          on disk as a card in the top-left corner, in your ink — you wrote
 *          it. The harness drops the system prompt and its own line, reads the
 *          file and pastes it onto the sheet; you type a task; the model reads
 *          the whole sheet — your project rules included — and starts working.
 *          The model never sees a file — only that text.
 *
 * The practice comes from the earlier talk (pragmatic-vibe-clauding,
 * «what goes into AGENTS.md?»), condensed to what fits a stage.
 */

const SECTIONS = [
  { name: 'Vision', hint: 'what it is, and what it is not', who: 'you write it' },
  { name: 'Folder structure', hint: 'where things live', who: 'ask agent to write it' },
  { name: 'Build / deploy commands', hint: 'how to run, test, ship', who: 'ask agent to write it' },
  { name: 'Architecture', hint: 'how the parts talk', who: 'ask agent to write it' },
  {
    name: 'Principles',
    hint: '5-6 most fundamental misconceptions agent makes about your project',
    who: '«instead do X and remember it in CLAUDE.md»',
  },
];

/** Beats 1–5 bring in one section each; beat 6 is the paste, played. */
const PROMPT_STAGE = SECTIONS.length + 1;

/** The line the harness puts above the file. */
const PASTE_LINE = 'Here is an important context about the project you are working on:';

const CARDS: PlayCard[] = [{ name: 'CLAUDE.md', via: '~/src/my-shop', icon: 'file', ink: 'user', box: CARD_LEFT }];

const PASTE: PlayTurn[] = [
  { who: 'harness', label: 'System:', text: 'You are Claude Code. Tools: Read, Edit, Bash.' },
  { who: 'harness', label: '', text: PASTE_LINE },
  {
    who: 'harness',
    label: '',
    text: SECTIONS.map((x) => `## ${x.name}`).join(' '),
    from: 0,
    ask: 'read CLAUDE.md',
    carry: 'CLAUDE.md',
  },
  { who: 'user', label: 'User:', text: 'fix the VAT bug in cart.ts' },
  { who: 'model', label: 'Assistant:', text: '<|tool_call|> Read(cart.ts) <|end_call|>', call: 'Read(cart.ts)' },
];

const PLAY = buildPlay(PASTE);

/** The file, one section a click (beats 1–5). */
function ClaudeMd({ shown = SECTIONS.length }: { shown?: number }) {
  return (
    <div className="ww-cmd__card">
      <div className="ww-cmd__name"># CLAUDE.md</div>
      <div className="ww-cmd__sections">
        {SECTIONS.map((s, i) => (
          <div key={s.name} className={`ww-cmd__section${i < shown ? '' : ' ww-cmd__section--hidden'}`}>
            <div className="ww-cmd__head">
              <span className="ww-cmd__hash">##</span>
              <span className="ww-cmd__sname">{s.name}</span>
              <span className="ww-cmd__who">{s.who}</span>
            </div>
            <div className="ww-cmd__hint">{s.hint}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Beats 1–5: the file alone, one section a click. Beat 6: the paste, played. */
function Scene({ stage }: { stage: number }) {
  if (stage >= PROMPT_STAGE) {
    return (
      <div className="ww-ctxstage">
        <CtxPlay scene={PASTE} cards={CARDS} play={PLAY} />
      </div>
    );
  }
  return (
    <div className="ww-cmd">
      <div className="ww-cmd__layer">
        <ClaudeMd shown={stage} />
      </div>
    </div>
  );
}

export const ClaudeMdSlide: SlideDefinition = {
  id: 'claude-md',
  maxRevealStages: PROMPT_STAGE,
  initialRevealStage: 1,
  content: ({ revealStage }) => (
    <>
      <CornerRings corner="top-right" />
      <Scene stage={revealStage} />
    </>
  ),
  notes:
    'The session just wrote a CLAUDE.md. Here is what goes in it, and what it really is. '
    + 'Beats 1 to 5 — the structure I recommend, one section a click. Vision: write it yourself, it '
    + 'is the one part only you know. Folder structure, build and deploy commands, architecture: '
    + 'ask the agent to write them, it reads the repo better than you remember it. Principles: '
    + 'the five or six most fundamental misconceptions the agent has about your project, each '
    + 'written as «instead do X» — when it keeps making the same mistake, do not fix the output, '
    + 'say «instead do X and remember it in CLAUDE.md». The next run already '
    + 'knows. '
    + 'Beat 6 — and it is not magic. It plays by itself, about fifteen seconds. The same sheet as '
    + 'before: the harness drops the system prompt and a line of its own — «here is an important '
    + 'context» — then reads CLAUDE.md off disk, top left, and pastes it in. You type the task. The '
    + 'model reads the whole sheet, your rules included, and starts working. It never sees a file; '
    + 'by the time it reads anything, your project rules are already in its text. '
    + 'Then the practice, said rather than shown: it is to the agent what README.md is to a '
    + 'person; it is re-read on every run, which is why it needs no memory; one per subfolder in '
    + 'a monorepo; and it is committed to git, so the whole team ships the same agent, not just '
    + 'the same code. The file is CLAUDE.md because this is Claude Code; it is AGENTS.md for the '
    + 'tools that read that one.',
};
