import { SlideDefinition } from '../types/slides';
import { CornerRings, Reveal, Stat } from '../components/wawtech';

/**
 * The other way out of the previous slide: you CAN build the whole harness
 * yourself — if you are Peter Steinberger. Three beats: the evidence, the
 * joke, and the sting.
 *
 * Every figure is sourced, and the notes say which ones are somebody else's
 * number rather than his own claim:
 *   228 repos — github.com/steipete, read off the profile
 *   6,600 commits in January — Lex Fridman's figure, said to him on the
 *     podcast; he neither confirms nor denies it
 *   4–10 agents in parallel, «mostly a diff viewer» — his own words, same
 *     transcript (lexfridman.com/peter-steinberger-transcript)
 *   one hour — his own: «I built this in one hour», WhatsApp wired to the
 *     Claude Code CLI with -p
 *   the rename chain and its dates — en.wikipedia.org/wiki/OpenClaw
 *   «Models and agent harnesses … are plugins» — the OpenClaw README
 */

const NAMES = [
  { name: 'Warelay', when: '24 Nov 2025' },
  { name: 'CLAWDIS', when: '3 Dec 2025' },
  { name: 'Clawdbot', when: '2 Jan 2026' },
  { name: 'Moltbot', when: '27 Jan 2026' },
  { name: 'OpenClaw', when: '30 Jan 2026' },
];

export const GigachadSlide: SlideDefinition = {
  id: 'gigachad',
  title: (
    <>
      Unless you are <span className="ww-llm__titlesub">Peter Steinberger</span>
    </>
  ),
  maxRevealStages: 4,
  initialRevealStage: 1,
  content: ({ revealStage }) => (
    <>
      <CornerRings corner="bottom-left" />
      <div className="ww-chad">
        <div className="ww-chad__stats">
          <Stat value="1 h" label="to wire WhatsApp to the Claude Code CLI" />
          <Stat value="6,600" label="commits in one January" />
          <Stat value="4–10" label="agents running at once" />
          <Stat value="228" label="repos on his GitHub" />
        </div>

        <Reveal at={2} stage={revealStage}>
          <div className="ww-chad__names">
            {NAMES.map((entry, i) => (
              <span key={entry.name} className="ww-chad__name-wrap">
                <span
                  className={`ww-chad__name${i < NAMES.length - 1 ? ' ww-chad__name--dead' : ' ww-chad__name--live'}`}
                >
                  {entry.name}
                </span>
                <span className="ww-chad__when">{entry.when}</span>
              </span>
            ))}
          </div>
        </Reveal>

        {/* And he solved reason 2 as well — with a clock. */}
        <Reveal at={3} stage={revealStage}>
          <div className="ww-chad__beat">
            <span className="ww-chad__pill">every 30 min</span>
            <p className="ww-chad__sting">
              It does run while you are away: a <em>proactive check</em> wakes up, asks whether
              anything changed, and messages you if it has.
            </p>
          </div>
        </Reveal>

        <Reveal at={4} stage={revealStage}>
          <p className="ww-chad__sting">
            And even he did not rewrite the loop — <em>«models and agent harnesses are plugins
            you can swap»</em>. He wrote everything around it: the part my chat window kept asking
            for.
          </p>
        </Reveal>
      </div>
    </>
  ),
  notes:
    'So yes — you can build the whole harness yourself, if you are built like this. Peter '
    + 'Steinberger, PSPDFKit, now at OpenAI; he wanted the same thing I did, a personal '
    + 'assistant, since April 2025. '
    + 'Beat 1 — the receipts. One hour for the first version, which was literally WhatsApp wired '
    + 'to the Claude Code CLI with -p: the same hack as my slide two back. Then: 4 to 10 agents '
    + 'in parallel, an IDE opened «very, very rarely, mostly a diff viewer», 228 repos, and a '
    + 'whole ecosystem of side tools around agents — CodexBar, agent-scripts, oracle, '
    + 'claude-code-mcp. Say whose number is whose: the 6,600 commits in January is Lex Fridman\'s '
    + 'figure, said to him on the podcast — Peter neither confirms nor denies it; the rest are '
    + 'his own words. And most of it is built by Codex, not Claude Code — he objects to the term '
    + '«vibe coding», he calls what he does agentic engineering. '
    + 'Beat 2 — the joke tells itself: Warelay, CLAWDIS, Clawdbot, Moltbot, OpenClaw. Five names '
    + 'in ten weeks; Moltbot happened because Anthropic\'s lawyers found «Clawdbot» a bit close '
    + 'to Claude. It is now ~394k stars and a foundation, and he is at OpenAI. '
    + 'Beat 3 — and he answered my second reason too, with a clock. The gateway is a daemon, and '
    + 'a «proactive check» is provisioned as an ordinary automation job: it runs every 30 '
    + 'minutes unless the provider says otherwise, in the agent\'s main conversation, waits for '
    + 'it to be idle, and delivers to the owner\'s DM; it returns NO_REPLY when there is nothing '
    + 'to say. There are cron jobs beside it (openclaw automations create, with openclaw cron as '
    + 'an alias) whose output can go to a chat channel, a webhook, or nowhere. Say it before '
    + 'somebody in the room says it for me — and then say the difference: a timer decides when '
    + 'something happens there; here it will be a queue of tasks that agents pick up, do and '
    + 'report on, one by one. (Read off docs.openclaw.ai today; whether the FIRST versions had '
    + 'any of this, I did not confirm — do not claim it.) '
    + 'Beat 4 — the honest part, and the bridge: even he did not rebuild the model\'s loop. '
    + 'Claude, Codex and local models stayed plugins. What he built is everything AROUND them: a '
    + 'gateway that runs as a daemon, channels, memory, skills. Which is exactly the list from '
    + 'the previous slide — he just went and wrote it. The question for the rest of this talk is '
    + 'what you do if you are not going to.',
};
