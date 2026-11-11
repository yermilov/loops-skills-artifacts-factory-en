import { SlideDefinition } from '../types/slides';
import { CodeBlock } from '../components/CodeBlock';
import { CornerRings } from '../components/wawtech';

/**
 * What the first line of that to-do list actually looks like: the Claude Code
 * SDK wired into an app, with the chat window it produces beside it. Code on
 * the left, the result on the right, so the options are not abstract —
 * every answer in the chat is one of the `allowedTools` doing its job.
 *
 * No titles on the frame: he narrates this one.
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
  },
})) {
  if (msg.type === 'assistant') chat.show(msg);
}`;

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
    text: 'One thing: the organisers still need your flight times for the transfer. '
      + 'Want me to draft the reply?',
  },
  { from: 'user', text: 'yes please' },
];

/** The widget that code produces, as the user sees it. */
function ChatWidget() {
  return (
    <div className="ww-sdkchat">
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

export const SdkChatSlide: SlideDefinition = {
  id: 'sdk-chat',
  content: () => (
    <>
      <CornerRings corner="bottom-right" />
      <div className="ww-sdk">
        <div className="ww-sdk__code">
          <CodeBlock language="typescript" code={LOOP} />
        </div>
        <ChatWidget />
      </div>
    </>
  ),
  notes:
    'The first line of that to-do list, for real — and no titles on the slide, so say it: left '
    + 'is the code, right is the window it produces. '
    + 'One call, query: what I typed goes in as prompt, and the for-await loop is the way back — '
    + 'the model\'s replies stream out of it, and each assistant message lands in the chat on '
    + 'the right. systemPrompt is one sentence: you '
    + 'are my AI assistant. mcpServers is everything it can reach — calendar, mail, Slack, '
    + 'Telegram, GitHub, the bank — and allowedTools is the whitelist; every answer in the chat '
    + 'on the right is one of those tools doing its job. permissionMode bypassPermissions is the '
    + '«don\'t ask again» from the Claude Code slide taken to its end, because there is no '
    + 'terminal here to ask in. '
    + 'Schematic, after plun\'s own backend (ClaudeSDKAgent.ts), November 2025 — the option names '
    + 'are the SDK\'s, the lists are illustrative. And note what this still is NOT: it only runs '
    + 'while someone has that tab open and is typing.',
};
