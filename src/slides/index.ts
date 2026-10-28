import { TitleSlide } from './TitleSlide';
import { AboutMeSlide } from './AboutMeSlide';
import { PreplyCompanySlide, PreplyProductSlide, PreplyHiringSlide } from './preply';
import { ChatGptLaunchSlide, GptShellSlide } from './history';
import { MusicPrototypeSlide } from './MusicPrototypeSlide';
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
 * LAYOUT GALLERY — one example of every WAWTech layout, kept as reference code
 * only: it is deliberately NOT in `slides`, so the deck shows real slides alone.
 * Copy the one you need into a real slide; delete these files once none is needed.
 */
export const LAYOUT_GALLERY = [
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
  AboutMeSlide,
  PreplyCompanySlide,
  PreplyProductSlide,
  PreplyHiringSlide,
  ChatGptLaunchSlide,
  GptShellSlide,
  MusicPrototypeSlide,
  AgendaSlide,
  LoopsSection,
  SkillsSection,
  ArtifactsSection,
  FactorySection,
  FinalSlide,
];
