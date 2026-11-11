import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';
import { PREFACE, TOOLS, TURNS, WHO_LABEL } from './CodingAgentSlide';

/**
 * What that CLAUDE.md the session just wrote actually IS, in two beats, with
 * no title — the file names itself.
 *
 * Beats 1–5 — the structure I recommend, one section per click, each with what
 *          it holds and who writes it: the vision is yours, folders / commands
 *          / architecture you ask the agent for, principles are the handful of
 *          things it keeps getting wrong, each «instead do X and remember it in
 *          CLAUDE.md».
 * Beat 6 — where it goes: into the very system prompt the coding-agent slide
 *          showed (its preface and tool declarations are imported from that
 *          slide, so the two can never drift), under one line the harness
 *          adds. The model never sees a file — only that text. The paste is
 *          animated: the file's card flies and shrinks into its slot under the
 *          prompt (a measured FLIP, so it lands exactly where it is laid out).
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

/** Beats 1–5 bring in one section each; beat 6 is the system prompt. */
const PROMPT_STAGE = SECTIONS.length + 1;

/** PDF capture must photograph the landed state, not the flight. */
const EXPORT_MODE =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('export') === '1';

/** The paste, choreographed: the big file's text fades, then its card flies
 *  and shrinks into its slot under the prompt while the prompt fades in; it
 *  lands as the harness's line plus the file. */
const FADE_MS = 250;
const FLY_MS = 850;

/** The line the harness puts above the file. */
const PASTE_LINE = 'Here is an important context about the project you are working on:';

