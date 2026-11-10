import { QRCodeSVG } from 'qrcode.react';
import { SlideDefinition } from '../types/slides';
import { CornerRings, Reveal } from '../components/wawtech';
import { HelloStickers } from '../components/HelloStickers';
import portrait from '../assets/about/yaroslav.jpg';
import preplyMark from '../assets/about/preply-mark.svg';
import grammarlyMark from '../assets/about/grammarly-mark.svg';

const LINKEDIN_URL = 'https://www.linkedin.com/in/yarik-yermilov/';

/** Who I am: the photo and LinkedIn QR stand from the start beside a pile of Preply «hello»
 * stickers, then where I am now and where I come from. */
export const AboutMeSlide: SlideDefinition = {
  id: 'about-me',
  maxRevealStages: 2,
  content: ({ revealStage }) => (
    <>
      <CornerRings corner="bottom-left" />
      <div className="ww-about">
        <HelloStickers hidden={revealStage >= 1} />
        <div className="ww-about__col">
          <Reveal at={1} stage={revealStage}>
            <div className="ww-about__card ww-about__card--now">
              <img className="ww-about__logo ww-about__logo--invert" src={preplyMark} alt="Preply" />
              <div className="ww-about__role">Principal Engineer at Preply</div>
              <div className="ww-about__line">
                Leading the AI / agentic transformation of the software development lifecycle
              </div>
            </div>
          </Reveal>
          <Reveal at={2} stage={revealStage}>
            <div className="ww-about__card">
              <img className="ww-about__logo" src={grammarlyMark} alt="Grammarly" />
              <div className="ww-about__role">ex-Platform Tech Lead at Grammarly</div>
              <div className="ww-about__line">
                9 years: Java backend engineer, tech lead for the{' '}
                <em>Writing Assistant for Professionals</em> product, touched personalization,
                server-driven UI, DevX tools, MLOps, LLMOps, even computational linguistics —
                and paved the path to AI coding
              </div>
            </div>
          </Reveal>
        </div>
        <div className="ww-about__me">
          <img className="ww-about__photo" src={portrait} alt="Yaroslav Yermilov" />
          <div className="ww-about__qr-text">
            <span className="ww-about__in" aria-hidden="true">in</span>
            <span>yarik-yermilov</span>
          </div>
          <QRCodeSVG
            className="ww-about__qr"
            value={LINKEDIN_URL}
            size={440}
            level="M"
            fgColor="var(--ww-linkedin)"
            bgColor="var(--ww-white)"
          />
        </div>
      </div>
    </>
  ),
  notes:
    'Opening beat: photo, LinkedIn QR and the Preply «hello» laptop stickers. Then two beats: '
    + 'Preply today (AI/agentic transformation of the SDLC), nine years at Grammarly '
    + 'behind it; the photo and the QR to LinkedIn are up from the start.',
};
