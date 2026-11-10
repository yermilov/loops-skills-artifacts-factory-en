import { SlideDefinition } from '../types/slides';
import { CodeBlock } from '../components/CodeBlock';
import { CornerRings } from '../components/wawtech';

/**
 * What the first line of that to-do list actually looks like: the Claude Code
 * SDK wired into an app, with the chat window it produces beside it. Code on
 * the left, the result on the right, so the options are not abstract —
 * `allowedTools` IS the line the widget draws a second later.
 *
 * No titles on the frame: he narrates this one.
 *
 * Shortened from the real thing — plun, `apps/web/packages/backend/src`
 * (ClaudeSDKAgent.ts and chat-tools/) as of late November 2025. The option
 * names, the `mcp__server__tool` naming, the preset-plus-append system
 * prompt, `disallowedTools`, `permissionMode` and `resume` are verbatim; the
 * calendar functions and all error handling are cut for the stage.
 */

const TOOLS = `const calendar = createSdkMcpServer({
  name: 'calendar',
  tools: [tool(
    'list_events',
    'What is on the calendar for a day.',
    { date: z.string() },
    async ({ date }) => {
      const events = await gcal.day(date);
      return { content: [{
        type: 'text',
        text: events.map(toLine).join('\\n'),
      }] };
    },
  )],
});`;

const LOOP = `for await (const msg of query({
  prompt: userText,
  options: {
    systemPrompt: {
      type: 'preset',
      preset: 'claude_code',
      append: aboutUser,
    },
    mcpServers: { calendar },
    allowedTools: ['mcp__calendar__list_events'],
    disallowedTools: ['Edit', 'Write'],
    permissionMode: 'bypassPermissions',
    resume: sdkSessionId,
  },
})) {
  send(msg);
}`;

const EVENTS = [
  { at: '10:00', what: 'Standup' },
  { at: '12:00', what: 'Talk — Engineering stage' },
  { at: '17:30', what: 'Kindergarten pickup' },
];

/** The widget that code produces, as the user sees it. */
function ChatWidget({ answered }: { answered: boolean }) {
  return (
    <div className="ww-sdkchat">
      <div className="ww-sdkchat__bar">Chat</div>
      <div className="ww-sdkchat__body">
        <div className="ww-sdkchat__bubble ww-sdkchat__bubble--user">
          what do I have today?
        </div>
        {answered && (
          <>
            <div className="ww-sdkchat__tool">
              <span className="ww-sdkchat__dot">⏺</span> list_events(2026-11-26)
            </div>
            <div className="ww-sdkchat__bubble ww-sdkchat__bubble--bot">
              <p>Three things today:</p>
              <ul>
                {EVENTS.map((event) => (
                  <li key={event.at}>
                    <strong>{event.at}</strong> {event.what}
                  </li>
                ))}
              </ul>
              <p>The morning after standup is free.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export const SdkChatSlide: SlideDefinition = {
  id: 'sdk-chat',
  maxRevealStages: 2,
  initialRevealStage: 1,
  content: ({ revealStage }) => (
    <>
      <CornerRings corner="bottom-right" />
      <div className="ww-sdk">
        <div className="ww-sdk__code">
          <CodeBlock language="typescript" code={revealStage >= 2 ? LOOP : TOOLS} />
        </div>
        <ChatWidget answered={revealStage >= 2} />
      </div>
    </>
  ),
  notes:
    'The first line of that to-do list, for real — and no titles on the slide, so say it: left '
    + 'is the code, right is the window it produces. '
    + 'Beat 1: your own function — read my calendar — declared to the model with a name, one '
    + 'sentence of description and a schema. createSdkMcpServer makes an MCP server that never '
    + 'leaves the process: no URL, no subprocess, the same protocol as the slide before. '
    + 'Beat 2: the loop, and the answer appears on the right. systemPrompt keeps Claude Code\'s '
    + 'own preset and appends who I am — it stays a coding agent that happens to know about me. '
    + 'allowedTools is the whitelist, and it is literally the line the widget draws a second '
    + 'later; disallowedTools stops a chat window from editing the repo it runs in; '
    + 'permissionMode bypassPermissions is the «don\'t ask again» from the Claude Code slide '
    + 'taken to its end, because there is no terminal here to ask in; resume carries the session '
    + 'over, so yesterday\'s conversation is still there. Then you iterate the async generator '
    + 'and stream what comes out. '
    + 'Shortened from plun\'s own backend (ClaudeSDKAgent.ts, chat-tools/), November 2025 — the '
    + 'option names are verbatim, the error handling is cut. And note what this still is NOT: '
    + 'it only runs while someone has that tab open and is typing.',
};
