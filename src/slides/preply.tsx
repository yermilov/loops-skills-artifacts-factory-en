import { QRCodeSVG } from 'qrcode.react';
import { SlideDefinition } from '../types/slides';
import { Card, CornerRings, Reveal, Stat } from '../components/wawtech';
import marketplaceShot from '../assets/preply/marketplace.png';
import aiShot from '../assets/preply/ai.png';

/*
 * Three slides about Preply, for a room that may not know it. Every number and claim comes from
 * Preply's own 2025–2026 conference decks (Kyiv AI Day 2026, LOB 2026, «Human led learning
 * powered by AI»); the two product pictures are the panels from the LOB 2026 deck.
 */

const CAREERS_URL = 'https://preply.com/en/careers';

/** 1 · Preply as a company — the magenta lead card + four mint stats. */
export const PreplyCompanySlide: SlideDefinition = {
  id: 'preply-company',
  title: 'Preply — the company',
  maxRevealStages: 1,
  content: ({ revealStage }) => (
    <>
      <CornerRings corner="top-right" />
      <div className="ww-preply-co">
        <Card tone="magenta" className="ww-preply-co__lead">
          <div className="ww-stats__lead">The #1 platform for learning languages with a human tutor</div>
          <div>Human-led learning, powered by AI</div>
        </Card>
        <Reveal at={1} stage={revealStage}>
          <Stat value="700+" label="Preplers from 60+ nationalities" />
        </Reveal>
        <Reveal at={1} stage={revealStage}>
          <Stat value="200+" label="engineers and data people" />
        </Reveal>
        <Reveal at={1} stage={revealStage}>
          <Stat value="30+" label="product and platform teams" />
        </Reveal>
        <Reveal at={1} stage={revealStage}>
          <Stat value="4" label="hubs: Kyiv · Barcelona · London · New York" />
        </Reveal>
      </div>
    </>
  ),
  notes:
    'Who Preply is, in one breath: the category leader in learning a language with a real tutor. '
    + 'Over 700 people from 60+ nationalities, 200+ of them in engineering and data, 30+ cross-functional '
    + 'product and platform teams, four hubs — Kyiv, Barcelona, London, New York.',
};

/** 2 · Preply as a product — the marketplace, and the AI around it. */
export const PreplyProductSlide: SlideDefinition = {
  id: 'preply-product',
  title: 'Preply — the product',
  maxRevealStages: 1,
  content: ({ revealStage }) => (
    <>
      <CornerRings corner="bottom-left" />
      <div className="ww-preply-product">
        <div className="ww-preply-product__col">
          <img src={marketplaceShot} alt="Tutor search on a phone and a live lesson in the Preply classroom" />
          <h3>The best marketplace</h3>
          <p>Amazing tutors, a best-in-class classroom, scheduling and tools</p>
        </div>
        <Reveal at={1} stage={revealStage}>
          <div className="ww-preply-product__col">
            <img src={aiShot} alt="Progress, a daily exercise and scenario practice in the Preply app" />
            <h3>Enhanced with AI</h3>
            <p>Lesson insights and progress, daily practice and speaking scenarios between lessons</p>
          </div>
        </Reveal>
      </div>
    </>
  ),
  notes:
    'A tutor-led, AI-enhanced learning platform. Humans stay at the centre: a marketplace of tutors '
    + 'with our own classroom, scheduling and tools. AI makes the time with the tutor go further — '
    + 'lesson insights after every class, a teaching assistant for tutors, daily exercises and '
    + 'avatar-based scenario practice between lessons.',
};

/** 3 · We are hiring — why it is a good place for an AI-minded engineer, and the QR to careers. */
export const PreplyHiringSlide: SlideDefinition = {
  id: 'preply-hiring',
  content: (
    <>
      <CornerRings corner="bottom-left" />
      <div className="ww-contacts">
        <div>
          <h2>We are hiring at Preply</h2>
          <div className="ww-contacts__list">
            <div className="ww-contacts__row"><span className="ww-contacts__dot" />AI in the interview is expected — we assess judgement, not memory</div>
            <div className="ww-contacts__row"><span className="ww-contacts__dot" />500+ AI skills already doing the weekly work</div>
            <div className="ww-contacts__row"><span className="ww-contacts__dot" />Kyiv · Barcelona · London · New York</div>
            <div className="ww-contacts__row"><span className="ww-contacts__dot" />preply.com/en/careers</div>
          </div>
        </div>
        <div className="ww-contacts__qr">
          <QRCodeSVG value={CAREERS_URL} size={480} fgColor="var(--ww-purple)" bgColor="var(--ww-white)" />
        </div>
      </div>
    </>
  ),
  notes:
    'We are hiring. At our interviews the candidate opens an AI tool and works with it in front of us — '
    + 'we look at how they frame the task, what they do with the answer and where they push back. '
    + 'Over 500 AI skills already do the repetitive work. The QR goes to the careers page.',
};
