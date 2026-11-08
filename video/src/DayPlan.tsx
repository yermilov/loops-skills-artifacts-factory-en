import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { Window } from './Chrome';
import { PAPER, SANS, typedFor } from './theme';
import { T, Scrollback, Prompt, Step, Welcome } from './claudeTerminal';

/**
 * The terminal leaves the repository. Two MCP servers that have nothing to do
 * with code — Google Calendar and Slack — and the thing it produces is not a
 * commit but a plan for the day.
 *
 * MEASURED: the banner is claude-code 1.0.0's (no «research preview», and
 * «/help for help, /status for your current setup»); the `/mcp` panel and the
 * `server:tool (MCP)` rendering are 1.0.0's too. The tool names are the real
 * ones — `list-events` / `search-events` from the google-calendar MCP server
 * (@cocal/google-calendar-mcp), and `slack_get_channel_history` /
 * `slack_get_thread_replies` from the reference @modelcontextprotocol/
 * server-slack, which prefixes its own tools, hence «slack:slack_…».
 * RECONSTRUCTION: the day, the meetings and the threads are invented.
 */

const HOME = '/Users/yarik';
const SLASH = '/mcp';
const ASK = 'read my calendar and slack, then give me a plan for the day';

const B = {
  slash: 16,
  panel: 0,
  ask: 0,
  assist: 0,
  cal: 0,
  slack1: 0,
  slack2: 0,
  plan: 0,
  rows: 0,
};
B.panel = B.slash + typedFor(SLASH) + 12;
B.ask = B.panel + 44;
B.assist = B.ask + typedFor(ASK) + 14;
B.cal = B.assist + 22;
B.slack1 = B.cal + 30;
B.slack2 = B.slack1 + 26;
B.plan = B.slack2 + 30;
B.rows = B.plan + 14;

const ROW_EVERY = 11;
const PLAN: [string, string][] = [
  ['09:00', 'review PR #57 — 20 min, before standup'],
  ['09:30', 'standup'],
  ['10:00', '#platform: answer the migration question, it has waited two days'],
  ['11:00', '1:1 — bring the rollout numbers, they are in the deck'],
  ['12:30', 'lunch · one line on the hiring thread'],
  ['14:00', 'design review'],
  ['15:30', 'deep work: the VAT rounding bug'],
  ['17:05', 'leave — pickup at 17:30 is a hard stop'],
];

export const DAY_PLAN_FRAMES = B.rows + PLAN.length * ROW_EVERY + 100;

function McpCall({ tool }: { tool: string }) {
  return (
    <>
      {tool}
      <span style={{ color: T.dim }}> (MCP)</span>
    </>
  );
}

export const DayPlan = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' });
  const shown = Math.max(0, Math.ceil((frame - B.rows) / ROW_EVERY));
  return (
    <AbsoluteFill style={{ background: PAPER, fontFamily: SANS, opacity: o }}>
      <Window title="yarik — claude" background={T.bg}>
        <Scrollback>
          <Welcome ga cwd={HOME} />

          {frame >= B.slash && <Prompt text={SLASH} frame={frame} at={B.slash} />}
          {frame >= B.panel && (
            <div style={{ margin: '14px 0 4px' }}>
              <div>MCP Server Status</div>
              <div style={{ marginTop: 14 }}>
                • google-calendar:{' '}
                <span style={{ color: T.success, fontWeight: 700 }}>connected</span>
              </div>
              <div>
                • slack: <span style={{ color: T.success, fontWeight: 700 }}>connected</span>
              </div>
            </div>
          )}

          {frame >= B.ask && <Prompt text={ASK} frame={frame} at={B.ask} />}

          {frame >= B.assist && <Step head="Reading both, then I'll lay the day out." />}

          {frame >= B.cal && (
            <Step
              head={<McpCall tool="google-calendar:list-events" />}
              out={
                <>
                  4 events · 09:30 standup · 11:00 1:1 · 14:00 design review ·{' '}
                  <span style={{ color: T.text }}>17:30 pickup</span>
                </>
              }
            />
          )}
          {frame >= B.slack1 && (
            <Step
              head={<McpCall tool="slack:slack_get_channel_history" />}
              out={
                <>
                  <span style={{ color: T.text }}>#platform</span> — the migration question is
                  still unanswered, 2 days
                </>
              }
            />
          )}
          {frame >= B.slack2 && (
            <Step
              head={<McpCall tool="slack:slack_get_thread_replies" />}
              out={
                <>
                  <span style={{ color: T.text }}>#hiring</span> — they are waiting on your call
                  for the Warsaw role
                </>
              }
            />
          )}

          {frame >= B.plan && (
            <div style={{ margin: '14px 0 0' }}>
              <div>
                <span style={{ color: T.claude }}>⏺ </span>
                Here is the day. The only immovable thing is the pickup.
              </div>
              <div style={{ marginTop: 10, paddingLeft: 34 }}>
                {PLAN.slice(0, shown).map(([time, what]) => (
                  <div key={time}>
                    <span style={{ color: T.success }}>{time}</span>
                    <span style={{ color: T.dim }}>{'  '}</span>
                    {what}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Scrollback>
      </Window>
    </AbsoluteFill>
  );
};
