import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';
import { buildPlay, CARD_LEFT, CARD_RIGHT, CtxPlay, type PlayCard, type PlayTurn } from '../components/ctxPlay';

/**
 * MCP — in the context-sheet language of the slides around it
 * (components/ctxScene.tsx), played in one go. New on this canvas: two MCP
 * servers, as cards in their own (mint) ink in the top corners — one remote
 * over HTTP, one a local process over stdio.
 *
 *  · the harness drops its own three tools onto the sheet;
 *  · it asks each server one question — tools/list — and writes what comes
 *    back onto the sheet as MORE tools, exactly like its own three (the names
 *    keep the server's ink, so you can see where they came from);
 *  · the user types the task; the model streams a call to one of the NEW
 *    tools, and cannot tell the difference;
 *  · the harness lifts the call, forwards it — tools/call — to that same
 *    server, and drops the server's answer onto the sheet;
 *  · the model answers; only that reaches the user's screen.
 *
 * Read off the specification (modelcontextprotocol.io, revision 2025-06-18),
 * not off memory: the methods really are `tools/list` and `tools/call`, the
 * parameters are a JSON Schema in `inputSchema`, the envelope is JSON-RPC 2.0,
 * and the two transports are stdio (a local process — the default) and
 * Streamable HTTP for a remote server at a URL.
 */

const CARDS: PlayCard[] = [
  { name: 'github', via: 'mcp.github.com', icon: 'remote', ink: 'server', box: CARD_LEFT },
  { name: 'slack', via: 'stdio · local', icon: 'local', ink: 'server', box: CARD_RIGHT },
];

const SCENE: PlayTurn[] = [
  { who: 'harness', label: 'System:', text: 'You are Claude Code. Tools: Read, Edit, Bash.' },
  { who: 'harness', label: 'Tools:', text: 'github:list_issues github:create_pull_request', from: 0 },
  { who: 'harness', label: 'Tools:', text: 'slack:post_message', from: 1 },
  { who: 'user', label: 'User:', text: 'open a PR for the VAT fix' },
  { who: 'model', label: 'Assistant:', text: '<|tool_call|> github:create_pull_request(…) <|end_call|>', call: 'create_pull_request(…)', card: 0 },
  { who: 'harness', label: 'Tool:', text: 'opened PR #57', from: 0, ask: 'tools/call' },
  { who: 'model', label: 'Assistant:', text: 'Opened PR #57 — it closes #42.' },
];

const PLAY = buildPlay(SCENE);

export const McpSlide: SlideDefinition = {
  id: 'mcp',
  content: () => (
    <>
      <CornerRings corner="top-right" />
      <div className="ww-ctxstage">
        <CtxPlay scene={SCENE} cards={CARDS} play={PLAY} />
      </div>
    </>
  ),
  notes:
    'MCP — the harness asks for more tools. It plays by itself, about half a minute; narrate over it. '
    + 'Same sheet, same three writers, and two new things in the corners: MCP servers — github, '
    + 'reached over a URL, and slack, which is just a local process on stdio, the default and most of '
    + 'what people actually install. The harness drops its own three tools, Read, Edit, Bash. Then it '
    + 'asks each server one question — tools/list — and writes what comes back onto the sheet as more '
    + 'tools, exactly like its own three; the green ink is only there so you can see where they came '
    + 'from. You ask for a PR. The model calls one of the new tools and cannot tell the difference. '
    + 'The harness lifts the call and forwards it — tools/call — to that same server, and drops the '
    + 'answer onto the sheet. So: MCP is not a model feature and not an agent feature. It is a way '
    + 'for the harness to find out what a thing can do and how to call it. '
    + 'Accurate as of the 2025-06-18 specification: JSON-RPC 2.0, methods tools/list and tools/call, '
    + 'parameters as JSON Schema in inputSchema, two transports (stdio and streamable HTTP; the 2024 '
    + 'HTTP+SSE transport was replaced in 2025-03-26). Tools are not all of it — there are also '
    + 'resources and prompts — and a server can push notifications/tools/list_changed when its list '
    + 'changes.',
};
