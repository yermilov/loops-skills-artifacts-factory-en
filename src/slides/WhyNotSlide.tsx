import { SlideDefinition } from '../types/slides';
import { CornerRings, Reveal } from '../components/wawtech';

/**
 * Why the thing on the previous slide was not the assistant — two reasons,
 * a beat each. Deliberately schematic: the visual is not settled yet, so the
 * slide says the two sentences plainly and keeps the evidence small.
 *
 * The chip list is not invented: every one of them is a real round of work in
 * plun's history (github.com/yermilov/plun) — see the slide's notes.
 */

/** Everything the harness turned out to need, in the order it was needed. */
const CATCH_UP = [
  'streaming',
  'thinking blocks',
  '…and their order',
  'images',
  'resuming a conversation',
  'the chat UI itself',
  'a bubble per tool',
  'the CLI inside Docker',
  'finding its session files',
  'new event types',
  'permission prompts',
  'subscriptions and rate limits',
  'more than one agent at once',
  'and so on',
];

export const WhyNotSlide: SlideDefinition = {
  id: 'why-not',
  title: (
    <>
      Why it did not work <span className="ww-llm__titlesub">— two reasons</span>
    </>
  ),
  maxRevealStages: 2,
  initialRevealStage: 1,
  content: ({ revealStage }) => (
    <>
      <CornerRings corner="bottom-left" />
      <div className="ww-why">
        <div className="ww-why__row">
          <span className="ww-why__num">1</span>
          <div className="ww-why__body">
            <h3 className="ww-why__head">You stop building an assistant and start building a harness</h3>
            <div className="ww-why__chips">
              {CATCH_UP.map((item) => (
                <span key={item} className="ww-why__chip">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <Reveal at={2} stage={revealStage}>
          <div className="ww-why__row">
            <span className="ww-why__num">2</span>
            <div className="ww-why__body">
              <h3 className="ww-why__head">And it only moves while you are typing</h3>
              <div className="ww-why__strip">
                <span className="ww-why__label">you</span>
                <div className="ww-why__track">
                  <span className="ww-why__pulse" style={{ left: '6%' }} />
                  <span className="ww-why__pulse" style={{ left: '34%' }} />
                  <span className="ww-why__pulse" style={{ left: '71%' }} />
                </div>
              </div>
              <div className="ww-why__strip">
                <span className="ww-why__label">it</span>
                <div className="ww-why__track">
                  <span className="ww-why__pulse ww-why__pulse--it" style={{ left: '9%' }} />
                  <span className="ww-why__pulse ww-why__pulse--it" style={{ left: '37%' }} />
                  <span className="ww-why__pulse ww-why__pulse--it" style={{ left: '74%' }} />
                </div>
              </div>
              <p className="ww-why__stat">close the tab and nothing happens, all night</p>
            </div>
          </div>
        </Reveal>
      </div>
    </>
  ),
  notes:
    'Reason 1 — every week Claude Code grew something, and every week the window around it had '
    + 'to grow the same thing: streaming, thinking blocks and then their ORDER (five commits in '
    + 'one day on ordering alone), images three separate times, resuming a conversation and then '
    + 'a whole day hunting where the CLI writes its session files inside Docker, a bubble for '
    + 'every new tool, and in March 2026 a new event type that leaked into the UI. The numbers '
    + 'If the number helps: 246 commits touch the chat, 87 of them in December 2025 — but it is '
    + 'in your mouth, not on the slide. '
    + 'Two of the chips are not from plun and I should not claim they are: subscriptions and '
    + 'rate limits, and running more than one agent at once. In plun neither was ever built — '
    + 'the only trace is a March 2026 fix to stop a new rate_limit_event from leaking into the '
    + 'UI. Both became real later, in juggernaut, where usage resets and per-agent limits are '
    + 'tracked and agents are throttled by priority. They belong on this list because they are '
    + 'what a harness has to deal with, not because I solved them here. '
    + 'Be honest about the permissions one: in plun I never built it — I set '
    + 'permissionMode: bypassPermissions on day one and took Edit and Write away instead. That '
    + 'is the reason in miniature: the SDK hands you the model\'s loop, and everything a '
    + 'terminal did for free is now yours to write — so the safety net is the first thing that '
    + 'does not get written. '
    + 'Reason 2 — and after all that, it still only moves while somebody is typing at it. '
    + 'A chat window is a thing you operate. The whole rest of this talk is about what is '
    + 'missing from that picture: something that decides what to do, does it while I sleep, and '
    + 'reports back.',
};
