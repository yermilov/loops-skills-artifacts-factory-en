import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';

/**
 * What that CLAUDE.md the session just wrote actually IS — in the same room
 * as the MCP slide: the text on the left, the harness and the model in the
 * middle, and on the right the thing the harness reaches for.
 *
 * The mechanism is the point: the file is not «read by the model». The
 * harness reads it off disk and pastes it into the text, under a line of its
 * own. Nothing about the model knows the file exists.
 *
 * The practice comes from the earlier talk (pragmatic-vibe-clauding,
 * «what goes into AGENTS.md?»), condensed to what fits a stage.
 */

const SECTIONS = ['Vision', 'Folder structure', 'Build / deploy commands', 'Architecture', 'Principles'];

/** What the harness pastes in, as the model sees it. */
const PREFACE = 'Here is an important context about the project you are working on:';
const FILE = `# CLAUDE.md

## Vision
an agent polls, picks a task up, reports back.

## Commands
pnpm dev · pnpm test · pnpm deploy`;

const PRACTICE = [
  { at: 2, text: 'what README.md is to a person' },
  { at: 3, text: 're-read on every run — no memory needed' },
  { at: 4, text: 'one per subfolder, in a monorepo' },
  { at: 5, text: 'committed to git: the team ships one agent' },
];

export const ClaudeMdSlide: SlideDefinition = {
  id: 'claude-md',
  title: (
    <>
      CLAUDE.md <span className="ww-llm__titlesub">— the file the harness pastes in</span>
    </>
  ),
  maxRevealStages: 5,
  initialRevealStage: 1,
  content: ({ revealStage }) => (
    <>
      <CornerRings corner="top-right" />
      <div className="ww-llm ww-agent ww-cmd">
        {/* What the model is given — the preface, then the whole file. */}
        <div className="ww-llm__panel">
          <h3 className="ww-llm__label">What the model is given</h3>
          <div className="ww-llm__script">
            {revealStage >= 2 ? (
              <>
                <div className="ww-llm__pre">{PREFACE}</div>
                <pre className="ww-cmd__file">{FILE}</pre>
              </>
            ) : (
              <div className="ww-agent__nothing">the system prompt, and nothing of mine in it</div>
            )}
          </div>
        </div>

        <div className="ww-llm__engine ww-agent__engine">
          <div className={`ww-agent__box ww-agent__box--harness${revealStage === 1 ? ' is-busy' : ''}`}>
            <span className="ww-agent__box-name">Harness</span>
            <span className="ww-agent__box-state">
              {revealStage === 1 ? 'read CLAUDE.md' : 'pasted it in'}
            </span>
          </div>
          <span className="ww-llm__arrow ww-agent__updown" aria-hidden="true">
            ↕
          </span>
          <div className="ww-agent__box ww-agent__box--model">
            <span className="ww-agent__box-name">Language model</span>
            <span className="ww-agent__box-state">never sees a file</span>
          </div>
        </div>

        {/* The repository side: the file itself, and what to put in it. */}
        <div className="ww-llm__panel ww-llm__panel--out">
          <h3 className="ww-llm__label">In your repository</h3>
          <div className="ww-cmd__card">
            <div className="ww-cmd__name">CLAUDE.md</div>
            <div className="ww-cmd__sections">
              {SECTIONS.map((section) => (
                <div key={section} className="ww-cmd__section">
                  {section}
                </div>
              ))}
            </div>
          </div>
          <div className="ww-cmd__practice">
            {PRACTICE.map((line) => (
              <div
                key={line.text}
                className={`ww-cmd__line${revealStage >= line.at ? '' : ' ww-cmd__line--hidden'}`}
              >
                {line.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  ),
  notes:
    'The session just wrote a CLAUDE.md. Here is what that file is, and it is not magic. '
    + 'Beat 1 — the harness reads it off disk. The model has no file system and no memory of '
    + 'your project; it only ever gets text. '
    + 'Beat 2 — and this is the whole mechanism: the harness pastes the file into the text under '
    + 'a line of its own — «Here is an important context about the project you are working on» — '
    + 'so by the time the model reads anything, your project rules are already in its context. '
    + 'Beat 3 — it is to the agent what README.md is to a person: the thing that stops every run '
    + 'from starting at zero, and it is re-read on EVERY run, which is why it needs no memory. '
    + 'Beat 4 — one per subfolder if a monorepo wants local rules. '
    + 'Beat 5 — and it is committed to git, which is the part people miss: the whole team then '
    + 'ships the same agent, not just the same code. '
    + 'The trick worth saying out loud: when it keeps making the same mistake, do not fix the '
    + 'output — say «instead do X, and remember that in the Principles section». The next run '
    + 'already knows. Sections that work: Vision (write it yourself), Folder structure, '
    + 'Build/deploy commands and Architecture (ask the agent to write them), Principles (grows '
    + 'by itself). '
    + 'The file name here is CLAUDE.md because this is Claude Code; the same file is AGENTS.md '
    + 'for the tools that read that one.',
};
