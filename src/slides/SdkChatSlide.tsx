import { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { SlideDefinition } from '../types/slides';
import { CodeBlock } from '../components/CodeBlock';
import { CornerRings } from '../components/wawtech';

/**
 * The plan everybody writes down, and what it looks like in code — one slide,
 * five beats:
 *
 *   0. an empty code panel on the left, the «My AI assistant» to-do list on the
 *      right (Patrick's list from the cartoon — drawn, not the frame: the joke
 *      is the list);
 *   1. «Claude Code SDK» ticked — the whole call appears, greyed out;
 *   2. «right intro prompt» ticked — its line, `systemPrompt`, comes up;
 *   3. «a bunch of connected MCP servers» ticked — the `mcpServers` block comes up;
 *   4. all the code, and the list gives way to the chat window it produces —
 *      every answer in that chat is one of the `allowedTools` doing its job.
 *
 * Schematic, after the real thing — plun, `apps/web/packages/backend/src`
 * (ClaudeSDKAgent.ts) as of late November 2025. `query`, the option names,
 * the `mcp__server__tool` naming and `permissionMode` are the SDK's own; the
 * prompt string and the server and tool lists are illustrative, there to show
 * the shape: one sentence of who it is, and a long list of what it can reach.
 */

const LOOP = `for await (const msg of query({
  prompt: userMessage,
  options: {
    systemPrompt: 'You are my AI assistant.',
    mcpServers: {
      calendar, gmail, slack,
      telegram, github, bank,
    },
    allowedTools: [
      'mcp__calendar__list_events',
      'mcp__gmail__search_threads',
      'mcp__telegram__send_message',
      'mcp__bank__get_balance',
    ],
    permissionMode: 'bypassPermissions',
    allowDangerouslySkipPermissions: true,
  },
})) {
  if (msg.type === 'assistant') chat.show(msg);
}`;

/** The lines each ticked item brings up (1-based, as CodeBlock counts them). */
const PROMPT_LINES = [4];
const MCP_LINES = [5, 6, 7, 8];

/** The list, in its own order; `at` is the beat that ticks it. */
const ITEMS = [
  { text: 'right intro prompt', at: 2 },
  { text: 'a bunch of connected MCP servers', at: 3 },
  { text: 'Claude Code SDK', at: 1 },
];
const CHAT_AT = 4;

/** The conversation, as it reads in the widget — plain text both ways. */
const MESSAGES: { from: 'user' | 'bot'; text: string }[] = [
  { from: 'user', text: 'what do I have today?' },
  {
    from: 'bot',
    text: 'Standup at 10:00, then your talk on the Engineering stage at 12:00. '
      + 'Kindergarten pickup is at 17:30, so leave by 17:05.',
  },
  { from: 'user', text: 'anything urgent in my mail?' },
  {
    from: 'bot',
    text: 'One thing: the organisers still need your train times for the transfer. '
      + 'Want me to draft the reply?',
  },
  { from: 'user', text: 'yes please' },
];

/** roughjs needs a colour value, and raw colours live in tokens.css only. */
function token(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

/** A hand-drawn checkbox, ticked or not. */
function Box({ seed, done }: { seed: number; done: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    svg.replaceChildren();
    const ink = token('--ww-purple', '#3f078d');
    const mark = token('--ww-magenta', '#fc00ab');
    const rc = rough.svg(svg);
    svg.appendChild(rc.rectangle(6, 6, 52, 52, { stroke: ink, strokeWidth: 3, roughness: 2.2, seed }));
    if (done) {
      // Drawn over the box, the way a tick is: it overshoots the top right.
      const tick = rc.linearPath(
        [
          [14, 32],
          [27, 48],
          [56, 4],
        ],
        { stroke: mark, strokeWidth: 5, roughness: 1.8, seed: seed + 1 },
      );
      tick.classList.add('ww-todo__tick');
      svg.appendChild(tick);
    }
  }, [seed, done]);
  return <svg ref={ref} className="ww-todo__box" width="64" height="64" aria-hidden="true" />;
}

/** The wobbly rule under the heading. */
function Underline() {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    svg.replaceChildren();
    const ink = token('--ww-magenta', '#fc00ab');
    const rc = rough.svg(svg);
    svg.appendChild(rc.line(8, 10, 452, 14, { stroke: ink, strokeWidth: 5, roughness: 2.4, seed: 3 }));
  }, []);
  return <svg ref={ref} className="ww-todo__rule" width="460" height="24" aria-hidden="true" />;
}

