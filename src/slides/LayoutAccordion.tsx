import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';

const ITEMS = [
  { head: 'Subtitle', body: 'The open item carries one line of detail.' },
  { head: 'Subtitle' },
  { head: 'Subtitle' },
  { head: 'Subtitle' },
];

/** Template slide 20: stacked purple rows; the stage decides which one is open. */
export const LayoutAccordion: SlideDefinition = {
  id: 'layout-accordion',
  title: 'A list where one item is open',
  maxRevealStages: ITEMS.length - 1,
  content: ({ revealStage }) => (
    <>
      <CornerRings corner="bottom-left" />
      <div className="ww-accordion">
        {ITEMS.map((item, i) =>
          i === revealStage ? (
            <div key={i} className="ww-accordion__item ww-accordion__item--open">
              <div className="ww-accordion__head">
                <span>{item.head}</span>
                <span aria-hidden="true">⌄</span>
              </div>
              <div className="ww-accordion__body">{item.body ?? 'One line of detail.'}</div>
            </div>
          ) : (
            <div key={i} className="ww-accordion__item">
              <span>{item.head}</span>
              <span aria-hidden="true">›</span>
            </div>
          ),
        )}
      </div>
    </>
  ),
};
