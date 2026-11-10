import { useEffect, useState } from 'react';
import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';

/**
 * MCP, in the same room as the two slides before it: the text on the left,
 * the harness and the model in the middle, and — new here — the servers the
 * harness goes out and talks to on the right.
 *
 * The argument: nothing about the model changed again. The harness asks a
 * server what it can do, gets back names and JSON schemas, and writes those
 * into the model's text as more tools. When the model calls one, the harness
 * forwards it to that same server. That is the whole protocol.
 *
 * Read off the specification (modelcontextprotocol.io, revision 2025-06-18),
 * not off memory: the methods really are `tools/list` and `tools/call`, the
 * parameters really are a JSON Schema in `inputSchema`, and the envelope is
 * JSON-RPC 2.0. Two transports: a local process over stdio (the default, and
 * what most installed servers are) and Streamable HTTP for a remote one at a
 * URL like https://example.com/mcp — hence one of each on the slide.
 */

/** PDF capture must photograph the finished state, not a half-typed one. */
const EXPORT_MODE =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('export') === '1';

const TICK_MS = 50;
const TOKEN_MS = 105;

const CALL = '<|tool_call|>';
const END_CALL = '<|end_call|>';
const RESULT = '<|tool_result|>';
const END_RESULT = '<|end_result|>';
const SPECIAL = new Set([CALL, END_CALL, RESULT, END_RESULT]);

/** The two the harness goes out to — one over a URL, one a local process. */
const SERVERS = [
  {
    at: 'https://mcp.github.com/mcp',
    how: 'streamable http',
    tools: [
      { name: 'list_issues', args: 'repo, state' },
      { name: 'create_pull_request', args: 'repo, title, head' },
    ],
  },
  {
    at: '@modelcontextprotocol/server-slack',
    how: 'stdio — a local process',
    tools: [{ name: 'slack_post_message', args: 'channel, text' }],
  },
];

/** The stage each server is asked for its tools on, and the stage its tools
 *  land in the model's text on. */
const ASKED = [2, 4];
const LANDED = [3, 5];

type Who = 'model' | 'harness';
const TURNS: { who: Who; tokens: string[]; runs?: string }[] = [
  {
    who: 'model',
    tokens: [
      CALL,
      'name="github:create_pull_request"',
      'repo="my-shop"',
      'title="Add VAT to cart totals"',
      END_CALL,
    ],
    runs: 'tools/call → https://mcp.github.com/mcp',
  },
  {
    who: 'harness',
    tokens: [RESULT, 'name="github:create_pull_request"', 'opened #57', END_RESULT],
  },
  {
    who: 'model',
    tokens: ['Opened', 'PR', '#57', '—', 'it', 'closes', '#42.'],
  },
];

const FIRST_TURN_STAGE = 6;

const WHO_LABEL: Record<Who, string> = { model: 'Assistant:', harness: 'Harness:' };

/** The scene's only clock, restarted whenever the beat changes. */
function useClock(resetKey: number): number {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (EXPORT_MODE) {
      setT(Number.MAX_SAFE_INTEGER);
      return;
    }
    setT(0);
    const id = setInterval(() => setT((v) => v + TICK_MS), TICK_MS);
    return () => clearInterval(id);
  }, [resetKey]);
  return t;
}

