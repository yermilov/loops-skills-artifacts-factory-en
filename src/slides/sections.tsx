import { sectionSlide } from './sectionSlide';
import { AGENDA } from './AgendaSlide';

/** One opener per word in the title, numbered like the agenda. */
export const [LoopsSection, SkillsSection, ArtifactsSection, FactorySection] = AGENDA.map(
  (word, i) =>
    sectionSlide({
      id: `section-${word.toLowerCase()}`,
      number: i + 1,
      title: word,
      notes: `Section ${i + 1}: ${word}.`,
    }),
);
