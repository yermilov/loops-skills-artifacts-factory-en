import { TitleSlide } from './TitleSlide';
import { SpeakerSlide } from './SpeakerSlide';
import { AgendaSlide } from './AgendaSlide';
import { LoopsSection, SkillsSection, ArtifactsSection, FactorySection } from './sections';
import { LayoutTwoColumns } from './LayoutTwoColumns';
import { LayoutBullets } from './LayoutBullets';
import { LayoutIconCards } from './LayoutIconCards';
import { LayoutStats } from './LayoutStats';
import { LayoutFeatureGrid } from './LayoutFeatureGrid';
import { LayoutBigNumber } from './LayoutBigNumber';
import { LayoutStatement } from './LayoutStatement';
import { LayoutTimeline } from './LayoutTimeline';
import { LayoutAccordion } from './LayoutAccordion';
import { LayoutCode } from './LayoutCode';
import { LayoutImage } from './LayoutImage';
import { LayoutBreak } from './LayoutBreak';
import { LayoutBigTitle } from './LayoutBigTitle';
import { LayoutContacts } from './LayoutContacts';
import { FinalSlide } from './FinalSlide';

/**
 * LAYOUT GALLERY — one example of every WAWTech layout. Copy the one you
 * need into a real slide, then delete these (and their files) before the talk.
 */
const LAYOUT_GALLERY = [
  LayoutTwoColumns,
  LayoutBullets,
  LayoutIconCards,
  LayoutStats,
  LayoutFeatureGrid,
  LayoutBigNumber,
  LayoutStatement,
  LayoutTimeline,
  LayoutAccordion,
  LayoutCode,
  LayoutImage,
  LayoutBreak,
  LayoutBigTitle,
  LayoutContacts,
];

export const slides = [
  TitleSlide,
  SpeakerSlide,
  AgendaSlide,
  LoopsSection,
  SkillsSection,
  ArtifactsSection,
  FactorySection,
  ...LAYOUT_GALLERY,
  FinalSlide,
];
