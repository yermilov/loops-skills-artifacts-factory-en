import { SlideDefinition } from '../types/slides';
import { Arrow } from '../components/wawtech';
import breakGradient from '../assets/wawtech/break-gradient.jpg';

/** Template slide 25: grainy purple gradient, white title bottom-left. Use it as a
 *  dramatic pause or a "live demo" card — the talk itself has no break. */
export const LayoutBreak: SlideDefinition = {
  id: 'layout-break',
  content: (
    <>
      <img className="ww-full-bg" src={breakGradient} alt="" />
      <div className="ww-break">
        <div className="ww-break__title">
          Let's look at <br />a live run <Arrow dir="down-right" />
        </div>
        <p className="ww-break__note text-white">A line of context in the corner.</p>
      </div>
    </>
  ),
};
