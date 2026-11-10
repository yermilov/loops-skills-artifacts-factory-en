import { SlideDefinition } from '../types/slides';
import { Card, CornerRings, Reveal } from '../components/wawtech';

/**
 * What OpenClaw left behind: a product category. A year ago a personal
 * assistant was a weekend project; now you install one.
 *
 * Checked against primary-ish sources rather than the SEO listicles that
 * dominate this search — and the figures those listicles disagree about
 * (Hermes's star count, Instinct's valuation and user numbers) are
 * deliberately NOT on the frame. What is here:
 *   OpenClaw — Peter Steinberger, Nov 2025; now the OpenClaw Foundation
 *     (en.wikipedia.org/wiki/OpenClaw)
 *   Hermes Agent — Nous Research, MIT, Feb 2026, self-hosted, persistent
 *     memory, writes its own skills (hermes-agent.nousresearch.com,
 *     github.com/NousResearch/hermes-agent)
 *   Instinct — Spear Street Technology (Noah Shinn); you text it or phone
 *     it, invite-only through 2026
 *   Muse — Meta, launched 8 September 2026, iOS/Android/web/WhatsApp
 *     (techcrunch.com, cnbc.com)
 */

const PRODUCTS = [
  {
    name: 'OpenClaw',
    who: 'Peter Steinberger → a foundation',
    line: 'The original. Runs on your machine, lives in your messengers.',
    tag: 'open source',
  },
  {
    name: 'Hermes Agent',
    who: 'Nous Research',
    line: 'Self-hosted, remembers you, writes its own skills.',
    tag: 'open source',
  },
  {
    name: 'Instinct',
    who: 'Spear Street Technology',
    line: 'No app: you text it, or you ring it, and it runs the errand.',
    tag: 'hosted · invite only',
  },
  {
    name: 'Muse',
    who: 'Meta',
    line: 'An agent in the app you already have open.',
    tag: 'hosted',
  },
];

const TAIL = ['nanobot', 'PicoClaw', 'ZeroClaw', 'NullClaw', 'Kimi Claw', 'Manus', 'Claude Cowork', '…'];

export const CategorySlide: SlideDefinition = {
  id: 'category',
  title: (
    <>
      It started a category <span className="ww-llm__titlesub">— take one, set it up, use it</span>
    </>
  ),
  maxRevealStages: 2,
  initialRevealStage: 1,
  content: ({ revealStage }) => (
    <>
      <CornerRings corner="top-right" />
      <div className="ww-cat">
        <div className="ww-cat__grid">
          {PRODUCTS.map((product) => (
            <Card key={product.name} tone="grey" className="ww-cat__card">
              <div>
                <div className="ww-cat__name">{product.name}</div>
                <div className="ww-cat__who">{product.who}</div>
              </div>
              <p className="ww-cat__line">{product.line}</p>
              <span className="ww-cat__tag">{product.tag}</span>
            </Card>
          ))}
        </div>

        <Reveal at={2} stage={revealStage}>
          <div className="ww-cat__tail">
            {TAIL.map((name) => (
              <span key={name} className="ww-cat__tailname">
                {name}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </>
  ),
  notes:
    'A year ago this was a weekend project. Now it is a shelf: you pick one, you configure it, '
    + 'you use it — no harness to write at all. '
    + 'OpenClaw is the original and now belongs to a foundation. Hermes Agent, from Nous '
    + 'Research, is the open-source answer: MIT, February 2026, self-hosted, persistent memory, '
    + 'and it writes its own skills. Instinct, from Spear Street Technology, has no app at all — '
    + 'you text it or call a number, and it does the errand on a cloud machine; invite-only '
    + 'through 2026. And Muse is Meta, launched 8 September 2026, right inside WhatsApp. '
    + 'Beat 2 is the tail: nanobot, PicoClaw, ZeroClaw, NullClaw — the minimal clones — plus '
    + 'Manus, Kimi Claw, Claude Cowork. '
    + 'Be careful with numbers if someone asks: the search for this is almost entirely '
    + 'SEO listicles, and they contradict each other on Hermes\'s star count (46k vs 210k), on '
    + 'Instinct\'s funding and user numbers, and on half the dates. Nothing unverified is on the '
    + 'frame on purpose. '
    + 'The question this sets up: if the shelf exists, why did I keep building? Because none of '
    + 'them is a queue I can throw work into and walk away from.',
};
