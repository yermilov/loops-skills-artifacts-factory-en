import { useEffect, useRef, useState } from 'react';
import rough from 'roughjs';
import { SlideDefinition } from '../types/slides';
import { CornerRings, Reveal } from '../components/wawtech';
import gigachad from '../assets/history/gigachad-steipete.jpg';

/**
 * The other way out of the previous slide: you CAN build the whole harness
 * yourself — if you are Peter Steinberger. One picture, one sentence, and the
 * rename chain as the only reveal: each click strikes the current name out in
 * red — the line draws itself — and writes the next one above it. The click
 * after OpenClaw swaps the meme for a diagram of the ecosystem he built under
 * it; the next adds the category it started — the shelf of assistants you can
 * now just install.
 *
 * The picture is generated (Codex image_gen, gpt-image-2, 10.11.2026) from his
 * gym photo in @AiBreakfast's post of 16.02.2026 — «OpenClaw creator @steipete is
 * the literal "Ok Claude, make a $1B company, make no mistakes" gigachad meme»
 * (x.com/AiBreakfast/status/2023202725329351050). The rename chain and its
 * dates: en.wikipedia.org/wiki/OpenClaw.
 */

/** The names the sentence ends on, one per beat. */
const NAMES = ['Clawdbot', 'Moltbot', 'OpenClaw'];

