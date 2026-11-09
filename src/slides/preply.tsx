import type React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { SlideDefinition } from '../types/slides';
import { CornerRings, Reveal } from '../components/wawtech';
import preplyLogo from '../assets/preply/logo.svg';
import matchClip from '../assets/preply/match.mp4';
import matchPoster from '../assets/preply/match-poster.jpg';
import classroomShot from '../assets/preply/classroom.png';
import insightsCards from '../assets/preply/insights.webp';
import insightsPoster from '../assets/preply/insights-poster.png';
import practiceShot from '../assets/preply/practice.png';

/*
 * Two slides about Preply, wearing a blend of the two design systems: the WAWTech page (paper,
 * purple type, corner rings, the four type tiers) with Preply's colours in place of the WAWTech
 * accents — `.ww-preply` remaps them (slide-layouts.css), and the hub and step colours come
 * from the `--pp-*` tokens.
 *
 * Media provenance — what has already been shown in public, and what still needs Brand / PR:
 *   classroom.png PUBLIC precedent: Kyiv AI Day 2026 deck, slide 3 (the classroom laptop mockup),
 *                 shown on stage. Original image from that Google Slides deck, 2048 px.
 *   insights.webp INTERNAL file: the lesson-insights cards GIF (431×508, transparent) from the
 *                 «Engineering Management Offsite — 2027 Platform & AI Native Strategy» title slide,
 *                 re-encoded as animated WebP because MP4 has no alpha; insights-poster.png is its
 *                 frame 17 (grammar + vocabulary), used in PDF export mode. Public precedent for the
 *                 content: Kyiv AI Day 2026, slide 25 shows the same cards (Total words, Vocabulary
 *                 size, Speaking speed) beside a lesson in the classroom.
 *   logo.svg      public media kit (preply.com/en/about-us/media-kit/logos); file from
 *                 preply/design-system PreplyLogo, cropped to the wordmark (viewBox 0 0 775 210).
 *   practice.png  PUBLIC: Preply's App Store listing (id1352790442), screenshot «Practice what
 *                 matters.», 1290×2796, cropped to the phone (headline removed) and cut out of its
 *                 gradient background (transparent PNG).
 *   match.mp4     The clip itself comes from the internal «Human led learning powered by AI» deck
 *                 (slide 11 GIF, first 5.5 s of 32 s), but the same screens are public: App Store
 *                 screenshot «Set your goals.» and Kyiv AI Day 2026, slide 27.
 * Numbers: 150,000+ tutors — Preply boilerplate (Brand & Messaging Framework, Jan 2026);
 * 1M+ learners, $1.2B / Series D — Ivan Pashko's DOU Day 2026 talk «Output to Impact», slide 2
 * (youtube.com/watch?v=kPsloia7l8g, ~1:00), and the Jan 2026 Series D press release;
 * 700+ Preplers, 60+ nationalities, 4 hubs — Kyiv AI Day 2026.
 */

const CAREERS_URL = 'https://preply.com/en/careers';

/** PDF capture has no video playback, so in export mode a loop shows its poster frame. */
const EXPORT_MODE =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('export') === '1';

function Loop({ src, poster, contain = false }: { src: string; poster: string; contain?: boolean }) {
  const className = `ww-preply-step__media${contain ? ' ww-preply-step__media--contain' : ''}`;
  if (EXPORT_MODE) return <img className={className} src={poster} alt="" />;
  return (
    <video className={className} src={src} poster={poster} autoPlay loop muted playsInline preload="auto" />
  );
}

function Step({
  label,
  tone,
  children,
}: {
  label: string;
  tone: 'pink' | 'teal' | 'blue';
  children: React.ReactNode;
}) {
  return (
    <div className={`ww-preply-step ww-preply-step--${tone}`}>
      <div className="ww-preply-step__frame">{children}</div>
      <div className="ww-preply-step__label">
        <span>{label}</span>
      </div>
    </div>
  );
}

/** 1 · What Preply is, for a room that has never heard of it: the three steps of using it. */
export const PreplyProductSlide: SlideDefinition = {
  id: 'preply-product',
  title: 'Tutor-led, AI-enhanced learning',
  maxRevealStages: 2,
  content: ({ revealStage }) => (
    <>
      <CornerRings corner="bottom-left" />
      <img className="ww-preply-product__logo" src={preplyLogo} alt="Preply" />
      <div className="ww-preply ww-preply-product">
        <Step label="Find your tutor" tone="pink">
          {/* The clip is a bare screen recording, so the deck draws the device around it. */}
          <div className="ww-preply-device">
            <Loop src={matchClip} poster={matchPoster} />
          </div>
        </Step>
        <Reveal at={1} stage={revealStage}>
          <Step label="Learn live, one-on-one, by video" tone="teal">
            <div className="ww-preply-lesson">
              <div className="ww-preply-lesson__box">
                <img
                  className="ww-preply-lesson__laptop"
                  src={classroomShot}
                  alt="A lesson in the Preply classroom: the learner on video, the tutor in the corner"
                />
                {/* An animated image is invisible to the PDF exporter's settle check, so export
                    mode shows one fixed frame (grammar + vocabulary), as the clips show posters. */}
                <img
                  className="ww-preply-lesson__cards"
                  src={EXPORT_MODE ? insightsPoster : insightsCards}
                  alt="AI lesson insights: grammar corrections, vocabulary size, synonyms, speaking speed"
                />
              </div>
            </div>
          </Step>
        </Reveal>
        <Reveal at={2} stage={revealStage}>
          <Step label="Practice with AI" tone="blue">
            <img
              className="ww-preply-step__media ww-preply-step__media--cutout"
              src={practiceShot}
              alt="An AI listening exercise in the Preply app, built from your last lesson"
            />
          </Step>
        </Reveal>
      </div>
    </>
  ),
  notes:
    'Quick context, since not everyone knows us. Preply is the #1 platform for learning a language '
    + 'with a real human tutor. You tell us your goal and pick a tutor. [reveal] Then you learn live, '
    + 'one-on-one, by video. [reveal] And between lessons, AI keeps you going: lesson insights after every '
    + 'class, and AI exercises built from what you did in your last lesson — listen, read, speak.',
};