function TodoList({ stage }: { stage: number }) {
  return (
    <div className="ww-todo__sheet ww-sdk__todo">
      <h2 className="ww-todo__title">My AI assistant</h2>
      <Underline />
      <ul className="ww-todo__list">
        {ITEMS.map((item, i) => (
          <li key={item.text} className="ww-todo__item">
            <Box seed={11 + i * 7} done={stage >= item.at} />
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The widget that code produces, as the user sees it. */
function ChatWidget() {
  return (
    <div className="ww-sdkchat reveal-in">
      <div className="ww-sdkchat__bar">Chat</div>
      <div className="ww-sdkchat__body">
        {MESSAGES.map((m) => (
          <div key={m.text} className={`ww-sdkchat__bubble ww-sdkchat__bubble--${m.from}`}>
            {m.text}
          </div>
        ))}
      </div>
      <div className="ww-sdkchat__input">
        <span>Message…</span>
        <span className="ww-sdkchat__send">↑</span>
      </div>
    </div>
  );
}

/** How a line of the code reads at a beat: hidden, greyed, or itself. */
function lineStyle(stage: number) {
  return (line: number) => {
    if (stage < 1) return { opacity: 0 };
    if (stage >= CHAT_AT) return { transition: 'opacity 400ms' };
    const up = (stage >= 2 && PROMPT_LINES.includes(line)) || (stage >= 3 && MCP_LINES.includes(line));
    return { opacity: up ? 1 : 0.28, transition: 'opacity 400ms' };
  };
}

export const SdkChatSlide: SlideDefinition = {
  id: 'sdk-chat',
  maxRevealStages: CHAT_AT,
  content: ({ revealStage }) => (
    <>
      <CornerRings corner="bottom-right" />
      <div className="ww-sdk">
        <div className="ww-sdk__code">
          <CodeBlock language="typescript" code={LOOP} lineStyle={lineStyle(revealStage)} />
        </div>
        {revealStage >= CHAT_AT ? <ChatWidget /> : <TodoList stage={revealStage} />}
      </div>
    </>
  ),
  notes:
    'The plan everybody writes down — Patrick\'s to-do list: the right intro prompt, a bunch of connected '
    + 'MCP servers, and the SDK. Say it deadpan. Left, an empty file. '
    + '[reveal] Claude Code SDK — tick. One call, query: what I typed goes in as prompt, and the '
    + 'for-await loop is the way back — the model\'s replies stream out of it. '
    + '[reveal] The right intro prompt — tick: systemPrompt is one sentence, you are my AI assistant. '
    + '[reveal] A bunch of connected MCP servers — tick: everything it can reach — calendar, mail, Slack, '
    + 'Telegram, GitHub, the bank. '
    + '[reveal] And that is the whole thing: allowedTools pre-approves the tools it may call without asking, and every answer in the chat '
    + 'is one of those tools doing its job. permissionMode bypassPermissions is the «don\'t ask again» '
    + 'from the Claude Code slide taken to its end, because there is no terminal here to ask in — '
    + 'and the SDK makes you opt into it by name: allowDangerouslySkipPermissions. '
    + 'Everything on the list is done — and it still does nothing on its own: it only runs while '
    + 'someone has that tab open and is typing. Nothing decides WHAT to do, nothing runs while you '
    + 'sleep, nothing reports back, nothing remembers that it already tried. That is the rest of the talk. '
    + 'Schematic, after plun\'s own backend (ClaudeSDKAgent.ts), November 2025 — the option names are '
    + 'the SDK\'s, the lists are illustrative.',
};
