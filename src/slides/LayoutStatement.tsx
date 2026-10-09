import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';

/** Template slide 19: one sentence in a purple box, centred. */
export const LayoutStatement: SlideDefinition = {
  id: 'layout-statement',
  content: (
    <>
      <CornerRings corner="bottom-left" />
      <CornerRings corner="top-right" />
      <div className="ww-statement">
        <div className="ww-block">One sentence the audience should remember.</div>
      </div>
    </>
  ),
};
