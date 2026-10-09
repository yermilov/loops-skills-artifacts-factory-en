import { SlideDefinition } from '../types/slides';
import { Card, CornerRings, Icon, IconName } from '../components/wawtech';

const CARDS: { icon: IconName; text: string; tone: 'magenta' | 'ink' }[] = [
  { icon: 'cloud', text: 'First thing', tone: 'magenta' },
  { icon: 'atom', text: 'Second thing', tone: 'ink' },
  { icon: 'case', text: 'Third thing', tone: 'ink' },
  { icon: 'database', text: 'Fourth thing', tone: 'ink' },
];

/** Template slide 6: title + a tray of four tall cards, the first one magenta. */
export const LayoutIconCards: SlideDefinition = {
  id: 'layout-icon-cards',
  title: 'Four things, side by side',
  content: (
    <>
      <CornerRings corner="top-right" />
      <div className="ww-icon-row">
        {CARDS.map((c) => (
          <Card key={c.text} tone={c.tone}>
            <Icon name={c.icon} size={112} />
            <div>{c.text}</div>
          </Card>
        ))}
      </div>
    </>
  ),
};