/* Ashby job board (api.ashbyhq.com/posting-api/job-board/preply), 2026-11-09: open roles in
 * Barcelona 53 · London 40 · Kyiv 27 · New York 0 — so New York is not on the hiring slide. */

/* City landmarks, drawn here as line art in the ink-on-colour style of Preply's illustrations
 * (the brand library has no city landmarks): golden domes for Kyiv, the Sagrada Família for
 * Barcelona, Big Ben for London. viewBox 0 0 120 120; stroke = ink, `__fill` = white. */
function KyivIcon() {
  return (
    <svg viewBox="0 0 120 120" className="ww-preply-city__icon" aria-hidden="true">
      <path className="ww-preply-city__fill" d="M24 70h72v40H24z" />
      <path d="M52 110v-18a8 8 0 0 1 16 0v18" />
      <path className="ww-preply-city__fill" d="M47 70V52h26v18" />
      <path className="ww-preply-city__fill" d="M47 52c0-12 13-16 13-28 0 12 13 16 13 28z" />
      <path d="M60 24V10M54 15h12" />
      <path className="ww-preply-city__fill" d="M29 70V60h12v10M79 70V60h12v10" />
      <path className="ww-preply-city__fill" d="M29 60c0-7 6-10 6-17 0 7 6 10 6 17zM79 60c0-7 6-10 6-17 0 7 6 10 6 17z" />
      <path d="M35 43v-8M85 43v-8M31 39h8M81 39h8" />
      <path d="M14 110h92" />
    </svg>
  );
}

function BarcelonaIcon() {
  const spire = (cx: number, top: number) =>
    `M${cx - 8} 104L${cx - 6} ${top + 34}L${cx} ${top}L${cx + 6} ${top + 34}L${cx + 8} 104z`;
  return (
    <svg viewBox="0 0 120 120" className="ww-preply-city__icon" aria-hidden="true">
      {[
        [28, 34],
        [48, 14],
        [72, 14],
        [92, 34],
      ].map(([cx, top]) => (
        <g key={cx}>
          <path className="ww-preply-city__fill" d={spire(cx, top)} />
          <circle className="ww-preply-city__fill" cx={cx} cy={top - 4} r="4" />
          <path d={`M${cx - 4} ${top + 46}h8M${cx - 5} ${top + 60}h10`} />
        </g>
      ))}
      <path className="ww-preply-city__fill" d="M16 96h88v14H16z" />
      <path d="M54 110v-8a6 6 0 0 1 12 0v8" />
    </svg>
  );
}

function LondonIcon() {
  return (
    <svg viewBox="0 0 120 120" className="ww-preply-city__icon" aria-hidden="true">
      <path className="ww-preply-city__fill" d="M47 28L60 6l13 22z" />
      <path className="ww-preply-city__fill" d="M47 28h26v10H47z" />
      <path className="ww-preply-city__fill" d="M43 38h34v28H43z" />
      <circle className="ww-preply-city__fill" cx="60" cy="52" r="10" />
      <path d="M60 52v-6M60 52l5 3" />
      <path className="ww-preply-city__fill" d="M46 66h28v44H46z" />
      <path d="M55 74v28M65 74v28" />
      <path d="M34 110h52" />
    </svg>
  );
}

const HUBS = [
  { city: 'Kyiv', tone: 'yellow', Icon: KyivIcon },
  { city: 'Barcelona', tone: 'teal', Icon: BarcelonaIcon },
  { city: 'London', tone: 'pink', Icon: LondonIcon },
] as const;

/** 2 · Meet us at our booth (top left), the cities we hire in (bottom left), «We are hiring» + the
 *  careers QR (right). */
export const PreplyHiringSlide: SlideDefinition = {
  id: 'preply-hiring',
  content: (
    <>
      <CornerRings corner="top-right" />
      <div className="ww-preply ww-preply-hiring">
        <div className="ww-preply-hiring__left">
          <div className="ww-preply-hiring__booth">
            <img className="ww-preply-hiring__logo" src={preplyLogo} alt="Preply" />
            <h2>Meet us at our booth</h2>
          </div>
          <div className="ww-preply-hubs">
            {HUBS.map(({ city, tone, Icon }) => (
              <div key={city} className={`ww-preply-hub ww-preply-hub--${tone}`}>
                <Icon />
                <span>{city}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ww-preply-hiring__cta">
          <h2>We are hiring</h2>
          <div className="ww-preply-hiring__qr">
            <QRCodeSVG
              value={CAREERS_URL}
              size={460}
              fgColor="var(--pp-pink-dark)"
              bgColor="transparent"
              title="QR code: Preply careers, preply.com/en/careers"
            />
          </div>
          <a className="ww-preply-hiring__url" href={CAREERS_URL}>preply.com/careers</a>
        </div>
      </div>
    </>
  ),
  notes:
    'Preply is a unicorn — $1.2B valuation after the Series D this year — with over a million learners '
    + 'and 150,000 tutors. Meet us at our booth here at WAWTech. We are hiring in Kyiv, Barcelona '
    + 'and London — in Preply\'s own brand colours: Kyiv Yellow, Barcelona Teal and Tokyo Pink. '
    + 'At our interviews you work with an AI tool in front of us. Scan the QR.',
};