function McpScene({ stage }: { stage: number }) {
  const t = useClock(stage);

  const shownTurns = Math.max(0, stage - FIRST_TURN_STAGE + 1);
  const rows = TURNS.slice(0, shownTurns);
  const liveIndex = rows.length - 1;
  const live = rows[liveIndex];
  // A model line streams; a harness line is pasted whole.
  const liveTokens =
    live && live.who === 'model'
      ? Math.min(live.tokens.length, Math.floor(t / TOKEN_MS))
      : (live?.tokens.length ?? 0);
  const liveWriting = Boolean(live) && liveTokens < (live?.tokens.length ?? 0);

  const harnessAsking = ASKED.findIndex((s) => s === stage);
  const harnessRunning =
    harnessAsking >= 0
      ? `tools/list → ${SERVERS[harnessAsking].at}`
      : live && live.runs && !liveWriting
        ? live.runs
        : null;
  const modelRunning = Boolean(live) && live.who === 'model' && liveWriting;

  return (
    <div className="ww-llm ww-agent ww-mcp">
      {/* The text. Everything the servers hand over ends up here, as more of
          the same tool declarations the harness wrote in itself. */}
      <div className="ww-llm__panel">
        <h3 className="ww-llm__label">What the model is given</h3>
        <div className={`ww-llm__script${stage >= LANDED[1] ? ' ww-agent__script--tail' : ''}`}>
          <div className="ww-llm__pre">You are Claude Code, a coding assistant.</div>
          <div className="ww-agent__decl">
            <div className="ww-llm__pre">Tools, from the harness itself:</div>
            <div className="ww-agent__call">Read · Edit · Bash</div>
          </div>
          {SERVERS.map((server, i) =>
            stage >= LANDED[i] ? (
              <div key={server.at} className="ww-agent__decl ww-mcp__decl">
                <div className="ww-llm__pre">and from {server.at}:</div>
                {server.tools.map((tool) => (
                  <div key={tool.name} className="ww-agent__call ww-mcp__call">
                    {`${CALL} name="${i === 0 ? 'github' : 'slack'}:${tool.name}" ${tool.args
                      .split(', ')
                      .map((a) => `${a}="…"`)
                      .join(' ')} ${END_CALL}`}
                  </div>
                ))}
              </div>
            ) : null
          )}
          {rows.map((turn, i) => {
            const count = i === liveIndex ? liveTokens : turn.tokens.length;
            return (
              <div key={i} className="ww-llm__line">
                <span className={`ww-llm__who ww-agent__who--${turn.who}`}>{WHO_LABEL[turn.who]}</span>{' '}
                {turn.tokens.slice(0, count).map((token, n) => (
                  <span
                    key={n}
                    className={`ww-llm__token ww-llm__token--${
                      SPECIAL.has(token) ? 'special' : turn.who === 'harness' ? 'pasted' : 'new'
                    }`}
                  >
                    {token}
                  </span>
                ))}
                {i === liveIndex && liveWriting && <span className="ww-llm__caret" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="ww-llm__engine ww-agent__engine">
        <div className={`ww-agent__box ww-agent__box--harness${harnessRunning ? ' is-busy' : ''}`}>
          <span className="ww-agent__box-name">Harness</span>
          <span className="ww-agent__box-state">{harnessRunning ?? 'watching the text'}</span>
        </div>
        <span className="ww-llm__arrow ww-agent__updown" aria-hidden="true">
          ↕
        </span>
        <div className={`ww-agent__box ww-agent__box--model${modelRunning ? ' is-busy' : ''}`}>
          <span className="ww-agent__box-name">Language model</span>
          <span className="ww-agent__box-state">
            {modelRunning ? 'predicting the next token' : 'waiting'}
          </span>
        </div>
      </div>

      {/* The new thing: servers, and what they answer when asked. */}
      <div className="ww-llm__panel ww-llm__panel--out">
        <h3 className="ww-llm__label">MCP servers</h3>
        {stage < ASKED[0] ? (
          <div className="ww-agent__nothing">none — the harness only knows its own three</div>
        ) : (
          <div className="ww-mcp__servers">
            {SERVERS.map((server, i) =>
              stage >= ASKED[i] ? (
                <div key={server.at} className={`ww-mcp__server${stage === ASKED[i] ? ' is-busy' : ''}`}>
                  <div className="ww-mcp__url">{server.at}</div>
                  <div className="ww-mcp__how">{server.how}</div>
                  <div className="ww-mcp__rpc">→ {'{"method":"tools/list"}'}</div>
                  <div className="ww-mcp__rpc ww-mcp__rpc--in">← tools:</div>
                  {server.tools.map((tool) => (
                    <div key={tool.name} className="ww-mcp__tool">
                      <span className="ww-mcp__toolname">{tool.name}</span>
                      <span className="ww-mcp__toolargs">({tool.args})</span>
                    </div>
                  ))}
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export const McpSlide: SlideDefinition = {
  id: 'mcp-explained',
  title: (
    <>
      MCP <span className="ww-llm__titlesub">— the harness asks for more tools</span>
    </>
  ),
  maxRevealStages: FIRST_TURN_STAGE + TURNS.length - 1,
  initialRevealStage: 1,
  content: ({ revealStage }) => (
    <>
      <CornerRings corner="top-right" />
      <McpScene stage={revealStage} />
    </>
  ),
  notes:
    'Beat 1 — the same text as the slide before, and the same three tools: Read, Edit, Bash, the '
    + 'ones the harness was built with. '
    + 'Beat 2 — the harness connects to a server and asks it one question: tools/list. '
    + 'Beat 3 — what comes back is names plus a JSON Schema of their parameters, and the harness '
    + 'writes them into the model\'s text as more declarations, exactly like its own three. '
    + 'Beats 4–5 — a second server, and note it is NOT a URL: it is a local process over stdio, '
    + 'which is the default and most of what people actually install. '
    + 'Beats 6–8 — the model calls one of the new tools and cannot tell the difference; the '
    + 'harness turns that into tools/call against that same server and pastes the result back. '
    + 'So: MCP is not a model feature and not an agent feature. It is a way for the harness to '
    + 'find out what a thing can do and how to call it. '
    + 'Accurate as of the 2025-06-18 specification: JSON-RPC 2.0, methods tools/list and '
    + 'tools/call, parameters as JSON Schema in inputSchema, two transports (stdio and streamable '
    + 'HTTP; the 2024 HTTP+SSE transport was replaced in 2025-03-26). Tools are not all of it — '
    + 'there are also resources and prompts — and a server can push '
    + 'notifications/tools/list_changed when its list changes.',
};
