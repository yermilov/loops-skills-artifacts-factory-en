import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Window } from './Chrome';
import { PAPER, SANS, typedFor } from './theme';
import {
  T,
  CWD,
  Scrollback,
  Prompt,
  Step,
  FirstSession,
  PermissionBox,
  NO_OPTION,
} from './claudeTerminal';

/**
 * The second beat of the SAME session: MCP hands Claude Code somebody else's
 * API — here GitHub — and what it asks permission for is no longer «run this
 * command» but «use this tool», one rule per tool.
 *
 * It opens on the exact frame ClaudeCodeFirst ends on: same window, same
 * scrollback, the first session rendered by the very same components (see
 * FirstSession in claudeTerminal.tsx), so the reveal is a continuation rather
 * than a cut. No fade in for the same reason.
 *
 * MEASURED off @anthropic-ai/claude-code@1.0.0 (22.05.2025): the `/mcp` panel
 * («MCP Server Status», «• github: connected», connected bold in the success
 * colour), the permission box titled «Tool use» holding
 * `server:tool(args) (MCP)` with « (MCP)» in the secondary colour, «Do you
 * want to proceed?», and the three options — the second one naming the tool
 * and the cwd, «commands» and all. RECONSTRUCTION: the session, the repo and
 * the issue numbers are invented.
 */

const SLASH = '/mcp';
const ASK = 'now open a PR for this and link the issue it closes';

const B = {
  hold: 26, /* the last frame of the previous clip, held */
  slash: 0,
  panel: 0,
  ask: 0,
  assist1: 0,
  box1: 0,
  move1: 0,
  done1: 0,
  out1: 0,
  assist2: 0,
  box2: 0,
  move2: 0,
  done2: 0,
  out2: 0,
  closing: 0,
};
B.slash = B.hold;
B.panel = B.slash + typedFor(SLASH) + 12;
B.ask = B.panel + 42;
B.assist1 = B.ask + typedFor(ASK) + 14;
B.box1 = B.assist1 + 16;
B.move1 = B.box1 + 34; /* the pointer walks down to «don't ask again» */
B.done1 = B.move1 + 24;
B.out1 = B.done1 + 10;
B.assist2 = B.out1 + 28;
B.box2 = B.assist2 + 16;
B.move2 = B.box2 + 32;
B.done2 = B.move2 + 22;
B.out2 = B.done2 + 10;
B.closing = B.out2 + 26;

export const GITHUB_MCP_FRAMES = B.closing + 80;

function toolOptions(tool: string) {
  return ['Yes', `Yes, and don't ask again for ${tool} commands in ${CWD}`, NO_OPTION];
}

function ToolBody({ call, description }: { call: string; description: string }) {
  return (
    <>
      <div>
        {call}
        <span style={{ color: T.dim }}> (MCP)</span>
      </div>
      <div style={{ color: T.dim }}>{description}</div>
    </>
  );
}

function McpCall({ tool }: { tool: string }) {
  return (
    <>
      {tool}
      <span style={{ color: T.dim }}> (MCP)</span>
    </>
  );
}

export const GithubMcp = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: PAPER, fontFamily: SANS }}>
      <Window title="my-shop — claude" background={T.bg}>
        <Scrollback>
          <FirstSession frame={frame} />

          {frame >= B.slash && <Prompt text={SLASH} frame={frame} at={B.slash} />}
          {frame >= B.panel && (
            <div style={{ margin: '14px 0 4px' }}>
              <div>MCP Server Status</div>
              <div style={{ marginTop: 14 }}>
                • github: <span style={{ color: T.success, fontWeight: 700 }}>connected</span>
              </div>
            </div>
          )}

          {frame >= B.ask && <Prompt text={ASK} frame={frame} at={B.ask} />}

          {frame >= B.assist1 && <Step head="Let me see what is open on the repo." />}
          {frame >= B.box1 && frame < B.done1 && (
            <PermissionBox
              frame={frame}
              at={B.box1}
              title="Tool use"
              body={
                <ToolBody
                  call={'github:list_issues(repo: "my-shop", state: "open")'}
                  description="List open issues on the repository"
                />
              }
              question="Do you want to proceed?"
              options={toolOptions('github:list_issues')}
              chosen={frame >= B.move1 ? 1 : 0}
            />
          )}
          {frame >= B.out1 && (
            <Step
              head={<McpCall tool="github:list_issues" />}
              out={
                <>
                  <span style={{ color: T.text }}>#42</span> Cart total ignores VAT ·{' '}
                  <span style={{ color: T.text }}>#51</span> Flaky checkout test
                </>
              }
            />
          )}

          {frame >= B.assist2 && <Step head="#42 is the one. Opening the PR against main." />}
          {frame >= B.box2 && frame < B.done2 && (
            <PermissionBox
              frame={frame}
              at={B.box2}
              title="Tool use"
              body={
                <ToolBody
                  call={'github:create_pull_request(head: "fix/vat", base: "main")'}
                  description="Create a pull request"
                />
              }
              question="Do you want to proceed?"
              options={toolOptions('github:create_pull_request')}
              chosen={frame >= B.move2 ? 1 : 0}
            />
          )}
          {frame >= B.out2 && (
            <Step
              head={<McpCall tool="github:create_pull_request" />}
              out={
                <>
                  opened <span style={{ color: T.text }}>#57</span> «Add VAT to cart totals» ·
                  closes #42
                </>
              }
            />
          )}
          {frame >= B.closing && <Step head="PR #57 is open and linked to issue #42." />}
        </Scrollback>
      </Window>
    </AbsoluteFill>
  );
};
