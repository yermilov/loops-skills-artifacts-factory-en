import { CSSProperties } from 'react';
import { SlideDefinition } from '../types/slides';
import { CornerRings, Reveal } from '../components/wawtech';

const STEPS = [
  { year: '2023', label: 'Autocomplete' },
  { year: '2024', label: 'Chat in the IDE' },
  { year: '2025', label: 'Agents in the terminal' },
  { year: '2026', label: 'A factory of agents' },
];

/** Template slide 15: overlapping magenta circles with years, caption under each. */
export const LayoutTimeline: SlideDefinition = {
  id: 'layout-timeline',
  title: 'A timeline in four steps',
  maxRevealStages: STEPS.length,
  initialRevealStage: STEPS.length,
  content: ({ revealStage }) => (
    <>
      <CornerRings corner="top-right" />
      <div className="ww-timeline" style={{ '--steps': STEPS.length } as CSSProperties}>
        {STEPS.map((s, i) => (
          <Reveal key={s.year} at={i + 1} stage={revealStage}>
            <div className="ww-timeline__step">
              <div className="ww-timeline__circle">{s.year}</div>
              <div className="ww-timeline__label">{s.label}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </>
  ),
  notes: 'Placeholder steps — replace with the real history.',
};
