import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';

/** The four words of the title. Stage 0 shows all; stages 1–4 spotlight one. */
export const AGENDA = ['Loops', 'Skills', 'Artifacts', 'Factory'];

/** Template slide 3: numbered caps rows with hairlines, rings bottom-left. */
export const AgendaSlide: SlideDefinition = {
  id: 'agenda',
  maxRevealStages: AGENDA.length,
  content: ({ revealStage }) => (
    <>
      <CornerRings corner="bottom-left" />
      <div className="ww-agenda">
        {AGENDA.map((item, i) => (
          <div
            key={item}
            className={`ww-agenda__row${revealStage > 0 && i !== revealStage - 1 ? ' ww-agenda__row--dim' : ''}`}
          >
            <span className="ww-agenda__label">{item}</span>
            <span className="ww-agenda__num">{String(i + 1).padStart(2, '0')}</span>
          </div>
        ))}
      </div>
    </>
  ),
  notes: 'Agenda: the four buzzwords from the title — and not just those four.',
};
