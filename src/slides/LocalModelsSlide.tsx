/** WRITTEN BY THE MODEL IT IS ABOUT (Yarik, 22.11.2026: «Видали слайди про локальну і
 *  безкоштовні моделі і сформулюй задачу і попроси локальну модель згенерувати слайд про
 *  локальну модель»). Inkling 2 Mini (inkling-2-mini, Ollama 0.40.17, MLX, 100 % GPU, 64k) on the
 *  M3 Pro under `codex exec` with an empty CODEX_HOME, from one brief (the facts of the
 *  agent-ops:local-model run of 21–22.11.2026 + this deck's slide kit), in a throwaway worktree.
 *  Try 1 explored the repo for 83 min and died of a Metal out-of-memory without writing a file;
 *  try 2, told not to explore, wrote this file in 34 min (14:36→15:10Z) and died of the same OOM
 *  on its next step, before running `bun run check` itself (it passes). Left as the model wrote
 *  it, except: {{MINUTES}} filled in, and the last two sentences of the notes (the first try)
 *  are ours. */
import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';
import { RunnerCode } from './improve';

const SETUP: { text: string }[] = [
  { text: '$ brew install ollama' },
  { text: '$ OLLAMA_CONTEXT_LENGTH=65536 \\' },
  { text: '  ollama serve' },
  { text: '$ ollama pull inkling-2-mini   # 20 GB' },
  { text: '# ~/.codex-local/config.toml' },
  { text: 'model_provider = "ollama"' },
  { text: 'model_context_window = 65536' },
  { text: '$ CODEX_HOME=~/.codex-local codex exec \\' },
  { text: '  --oss --local-provider ollama -m \\' },
  { text: '  inkling-2-mini' },
];

export const LocalModelsSlide: SlideDefinition = {
  id: 'improve-local',
  maxRevealStages: 1,
  content: ({ revealStage }) => (
    <>
      <CornerRings corner="top-right" />
      <div className="ww-imp ww-imp--claim">
        <div className="ww-asst__claim ww-asst__claim--almost">
          <span className="ww-asst__verdict">
            <span aria-hidden="true">~</span>
            almost
          </span>
          <span>quality is there, speed is not</span>
        </div>
        <span>written by inkling-2-mini, on this laptop</span>
        <div className="ww-imp__runner ww-imp__runner--full ww-imp__runner--free">
          <div className="ww-imp__runnerleft">
            <RunnerCode code={SETUP} hot={() => false} />
          </div>
          <div className={`ww-imp__grades ${revealStage >= 1 ? 'reveal-in' : 'reveal-hidden'}`}>
            <span>measured 21–22 November</span>
            <div className="ww-imp__grade ww-imp__grade--good">
              <span className="ww-imp__grademark"><span aria-hidden="true">✓</span>good</span>
              <span>3 of 3 correct</span>
            </div>
            <div className="ww-imp__grade ww-imp__grade--bad">
              <span className="ww-imp__grademark"><span aria-hidden="true">✗</span>bad</span>
              <span>41–55× slower than hosted</span>
            </div>
            <div className="ww-imp__grade ww-imp__grade--ok">
              <span className="ww-imp__grademark"><span aria-hidden="true">~</span>ok</span>
              <span>11–15 tokens/s generation</span>
            </div>
            <div className="ww-imp__grade ww-imp__grade--ok">
              <span className="ww-imp__grademark"><span aria-hidden="true">~</span>ok</span>
              <span>130–150 tokens/s reading</span>
            </div>
            <div className="ww-imp__grade ww-imp__grade--bad">
              <span className="ww-imp__grademark"><span aria-hidden="true">✗</span>bad</span>
              <span>0 tokens cached</span>
            </div>
            <div className="ww-imp__grade ww-imp__grade--bad">
              <span className="ww-imp__grademark"><span aria-hidden="true">✗</span>bad</span>
              <span>1.5–4 min per agent step</span>
            </div>
            <div className="ww-imp__grade ww-imp__grade--ok">
              <span className="ww-imp__grademark"><span aria-hidden="true">~</span>ok</span>
              <span>hosted: ~92% cached</span>
            </div>
            <div className="ww-imp__grade ww-imp__grade--bad">
              <span className="ww-imp__grademark"><span aria-hidden="true">✗</span>bad</span>
              <span>GPU OOM with full Codex home</span>
            </div>
            <div className="ww-imp__grade ww-imp__grade--ok">
              <span className="ww-imp__grademark"><span aria-hidden="true">~</span>ok</span>
              <span>needs separate empty Codex home</span>
            </div>
            <div className="ww-imp__grade ww-imp__grade--ok">
              <span className="ww-imp__grademark"><span aria-hidden="true">~</span>ok</span>
              <span>caveat: other agents running</span>
            </div>
            <div className="ww-imp__grade ww-imp__grade--ok">
              <span className="ww-imp__grademark"><span aria-hidden="true">~</span>ok</span>
              <span>experiment, not the daily queue</span>
            </div>
          </div>
        </div>
      </div>
    </>
  ),
  notes: "So, which model does the work? This one runs here, on this laptop. Inkling 2 Mini, about 20 GB of weights, driven by the Codex CLI through Ollama at 100% GPU. The setup: install Ollama, raise the context to 65536 because the default 32k is too small, pull the model, point Codex at a separate, empty home. That home matters: with my normal config — every plugin plus my own MCP server — the first request ran the GPU out of memory. Only the clean home works. [reveal]\n\nNow the numbers, on the same three test tasks my fleet gets. Find a function: 11 min 51 s, correct. Build a table: 17 min 10 s, correct. Fix a bug: 50 min 47 s, correct — 3 of 3. Hosted, the same model answers in 15, 25 and 55 seconds — 41 to 55 times slower. And the killer: zero tokens cached — every step re-sends the whole growing conversation, and the laptop re-reads it: 1.5 to 4 minutes per step. Hosted, ~92% of the input was cached. Honest caveat: other agents were running on the same laptop, swapping.\n\nFine for an experiment on a plane, not for the daily queue, yet. I re-try new local models every few days, as a loop task. And this slide? Inkling wrote it, on this laptop, in 34 minutes. Honest: that was its second try. The first one read my code for over an hour and then ran the GPU out of memory.",
};
