import { SlideDefinition } from '../types/slides';
import { CornerRings, Reveal } from '../components/wawtech';

const POINTS = [
  'One idea per line, revealed as you say it',
  'Older points stay — the layout never jumps',
  'Use a sliding window when a list outgrows the slide',
];

/** Plain bullets with staged reveal (magenta bar markers). */
export const LayoutBullets: SlideDefinition = {
  id: 'layout-bullets',
  title: 'Bullets, revealed one by one',
  maxRevealStages: POINTS.length,
  content: ({ revealStage }) => (
    <>
      <CornerRings corner="bottom-right" />
      <ul>
        {POINTS.map((p, i) => (
          <Reveal key={p} at={i + 1} stage={revealStage}>
            <li>{p}</li>
          </Reveal>
        ))}
      </ul>
    </>
  ),
};
