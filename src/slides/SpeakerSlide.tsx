import { SlideDefinition } from '../types/slides';
import { Logo } from '../components/wawtech';
import dashedRings from '../assets/wawtech/dashed-rings.png';

/** Template slide 2: logo, magenta title, name + date at the bottom. */
export const SpeakerSlide: SlideDefinition = {
  id: 'speaker',
  content: (
    <>
      <img className="ww-speaker__rings" src={dashedRings} alt="" />
      <div className="ww-speaker">
        <Logo tone="purple" width={420} />
        <div className="ww-speaker__title">
          Loops, Skills, Artifacts, Factory
        </div>
        <div className="ww-speaker__meta">
          <strong>Yaroslav Yermilov</strong>
          <span>Principal Engineer at Preply</span>
          <span>WAWTech 2026 · Warsaw · 26–27 November</span>
        </div>
      </div>
    </>
  ),
  notes: 'Who I am. Exact day and time of the slot are still to be confirmed by the organisers.',
};
