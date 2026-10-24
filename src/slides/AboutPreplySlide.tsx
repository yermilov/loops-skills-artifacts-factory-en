import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';
import preplyMark from '../assets/about/preply-mark.svg';

/** PLACEHOLDER — what Preply is, for a room that may not know it. Fill in. */
export const AboutPreplySlide: SlideDefinition = {
  id: 'about-preply',
  title: 'Preply',
  content: (
    <>
      <CornerRings corner="top-right" />
      <div className="ww-placeholder">
        <img className="ww-placeholder__mark" src={preplyMark} alt="Preply" />
        <p>Інформація про Преплі</p>
        <p className="ww-placeholder__hint">
          Placeholder — scale, what the product is, why its SDLC is worth talking about.
        </p>
      </div>
    </>
  ),
  notes: 'PLACEHOLDER: who Preply is, for people who have not heard of it.',
};
