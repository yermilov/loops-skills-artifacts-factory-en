import { SlideDefinition } from '../types/slides';
import { Card, CornerRings, Icon, IconName } from '../components/wawtech';

const FEATURES: { icon: IconName; title: string; text: string }[] = [
  { icon: 'robot', title: 'Subtitle', text: 'One short line' },
  { icon: 'plug', title: 'Subtitle', text: 'One short line' },
  { icon: 'screen', title: 'Subtitle', text: 'One short line' },
  { icon: 'robot', title: 'Subtitle', text: 'One short line' },
];

/** Template slide 12: title + note on the left, 2×2 grey feature cards on the right. */
export const LayoutFeatureGrid: SlideDefinition = {
  id: 'layout-feature-grid',
  content: (
    <>
      <CornerRings corner="bottom-left" />
      <div className="ww-split">
        <div className="ww-split__text">
          <h2>Title on the left, grid on the right</h2>
          <p>A sentence of context at the bottom of the column.</p>
        </div>
        <div className="ww-feature-grid">
          {FEATURES.map((f, i) => (
            <Card key={i} tone="grey">
              <Icon name={f.icon} size={112} />
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </Card>
          ))}
        </div>
      </div>
    </>
  ),
};
