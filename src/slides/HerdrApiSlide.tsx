import { SlideDefinition } from '../types/slides';
import { CornerRings, Reveal } from '../components/wawtech';
import herdrLogo from '../assets/herdr/logo.svg';

/**
 * herdr, introduced before the runner uses it: its mark (from its repository, as on
 * the Herdr window), the line it describes itself with (`herdr --help`, 0.9.1), and
 * the four API commands an agent's life needs, one a click (workspace create and
 * pane split are left out for simplicity — Yarik, 21.11.2026).
 *
 * The commands and flags are read off herdr 0.9.1 (`herdr --help`, `herdr agent`,
 * `herdr pane`, `herdr --skill`); the runner uses workspace create · agent start /
 * prompt / wait, the review slide pane split · agent start / prompt --wait. The
 * explanations are the deck's own words. Each call names its agent («reviewer», as in
 * herdr's own skill), and `agent start` the pane it runs in (an id `pane split` returned). Drawn in herdr's colours (`--hd-*`), the
 * explanations in the deck's.
 */

const COMMANDS = [
  { cmd: 'herdr agent start reviewer --kind codex --pane w1:p2', what: 'Claude Code, Codex or OpenCode in a pane' },
  { cmd: 'herdr agent prompt reviewer "…"', what: 'types the prompt and presses Enter' },
  { cmd: 'herdr agent wait reviewer', what: 'until it is done — or stuck on a question' },
  { cmd: 'herdr agent read reviewer --lines 120', what: 'what is on its screen right now' },
];

export const HerdrApiSlide: SlideDefinition = {
  id: 'herdr-api',
  maxRevealStages: COMMANDS.length,
  content: ({ revealStage }) => (
    <>
      <CornerRings corner="bottom-left" />
      <div className="ww-herdr">
        <div className="ww-herdr__brand">
          <img src={herdrLogo} alt="herdr" />
          <div className="ww-herdr__name">herdr</div>
          <div className="ww-herdr__tagline">terminal workspace manager for AI coding agents</div>
        </div>
        <div className="ww-herdr__api">
          {COMMANDS.map((c, i) => (
            <Reveal key={c.cmd} at={i + 1} stage={revealStage}>
              <div className="ww-herdr__row">
                <code className="ww-herdr__cmd">{c.cmd}</code>
                <div className="ww-herdr__what">{c.what}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </>
  ),
  notes:
    'Before the fix, the tool it is built on. herdr is a terminal multiplexer — like tmux — made '
    + 'for coding agents: it knows which pane runs an agent and whether that agent is working, idle '
    + 'or waiting for you. And everything you can do with the mouse it also has as a command, so a '
    + 'script — or another agent — can drive it. Four of them are all a loop needs. '
    + '[reveal] agent start — Claude Code, Codex or OpenCode in a pane, and it returns only once '
    + 'the agent is ready for input. '
    + '[reveal] agent prompt — it types the prompt and presses Enter, exactly as I would. '
    + '[reveal] agent wait — blocks until the agent is done, or stuck on a question it wants answered. '
    + '[reveal] agent read — what is on its screen, so whoever called it can read the answer. '
    + 'That is the whole API: start, prompt, wait, read. (It also opens workspaces and splits '
    + 'panes — the runner uses those too, they just do not need a slide.) '
    + 'Read off herdr 0.9.1 — its --help and its own agent skill.',
};
