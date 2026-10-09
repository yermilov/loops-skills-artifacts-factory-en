import { SlideDefinition } from '../types/slides';
import { CornerRings, Logo } from '../components/wawtech';

/** Template slide 27: logo, a huge «Thank You!», footer line. */
export const FinalSlide: SlideDefinition = {
  id: 'final',
  content: (
    <>
      <CornerRings corner="top-right" />
      <div className="ww-thanks">
        <Logo tone="purple" width={420} />
        <div className="ww-thanks__title">Thank You!</div>
        <div className="ww-thanks__foot">
          <p>
            Slides: <strong>yermilov.github.io/loops-skills-artifacts-factory-en</strong>
          </p>
          <p className="text-right">Yaroslav Yermilov · Principal Engineer at Preply</p>
        </div>
      </div>
    </>
  ),
  notes: 'Closing slide. 45-minute slot, no Q&A.',
};
