import { SlideDefinition } from '../types/slides';
import { CornerRings, Pill } from '../components/wawtech';

/** Template slide 24 («Break Slide»): one huge bold word + outline pills. */
export const LayoutBigTitle: SlideDefinition = {
  id: 'layout-big-title',
  content: (
    <>
      <CornerRings corner="top-right" />
      <div className="ww-bigtitle">
        <div className="ww-bigtitle__text">One word</div>
        <div className="ww-bigtitle__pills">
          <Pill tone="outline">Tag one</Pill>
          <Pill tone="outline">Tag two</Pill>
          <Pill tone="outline">Tag three</Pill>
        </div>
      </div>
    </>
  ),
};
