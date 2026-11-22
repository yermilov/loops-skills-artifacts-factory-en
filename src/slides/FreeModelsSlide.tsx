/** WRITTEN BY THE MODEL IT IS ABOUT (Yarik, 22.11.2026: «…і безкоштовну модель на твій вибір
 *  згенерувати слайд про безкоштовні моделі»). nvidia/nemotron-3.5-super-vl:free on OpenRouter
 *  (the free-model-trial ledger's best grade) under `codex exec` with an empty CODEX_HOME, from
 *  one brief (the ledger's grades + this deck's slide kit), in a throwaway worktree: the file in
 *  3 min (13:12→13:15Z), 46 commands, `bun run check` run by itself and passing; 943k input
 *  tokens, 90 % cached, $0. Left as the model wrote it, except: {{MINUTES}} filled in, «the same small task» → «one
 *  small task each» (they were not the same task), and `~` instead of `✓` on the «ok» grade. */
import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';
import { RunnerCode } from './improve';

const SETUP: { text: string }[] = [
  { text: '# ~/.codex/config.toml' },
  { text: '[model_providers.openrouter]' },
  { text: 'name = "OpenRouter"' },
  { text: 'base_url = "https://openrouter.ai/api/v1"' },
  { text: 'wire_api = "responses"' },
  { text: 'env_key = "OPENROUTER_API_KEY"' },
  { text: '' },
  { text: '$ codex -c model_provider="openrouter" \\' },
  { text: '    -c web_search="disabled" \\' },
  { text: '    -m nvidia/nemotron-3.5-super-vl:free' },
];

const MODELS: { text: string; mark: string; kind: 'good' | 'ok' | 'bad' }[] = [
  { text: 'nemotron-3.5-super-vl', mark: 'good', kind: 'good' },
  { text: 'minimax-m3.1-flash', mark: 'good', kind: 'good' },
  { text: 'crouton-alpha', mark: 'good', kind: 'good' },
  { text: 'nemotron-3-nano-omni', mark: 'good', kind: 'good' },
  { text: 'inkling-2-small', mark: 'good', kind: 'good' },
  { text: 'ernie-5.5-flash-preview', mark: 'good', kind: 'good' },
  { text: 'ling-3.2-flash', mark: 'good', kind: 'good' },
  { text: 'nemotron-3.5-lightning', mark: 'ok', kind: 'ok' },
  { text: 'dots-3-note-preview', mark: 'bad', kind: 'bad' },
  { text: 'particle-1', mark: 'bad', kind: 'bad' },
  { text: 'north-mini-code', mark: 'bad', kind: 'bad' },
];

export const FreeModelsSlide: SlideDefinition = {
  id: 'improve-free',
  maxRevealStages: 1,
  content: ({ revealStage }) => (
    <>
      <CornerRings corner="top-right" />
      <div className="ww-imp ww-imp--claim">
        <div className="ww-asst__claim ww-asst__claim--great">
          <span className="ww-asst__verdict">
            <span aria-hidden="true">✓</span>
            bonus
          </span>
          <span>free models do small, checkable chores</span>
        </div>
        <div className="ww-imp__runner ww-imp__runner--full ww-imp__runner--free">
          <div className="ww-imp__runnerleft">
            <RunnerCode code={SETUP} hot={() => false} />
          </div>
          <div className={`ww-imp__grades ${revealStage >= 1 ? 'reveal-in' : 'reveal-hidden'}`}>
            <span>written by nemotron-3.5-super-vl, for free</span>
            {MODELS.map((m, i) => (
              <div key={i} className={`ww-imp__grade ww-imp__grade--${m.kind}`}>
                <span className="ww-imp__grademark">
                  <span aria-hidden="true">{m.kind === 'bad' ? '✕' : m.kind === 'ok' ? '~' : '✓'}</span>{' '}
                  {m.mark}
                </span>
                <span>{m.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  ),
  notes:
    "I run a queue where every task names its own agent, model and effort, so a task that is not worth paid tokens can go to a free model. I point Codex at OpenRouter and run the free nemotron model, with web search disabled because OpenRouter rejects Codex\'s web search tool. [reveal] I gave eleven free models one small task each, with a known answer. Seven solved it cleanly, most in under a minute. One was right but sloppy. Three broke the rules: they wrote outside their folder or tried to commit. So free models are good for small chores I can check, not for real tickets - the one real ticket I sent to a free model never converged. And this slide? Nemotron wrote it, for free, in three minutes.",
};