/** roughjs needs a colour value, and raw colours live in tokens.css only. */
function token(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

/**
 * A name being crossed off: a hand-drawn red line that DRAWS itself across the
 * word, the way you strike a name out on paper. The line is measured from the
 * word it covers (the span's own box), so it fits whatever the type does.
 *
 * The drawing is a CSS animation on `stroke-dashoffset`, and the END state is
 * the default — export mode kills every animation (`:root[data-export='1']`),
 * so a PDF page gets the finished line rather than an empty one.
 */
function Strike({ seed }: { seed: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);

  // The parent span's size, after layout: the line is drawn in those pixels.
  useEffect(() => {
    const svg = ref.current;
    const host = svg?.parentElement;
    if (!svg || !host) return;
    const measure = () => setBox({ w: host.offsetWidth, h: host.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const svg = ref.current;
    if (!svg || !box) return;
    svg.replaceChildren();
    const red = token('--ww-strike-red', '#e01b3c');
    const rc = rough.svg(svg);
    // Slightly past the word on both sides and a touch off level — a struck-out
    // word is never covered edge to edge, and never quite horizontal.
    const y = box.h * 0.56;
    const node = rc.line(-6, y + 3, box.w + 7, y - 3, {
      stroke: red,
      strokeWidth: 4,
      roughness: 1.6,
      bowing: 1.4,
      seed,
    });
    // roughjs draws a stroke as two passes; dash both so the whole line grows.
    node.querySelectorAll('path').forEach((path, i) => {
      path.setAttribute('pathLength', '1');
      path.style.animationDelay = `${i * 90}ms`;
    });
    svg.appendChild(node);
  }, [box, seed]);

  return (
    <svg
      ref={ref}
      className="ww-chad__strike"
      viewBox={box ? `0 0 ${box.w} ${box.h}` : undefined}
      aria-hidden="true"
    />
  );
}

/** What OpenClaw left behind, shown with its last name: a shelf of assistants
 *  you install instead of build. Sources (folded in from the old «It started a
 *  category» slide): Hermes Agent — Nous Research, MIT, Feb 2026
 *  (github.com/NousResearch/hermes-agent); Instinct — Spear Street Technology,
 *  invite-only through 2026; Muse — Meta, 8 Sep 2026 (techcrunch.com, cnbc.com);
 *  Claude Duet — Anthropic; Dots — OpenAI. The last two are Yarik's own (11.11.2026)
 *  and carry no citation yet. Only the best-known five; no figures on purpose,
 *  the listicles disagree about all of them. */
const CATEGORY = ['Hermes Agent', 'Instinct', 'Muse', 'Claude Duet', 'OpenAI Dots'];

/** The ecosystem under the gateway, as bundled skills on 03.01.2026 — the day
 *  after the Clawdbot rename (openclaw/openclaw @ 412e8b3, skills/). Every tool
 *  here is his own repo (github.com/steipete, several since moved to the openclaw
 *  org), most created Nov–Dec 2025. Tailscale is the one that is NOT his: the
 *  gateway drives `tailscale serve` / `funnel` (docs/tailscale.md). */
const ECOSYSTEM: { label: string; tools: string[] }[] = [
  // left: how it reaches you, and the house
  { label: 'talks & speaks', tools: ['wacli', 'imsg', 'bird', 'sag'] },
  { label: 'runs the home', tools: ['eightctl', 'sonoscli', 'blucli', 'spogo', 'ordercli'] },
  // right: what it can read, and what it can see
  { label: 'reads & thinks', tools: ['gog', 'summarize', 'oracle', 'mcporter', 'goplaces'] },
  { label: 'sees', tools: ['Peekaboo', 'camsnap', 'songsee', 'gifgrep'] },
];

const DIAGRAM_STAGE = NAMES.length + 1;
const CATEGORY_STAGE = NAMES.length + 2;

/** Hub and four clusters: the gateway in the middle, his CLIs around it. */
function Ecosystem() {
  const group = (g: (typeof ECOSYSTEM)[number]) => (
    <div key={g.label} className="ww-eco__group">
      <span className="ww-eco__label">{g.label}</span>
      <div className="ww-eco__tools">
        {g.tools.map((t) => (
          <span key={t} className="ww-eco__tool">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
  return (
    <div className="ww-eco">
      <div className="ww-eco__side ww-eco__side--left">{ECOSYSTEM.slice(0, 2).map(group)}</div>
      <div className="ww-eco__hub">
        <span className="ww-eco__hubname">Clawdbot</span>
        <span className="ww-eco__hubsub">gateway</span>
        <span className="ww-eco__tool ww-eco__tool--core">coding-agent</span>
        <span className="ww-eco__via">via Tailscale</span>
      </div>
      <div className="ww-eco__side ww-eco__side--right">{ECOSYSTEM.slice(2).map(group)}</div>
    </div>
  );
}

export const GigachadSlide: SlideDefinition = {
  id: 'gigachad',
  title: (
    <>
      Unless you are <span className="ww-llm__titlesub">Peter Steinberger</span>
    </>
  ),
  maxRevealStages: CATEGORY_STAGE,
  initialRevealStage: 1,
  content: ({ revealStage }) => {
    const shown = Math.min(revealStage, NAMES.length);
    return (
      <>
        <CornerRings corner="bottom-left" />
        <div className="ww-chad">
          {/* the meme and the diagram share one cell, so the swap does not move the text */}
          <div className="ww-chad__left">
            <img
              className={`ww-chad__img${revealStage >= DIAGRAM_STAGE ? ' ww-chad__swap--out' : ''}`}
              src={gigachad}
              alt="Peter Steinberger as the Gigachad meme, at a laptop among terminal screens"
            />
            <div className={`ww-chad__diagram${revealStage >= DIAGRAM_STAGE ? '' : ' ww-chad__swap--out'}`}>
              <Ecosystem />
            </div>
          </div>
          <div className="ww-chad__text">
            <p className="ww-chad__line">
              Single-handedly (and multi-agently) built a personal-assistant harness —{' '}
              {/* The names stay in the sentence and wrap with it, as if nothing had
                  happened — the only mark of a rename is the red line through it. */}
              {NAMES.slice(0, shown).map((name, i) => {
                const dead = i < shown - 1;
                return (
                  <span
                    key={name}
                    className={`ww-chad__name${dead ? ' ww-chad__name--dead' : ''}`}
                  >
                    {name}
                    {dead && <Strike seed={21 + i} />}
                  </span>
                );
              })}
            </p>
            <Reveal at={CATEGORY_STAGE} stage={revealStage}>
              <div className="ww-chad__cat">
                <span className="ww-chad__catlabel">…and started a category</span>
                <div className="ww-chad__chips">
                  {CATEGORY.map((name) => (
                    <span key={name} className="ww-chad__chip">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </>
    );
  },
  notes:
    'So yes — you can build the whole harness yourself, if you are built like this. Peter '
    + 'Steinberger, PSPDFKit, now at OpenAI; he wanted the same thing I did, a personal '
    + 'assistant. The picture is not mine to claim: it is the meme @AiBreakfast made of him in '
    + 'February — «the literal "Ok Claude, make a $1B company, make no mistakes" gigachad» — '
    + 'redrawn from his own gym photo. '
    + 'The receipts, if the room wants them — say whose number is whose: one hour for the first '
    + 'version, WhatsApp wired to the Claude Code CLI with -p (his words); 4 to 10 agents in '
    + 'parallel, the IDE «mostly a diff viewer» (his words); 6,600 commits in one January is Lex '
    + 'Fridman\'s figure, said to him on the podcast — he neither confirms nor denies it; 228 '
    + 'repos on his GitHub, and around OpenClaw a dozen side projects — CodexBar, agent-scripts, '
    + 'oracle, claude-code-mcp. '
    + 'Then the clicks tell the joke: Clawdbot → Moltbot, because Anthropic\'s lawyers found '
    + '«Clawdbot» a bit close to Claude (27 Jan 2026) → OpenClaw three days later. Before '
    + 'Clawdbot it was Warelay and CLAWDIS — five names in ten weeks. '
    + 'And the honest part, the bridge: even he did not rebuild the model\'s loop — «models and '
    + 'agent harnesses are plugins you can swap». He wrote everything AROUND it, which is exactly '
    + 'the backlog from the previous slide. '
    + 'Next click — what «single-handedly» means: the ecosystem under the gateway, as it shipped '
    + 'in early January. Every name around the hub is his own CLI, most written in the six weeks '
    + 'before launch: wacli for WhatsApp, imsg for iMessage, bird for X; gog for Google, '
    + 'summarize, oracle (GPT-5 Pro when the agent is stuck), mcporter for MCP; Peekaboo to see '
    + 'the screen, camsnap for cameras, sag to speak; and the house — Eight Sleep, Sonos, BluOS, '
    + 'Spotify, food delivery, Google Places. The only thing not his is Tailscale, which the '
    + 'gateway configures so you can reach it from your phone. '
    + 'Next click — the category it started: a year ago this was a weekend project, '
    + 'now it is a shelf — you pick one, configure it, use it, no harness to write. Hermes Agent '
    + 'from Nous Research (MIT, February 2026, self-hosted, writes its own skills); Instinct from '
    + 'Spear Street — no app, you text it or ring it, invite-only through 2026; Muse, Meta, 8 '
    + 'September 2026, inside WhatsApp; Claude Duet from Anthropic; and Dots from OpenAI. Behind them a long tail '
    + 'of clones — nanobot, PicoClaw, ZeroClaw, Kimi Claw, Manus — say it, do not show it. No numbers if asked: the listicles contradict each other '
    + 'on stars, funding and dates. '
    + 'The question this sets up: if the shelf exists, why did I keep building? Because none of '
    + 'them is a queue I can throw work into and walk away from.',
};
