import { ReactNode } from 'react';

export interface SlideContentProps {
  revealStage: number;
  inputText: string;
}

export interface SlideDefinition {
  id: string;
  content: ReactNode | ((props: SlideContentProps) => ReactNode);
  /** Optional top-left title rendered by Slide.tsx. Use `//` prefix
   * convention for the dim leader (matches dou-days deck). Omit for hero
   * / section-break slides that own their full composition. Pass a function
   * to derive the title from reveal state (e.g. a per-section subtitle). */
  title?: ReactNode | ((props: SlideContentProps) => ReactNode);
  notes?: string;
  background?: string;
  maxRevealStages?: number;
  initialRevealStage?: number;
  /**
   * Optional non-linear detours. When the presenter advances past `atStage`
   * on this slide, navigation jumps to the slide with id `toId` (at reveal 0);
   * once that slide is fully revealed, it returns here at `returnStage`. Detour
   * targets are skipped on the subsequent linear pass. Multiple detours from
   * one slide should list their target slides consecutively right after it.
   */
  detours?: { atStage: number; toId: string; returnStage: number }[];
  /**
   * Opt out of the export-mode auto-settle in Slide.tsx. Set true on slides
   * that do their own async work (fetches, etc.) and call
   * `exportRegistry.markSlideSettled(id)` from the async path themselves.
   */
  asyncSettle?: boolean;
}

export interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  filename?: string;
}

export interface TerminalInputProps {
  onCommand: (command: string) => void;
  onInputChange?: (value: string) => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export interface PresentationProps {
  slides: SlideDefinition[];
  initialSlide?: number;
}

export interface SlideProps {
  children: ReactNode;
  isActive: boolean;
  notes?: string;
  background?: string;
  /** Threaded so non-async slides can auto-settle via exportRegistry. */
  slideId?: string;
  asyncSettle?: boolean;
}

export type NavigationCommand =
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'goto'; slideNumber: number };