/** The file, once as the structure (beat 1) and once as pasted (beat 2). */
function ClaudeMd({ compact, shown = SECTIONS.length }: { compact: boolean; shown?: number }) {
  return (
    <div className={`ww-cmd__card${compact ? ' ww-cmd__card--pasted' : ''}`}>
      {/* pasted, the harness's own line already says what follows */}
      {!compact && <div className="ww-cmd__name"># CLAUDE.md</div>}
      <div className="ww-cmd__sections">
        {SECTIONS.map((s, i) => (
          <div
            key={s.name}
            className={`ww-cmd__section${i < shown ? '' : ' ww-cmd__section--hidden'}`}
          >
            <div className="ww-cmd__head">
              <span className="ww-cmd__hash">##</span>
              <span className="ww-cmd__sname">{s.name}</span>
              {!compact && <span className="ww-cmd__who">{s.who}</span>}
            </div>
            {!compact && <div className="ww-cmd__hint">{s.hint}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

type Box = { left: number; top: number; width: number; height: number };

/** A rect in the stage's own (unscaled) pixels, relative to `root`. */
function boxOf(el: HTMLElement, root: HTMLElement): Box {
  const r = el.getBoundingClientRect();
  const o = root.getBoundingClientRect();
  const scale = o.width / root.offsetWidth || 1;
  return {
    left: (r.left - o.left) / scale,
    top: (r.top - o.top) / scale,
    width: r.width / scale,
    height: r.height / scale,
  };
}

/** Beats 1–5 show the file alone; on beat 6 the file is pasted into the prompt.
 *  The paste is a FLIP: both cards are laid out where they belong, measured,
 *  and a blank card box travels from the one to the other. */
function Scene({ stage }: { stage: number }) {
  const pasting = stage >= PROMPT_STAGE;
  const root = useRef<HTMLDivElement>(null);
  const big = useRef<HTMLDivElement>(null);
  const slot = useRef<HTMLDivElement>(null);
  // idle → fade (the big file's text goes) → launch (its card is swapped for an
  // identical blank box, at the same place) → fly (the box travels) → done
  const [phase, setPhase] = useState<'idle' | 'fade' | 'launch' | 'fly' | 'done'>(
    EXPORT_MODE ? 'done' : 'idle'
  );
  const [ghost, setGhost] = useState<Box | null>(null);
  const [to, setTo] = useState<Box | null>(null);

  useLayoutEffect(() => {
    if (!pasting) {
      setPhase(EXPORT_MODE ? 'done' : 'idle');
      setGhost(null);
      return;
    }
    if (EXPORT_MODE || !root.current || !big.current || !slot.current) {
      setPhase('done');
      return;
    }
    setGhost(boxOf(big.current, root.current));
    setTo(boxOf(slot.current, root.current));
    setPhase('fade');
    let frame = 0;
    const launch = setTimeout(() => {
      setPhase('launch');
      // two frames, so the box is painted at its start before it moves
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => setPhase('fly'));
      });
    }, FADE_MS);
    const land = setTimeout(() => setPhase('done'), FADE_MS + FLY_MS + 50);
    return () => {
      clearTimeout(launch);
      clearTimeout(land);
      cancelAnimationFrame(frame);
    };
  }, [pasting]);

  const ghostAt = phase === 'fly' && to ? to : ghost;
  const ghostStyle: CSSProperties | undefined = ghostAt
    ? {
        left: ghostAt.left,
        top: ghostAt.top,
        width: ghostAt.width,
        height: ghostAt.height,
        transition: phase === 'fly' ? `all ${FLY_MS}ms var(--ease)` : 'none',
      }
    : undefined;
  // the inserted block's room: none until the card flies, then it opens to
  // exactly the block's height, then lets go
  const wrapStyle: CSSProperties =
    phase === 'done'
      ? {}
      : {
          height: phase === 'fly' && to ? to.height : 0,
          overflow: 'hidden',
          transition: phase === 'fly' ? `height ${FLY_MS}ms var(--ease)` : 'none',
        };
  const bigGone = pasting && (phase === 'launch' || phase === 'fly' || phase === 'done');

  return (
    <div className="ww-cmd" ref={root}>
      {/* the file alone — still laid out on beat 6, so it can be measured, but
          its text fades as soon as the paste starts */}
      <div
        className={`ww-cmd__layer${pasting && phase === 'fade' ? ' ww-cmd__layer--fading' : ''}${
          bigGone ? ' ww-cmd__layer--gone' : ''
        }`}
      >
        <div ref={big}>
          <ClaudeMd compact={false} shown={pasting ? SECTIONS.length : stage} />
        </div>
      </div>

      {pasting && (
        <div className={`ww-cmd__layer ww-cmd__layer--prompt${phase === 'idle' ? ' ww-cmd__layer--waiting' : ''}`}>
          <div className="ww-llm__panel ww-cmd__prompt">
            <div className="ww-llm__script">
              <div className="ww-llm__pre">{PREFACE}</div>
              {/* the same declarations, one line each so the pasted file fits under them */}
              {TOOLS.map((tool) => (
                <div key={tool.call} className="ww-cmd__decl">
                  <span className="ww-llm__pre">{tool.intro}</span>{' '}
                  <span className="ww-agent__call">{tool.call}</span>
                </div>
              ))}
              {/* what the harness inserts: its own line, and the file under it —
                  one block, so the card flies to (and lands as) both. It opens
                  up between the tools and the conversation, pushing the user's
                  message down, as the card arrives. */}
              <div className="ww-cmd__slotwrap" style={wrapStyle}>
                <div ref={slot} className={`ww-cmd__slot${phase === 'done' ? '' : ' ww-cmd__slot--empty'}`}>
                  <div className="ww-llm__pre ww-cmd__pasteline">{PASTE_LINE}</div>
                  <ClaudeMd compact />
                </div>
              </div>
              {/* the conversation, as on the coding-agent slide: the user's first
                  turn is there from the start, the assistant's after the paste */}
              <div className="ww-llm__line">
                <span className="ww-llm__who ww-agent__who--user">{WHO_LABEL.user}</span>{' '}
                <span className="ww-agent__said">{TURNS[0].text}</span>
              </div>
              <div className={`ww-llm__line${phase === 'done' ? '' : ' ww-cmd__slot--empty'}`}>
                <span className="ww-llm__who ww-agent__who--model">{WHO_LABEL.model}</span>{' '}
                <span className="ww-llm__pre">…</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* the travelling card: a blank box from the big file to its slot */}
      {pasting && (phase === 'launch' || phase === 'fly') && ghostStyle && (
        <div className={`ww-cmd__ghost${phase === 'fly' ? ' ww-cmd__ghost--flying' : ''}`} style={ghostStyle} />
      )}
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
    + 'Beat 6 — and it is not magic. This is the system prompt from the coding-agent slide: '
    + '«You are Claude Code», the three tool declarations — and under them the harness reads '
    + 'CLAUDE.md off disk and pastes it in, under a line of its own. The model never sees a file; '
    + 'by the time it reads anything, your project rules are already in its text. '
    + 'Then the practice, said rather than shown: it is to the agent what README.md is to a '
    + 'person; it is re-read on every run, which is why it needs no memory; one per subfolder in '
    + 'a monorepo; and it is committed to git, so the whole team ships the same agent, not just '
    + 'the same code. The file is CLAUDE.md because this is Claude Code; it is AGENTS.md for the '
    + 'tools that read that one.',
};
