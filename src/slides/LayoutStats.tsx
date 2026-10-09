import { SlideDefinition } from '../types/slides';
import { Card, CornerRings, Stat } from '../components/wawtech';

/** Template slide 7: a wide magenta lead card + two mint stat cards. */
export const LayoutStats: SlideDefinition = {
  id: 'layout-stats',
  title: 'Numbers that make the point',
  content: (
    <>
      <CornerRings corner="bottom-left" />
      <div className="ww-stats">
        <Card tone="magenta">
          <div className="ww-stats__lead">What the numbers below are about</div>
          <div>One line of context</div>
        </Card>
        <Stat value="200+" label="tasks done by agents" />
        <Stat value="50+" label="skills in the marketplace" />
      </div>
    </>
  ),
  notes: 'Placeholder numbers — replace with real ones.',
};
