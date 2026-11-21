import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';
import { buildPlay, CtxPlay, type PlayCard, type PlayTurn } from '../components/ctxPlay';

/**
 * What «effort» is (Yarik, 22.11.2026: right after the slide that routes tasks by model
 * AND effort), in the context-sheet language of the agent, MCP and skills slides
 * (components/ctxPlay.tsx): the same question, played twice — one click at effort low,
 * one at effort high.
 *
 * What it really is, read off the vendors' docs on 22.11.2026: Anthropic's `effort`
 * (output_config.effort: low · medium · high · xhigh · max; Claude Code's --effort)
 * sets how deeply the model thinks AND its overall token spend — lower effort means
 * less thinking, fewer and more consolidated tool calls, terser replies; it replaced
 * the fixed thinking budget (`budget_tokens`): the model now decides when and how much
 * to think, and effort is how much it is allowed to. OpenAI's `reasoning_effort`
 * (Codex's model_reasoning_effort) is the same knob: how many hidden reasoning tokens
 * the model spends before it answers — billed as output, kept in the context. So on
 * the sheet thinking is what it is: more text the model writes to itself before it
 * acts. The «Thinking:» lines are a picture of that — in the products the raw
 * reasoning is hidden or summarised — and effort itself is a request setting, not
 * text the model reads; the sheet labels it as one.
 *
 * The task is staged; the two runs are written to show the difference, not recorded.
 */

/** No cards: where the files come from is not the point here (Yarik, 22.11.2026). */
const CARDS: PlayCard[] = [];

const ASK = 'why does my inbox show done tasks first?';

const opening = (effort: string): PlayTurn[] => [
  { who: 'harness', label: '', text: 'You are Claude Code. Tools: Read, Edit, Bash.' },
  { who: 'harness', label: '', text: `request setting · effort = ${effort}` },
  { who: 'user', label: 'User:', text: ASK },
];

const read = (file: string, result: string): PlayTurn[] => [
  { who: 'model', label: 'Assistant:', text: `<|tool_call|> Read(${file}) <|end_call|>` },
  { who: 'harness', label: 'Tool:', text: result },
];

/** Low: a line of thinking, one look, an answer — fast, cheap, and half right. */
const LOW: PlayTurn[] = [
  ...opening('low'),
  { who: 'model', label: 'Thinking:', text: 'Sort order. Check the query.' },
  ...read('tasks.ts', 'ORDER BY updated_at DESC'),
  { who: 'model', label: 'Assistant:', text: 'Done tasks were touched last. Sort by status first.' },
];

/** High: it thinks the problem through, checks a second place, and finds the second cause. */
const HIGH: PlayTurn[] = [
  ...opening('high'),
  {
    who: 'model',
    label: 'Thinking:',
    text: 'Done first means something ranks them up. It could be the query, a sort on the client, or how «paused» counts. Start with the query, then the component that draws the list.',
  },
  ...read('tasks.ts', 'ORDER BY updated_at DESC'),
  {
    who: 'model',
    label: 'Thinking:',
    text: 'That explains part of it — but the inbox sorts again in the browser. Fix only the query and nothing changes on screen.',
  },
  ...read('Inbox.tsx', 'tasks.sort(byPriority)'),
  {
    who: 'model',
    label: 'Assistant:',
    text: 'Two causes: the query sorts by last update, and the inbox re-sorts by priority only. Fix both — status, then priority, then age — and add a test.',
  },
];

const PLAYS = [
  { scene: LOW, play: buildPlay(LOW) },
  { scene: HIGH, play: buildPlay(HIGH) },
];

export const EffortSlide: SlideDefinition = {
  id: 'improve-effort',
  maxRevealStages: 1,
  content: ({ revealStage }) => {
    const { scene, play } = PLAYS[Math.min(Math.max(revealStage, 0), 1)];
    return (
      <>
        <CornerRings corner="top-right" />
        <div className="ww-ctxstage">
          <CtxPlay key={revealStage} scene={scene} cards={CARDS} play={play} />
        </div>
      </>
    );
  },
  notes:
    'So what is «effort»? The same sheet as before, the same question, twice — it plays by itself. '
    + 'Effort low: the model writes one line to itself — check the query — reads one file, answers. '
    + 'Fast, cheap, and half right. '
    + '[reveal] Effort high: it thinks the problem through first — the query, a sort in the browser, '
    + 'how paused counts — reads the query, thinks again, checks the second place, and finds the '
    + 'second cause. That is what effort is: a dial for how much the model is encouraged to think — '
    + 'to write to itself on this sheet — before and between its actions. Not a hard cap: the model '
    + 'still decides, the dial tells it how thorough to be. Those thinking tokens are real: they take '
    + 'room in the context and you pay for them like any output, so higher effort is usually slower '
    + 'and dearer, and earns it on hard problems. Anthropic calls it effort — low to max — and at low '
    + 'it also tends to make fewer, bigger tool calls and shorter replies; OpenAI calls it reasoning '
    + 'effort. That is why the runner sets it per task, next to the model: the playlist cover on Codex '
    + 'runs at high effort. '
    + 'Honest: effort is a setting on the request, not text the model reads — the sheet labels it as '
    + 'one — and in the products the raw thinking is hidden or summarised; the two runs are written '
    + 'to show the difference.',
};
