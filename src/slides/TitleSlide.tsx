import { SlideDefinition } from '../types/slides';
import { Logo } from '../components/wawtech';
import titleRings from '../assets/wawtech/title-rings.jpg';

/** Template slide 1: full-bleed rings, mint logo box, ink title, magenta subtitle. */
export const TitleSlide: SlideDefinition = {
  id: 'title',
  content: (
    <>
      <img className="ww-full-bg" src={titleRings} alt="" />
      <div className="ww-title">
        <div className="ww-title__stack">
          <div className="ww-title__logo">
            <Logo tone="ink" width={460} />
          </div>
          <div className="ww-title__name">Loops, Skills, Artifacts, Factory</div>
          <div className="ww-title__sub">
            How I Turned AI Buzzwords Into a Personal Assistant That Actually Improved My Life
          </div>
        </div>
      </div>
    </>
  ),
  notes: 'Title slide.',
};
