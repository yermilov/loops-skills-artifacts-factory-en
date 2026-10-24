import { SlideDefinition } from '../types/slides';
import { Logo } from '../components/wawtech';
import titleRings from '../assets/wawtech/title-rings.jpg';

/**
 * Template slide 1, carrying slide 2's billing as well: full-bleed rings, mint
 * logo box with the venue chip, ink title, magenta box with the subtitle and
 * who is saying it.
 */
export const TitleSlide: SlideDefinition = {
  id: 'title',
  content: (
    <>
      <img className="ww-full-bg" src={titleRings} alt="" />
      <div className="ww-title">
        <div className="ww-title__stack">
          <div className="ww-title__head">
            <div className="ww-title__logo">
              <Logo tone="ink" width={460} />
            </div>
            <div className="ww-title__where">Warsaw · 26 November 2026 · 12:00</div>
          </div>
          <div className="ww-title__name">Loops, Skills, Artifacts, Factory</div>
          <div className="ww-title__sub">
            <strong>
              How I Turned AI Buzzwords Into a Personal Assistant That Actually Improved My Life
            </strong>
            <span>Yaroslav Yermilov, Principal Engineer @ Preply</span>
          </div>
        </div>
      </div>
    </>
  ),
  notes: 'Title slide: the talk, and who is giving it. The slot is 26 November, 12:00–12:45, ENGINEERING stage.',
};
