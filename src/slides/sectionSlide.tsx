import { ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';
import { BottomFade, Pill } from '../components/wawtech';

/**
 * Template slides 11 / 18: a section opener — eyebrow, title and a pill on the
 * left, up to two short text columns, purple fade rising from the bottom.
 */
export function sectionSlide({
  id,
  number,
  title,
  eyebrow = 'Part',
  pill,
  columns = [],
  notes,
}: {
  id: string;
  number: number;
  title: ReactNode;
  eyebrow?: string;
  pill?: string;
  columns?: ReactNode[];
  notes?: string;
}): SlideDefinition {
  return {
    id,
    content: (
      <>
        <BottomFade height={620} />
        <div className="ww-section">
          <div className="ww-section__lead">
            <div className="ww-section__eyebrow">
              {eyebrow} {String(number).padStart(2, '0')}
            </div>
            <div className="ww-section__title">{title}</div>
            {pill && <Pill>{pill}</Pill>}
          </div>
          {columns.map((c, i) => (
            <div key={i} className="ww-section__col">
              {c}
            </div>
          ))}
        </div>
        <div className="ww-section__num">{String(number).padStart(2, '0')}</div>
      </>
    ),
    notes,
  };
}
