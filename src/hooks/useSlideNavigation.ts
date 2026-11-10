import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { SlideDefinition } from '../types/slides';

/**
 * One addressable frame of the deck: a slide at one of its reveal stages.
 * The deck is navigated and addressed in STEPS, not slides — `#slide-12` is
 * the twelfth frame you see, not the twelfth entry in `slides`.
 */
export interface DeckStep {
  slideIndex: number;
  stage: number;
}

interface UseSlideNavigationReturn {
  currentSlide: number;
  goToSlide: (index: number) => void;
  goToSlideWithReveal: (slideIndex: number, revealStage: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  revealNext: () => void;
  revealPrev: () => void;
  handleCommand: (command: string) => void;
  isFirstSlide: boolean;
  isLastSlide: boolean;
  revealStage: number;
  /** 0-based index of the current frame in `steps`; -1 only if `slides` is empty. */
  currentStep: number;
  /** Every frame of the deck, in presentation order. */
  steps: DeckStep[];
}

/**
 * Flatten the deck into its frames. A slide contributes one step per reveal
 * stage it actually shows going forward — `initialRevealStage` … `maxRevealStages`
 * — so the numbering matches the clicks: on a slide that starts at stage 1
 * (the clip slides in history.tsx), stage 0 draws the same picture as stage 1
 * and would otherwise get a second number for one frame.
 */
export function buildSteps(slides: SlideDefinition[]): DeckStep[] {
  const steps: DeckStep[] = [];
  slides.forEach((slide, slideIndex) => {
    const max = slide.maxRevealStages ?? 0;
    const first = Math.max(0, Math.min(slide.initialRevealStage ?? 0, max));
    for (let stage = first; stage <= max; stage += 1) {
      steps.push({ slideIndex, stage });
    }
  });
  return steps;
}

export function useSlideNavigation(
  slides: SlideDefinition[],
  initialSlide: number = 0
): UseSlideNavigationReturn {
  const totalSlides = slides.length;
  const steps = useMemo(() => buildSteps(slides), [slides]);

  // Where a slide lands when something jumps to it by index (the first frame
  // it shows) and where its frames start in the flat numbering.
  const firstStepOfSlide = useCallback(
    (slideIndex: number) => steps.findIndex(s => s.slideIndex === slideIndex),
    [steps]
  );

  // The step for a (slide, stage) pair. A stage below the slide's first frame
  // or above its last clamps into range, so the hash always names a real frame.
  const stepIndexOf = useCallback(
    (slideIndex: number, stage: number): number => {
      const exact = steps.findIndex(s => s.slideIndex === slideIndex && s.stage === stage);
      if (exact >= 0) return exact;
      const first = firstStepOfSlide(slideIndex);
      if (first < 0) return -1;
      let last = first;
      while (last + 1 < steps.length && steps[last + 1].slideIndex === slideIndex) last += 1;
      return stage < steps[first].stage ? first : last;
    },
    [steps, firstStepOfSlide]
  );

  // Parse the initial frame from the URL hash: #slide-N is the N-th step.
  const getInitialStep = (): DeckStep => {
    const fallback =
      steps[Math.max(0, firstStepOfSlide(initialSlide))] ?? steps[0] ?? { slideIndex: 0, stage: 0 };
    if (typeof window === 'undefined') return fallback;
    const match = window.location.hash.match(/^#slide-(\d+)$/);
    if (match) {
      const stepNum = parseInt(match[1], 10) - 1; // the hash is 1-indexed
      if (stepNum >= 0 && stepNum < steps.length) return steps[stepNum];
    }
    return fallback;
  };

  const initial = getInitialStep();
  const [currentSlide, setCurrentSlide] = useState(initial.slideIndex);
  const [revealStage, setRevealStage] = useState(initial.stage);

  // Refs to avoid stale closures in the keyboard listener
  const revealStageRef = useRef(revealStage);
  revealStageRef.current = revealStage;
  const currentSlideRef = useRef(currentSlide);
  currentSlideRef.current = currentSlide;

  // Detour state (see SlideDefinition.detours). `detourReturn` is where to land
  // when the detour slide finishes; `skipIndices` holds detour slides to skip
  // on the subsequent linear pass; `detourFired` tracks origin+stage pairs
  // already taken so reversing within a slide doesn't re-trigger the jump.
  const detourReturnRef = useRef<{ index: number; stage: number } | null>(null);
  const skipIndicesRef = useRef<Set<number>>(new Set());
  const detourFiredRef = useRef<Set<string>>(new Set());

  // Clamp slide index to valid range
  const clampIndex = useCallback(
    (index: number): number => {
      return Math.max(0, Math.min(index, totalSlides - 1));
    },
    [totalSlides]
  );

  const currentStep = stepIndexOf(currentSlide, revealStage);

  // The hash follows the frame, not the slide: every reveal has its own
  // address, so a link (or a screenshot taken from the URL bar) points at the
  // beat you were looking at. Driven by an effect rather than by each mover,
  // so stage-only changes update it too. replaceState doesn't fire
  // `hashchange`, so this never feeds the listener below.
  useEffect(() => {
    if (typeof window === 'undefined' || currentStep < 0) return;
    const newHash = `#slide-${currentStep + 1}`;
    if (window.location.hash !== newHash) {
      window.history.replaceState(null, '', newHash);
    }
  }, [currentStep]);

  // Land on one frame of the deck.
  const goToStep = useCallback(
    (stepIndex: number) => {
      const step = steps[Math.max(0, Math.min(stepIndex, steps.length - 1))];
      if (!step) return;
      setCurrentSlide(step.slideIndex);
      setRevealStage(step.stage);
    },
    [steps]
  );

  // Go to a slide, at the first frame it shows
  const goToSlide = useCallback(
    (index: number) => {
      const clampedIndex = clampIndex(index);
      // Any explicit jump resets detour state so detours re-arm cleanly.
      detourReturnRef.current = null;
      skipIndicesRef.current.clear();
      detourFiredRef.current.clear();
      goToStep(firstStepOfSlide(clampedIndex));
    },
    [clampIndex, firstStepOfSlide, goToStep]
  );

  // Drive both slide and reveal stage from outside (used by PDF exporter).
  // Clamps both indices into valid range. Avoids the keyboard handlers,
  // which reset reveal on slide change and don't clamp `r` past the max.
  const goToSlideWithReveal = useCallback(
    (slideIndex: number, targetReveal: number) => {
      const clampedIndex = clampIndex(slideIndex);
      const max = slides[clampedIndex]?.maxRevealStages ?? 0;
      const clampedReveal = Math.max(0, Math.min(targetReveal, max));
      setCurrentSlide(clampedIndex);
      setRevealStage(clampedReveal);
    },
    [clampIndex, slides]
  );

  // Navigate to next slide
  const nextSlide = useCallback(() => {
    goToSlide(currentSlide + 1);
  }, [currentSlide, goToSlide]);

  // Navigate to previous slide
  const prevSlide = useCallback(() => {
    goToSlide(currentSlide - 1);
  }, [currentSlide, goToSlide]);

  // Reveal next stage if available, otherwise advance to next slide.
  // On the very last slide at max reveal, stay put — falling through to
  // nextSlide() there clamps the index back to the same slide and resets
  // revealStage to 0, which loops the reveals.
  const revealNext = useCallback(() => {
    const cur = currentSlideRef.current;
    const slide = slides[cur];
    const stage = revealStageRef.current;
    const maxReveal = slide?.maxRevealStages ?? 0;

    // Forward into a detour: jump to the detour slide at reveal 0.
    const detour = slide?.detours?.find(
      d => stage === d.atStage && !detourFiredRef.current.has(`${slide.id}:${d.atStage}`)
    );
    if (slide && detour) {
      const toIndex = slides.findIndex(s => s.id === detour.toId);
      if (toIndex >= 0) {
        detourFiredRef.current.add(`${slide.id}:${detour.atStage}`);
        detourReturnRef.current = { index: cur, stage: detour.returnStage };
        skipIndicesRef.current.add(toIndex);
        goToSlideWithReveal(toIndex, 0);
        return;
      }
    }

    if (stage < maxReveal) {
      setRevealStage(prev => prev + 1);
      return;
    }

    // At max reveal: first finish a detour by returning to its origin.
    if (detourReturnRef.current) {
      const ret = detourReturnRef.current;
      detourReturnRef.current = null;
      goToSlideWithReveal(ret.index, ret.stage);
      return;
    }

    // Otherwise advance, skipping any detour slides already shown.
    if (cur < totalSlides - 1) {
      let target = cur + 1;
      while (target < totalSlides - 1 && skipIndicesRef.current.has(target)) {
        target += 1;
      }
      goToSlide(clampIndex(target));
    }
  }, [slides, goToSlide, goToSlideWithReveal, clampIndex, totalSlides]);

  // One frame back — the previous reveal of this slide, or the previous
  // slide's LAST reveal, which is what you were in fact looking at. Stops at
  // the first frame of the deck.
  const revealPrev = useCallback(() => {
    const step = stepIndexOf(currentSlideRef.current, revealStageRef.current);
    if (step > 0) goToStep(step - 1);
  }, [stepIndexOf, goToStep]);

  // Parse and handle command input
  const handleCommand = useCallback(
    (command: string) => {
      const trimmed = command.trim().toLowerCase();

      // Empty command - do nothing
      if (!trimmed) return;

      // A number is a FRAME number — the same one the hash shows — so every
      // reveal can be jumped to, not just the first beat of a slide.
      const stepNumber = parseInt(trimmed, 10);
      if (!isNaN(stepNumber) && stepNumber > 0) {
        detourReturnRef.current = null;
        skipIndicesRef.current.clear();
        detourFiredRef.current.clear();
        goToStep(stepNumber - 1); // convert from 1-indexed user input
        return;
      }

      // Negative number — N-th frame before the last (e.g. -1 = second to last)
      if (!isNaN(stepNumber) && stepNumber < 0) {
        detourReturnRef.current = null;
        skipIndicesRef.current.clear();
        detourFiredRef.current.clear();
        goToStep(steps.length - 1 + stepNumber);
        return;
      }

      // Navigation commands
      switch (trimmed) {
        case 'prev':
        case 'previous':
        case 'back':
        case 'b':
        case 'p':
          prevSlide();
          return;
        case 'first':
        case 'start':
        case 'home':
          goToSlide(0);
          return;
        case 'last':
        case 'end':
          goToStep(steps.length - 1);
          return;
        case 'reveal':
        case 'r':
        case 'move':
        case 'm':
          revealNext();
          return;
        case 'next':
        case 'n':
          nextSlide();
          return;
        // No default - unrecognized commands do nothing
      }
    },
    [goToSlide, goToStep, nextSlide, prevSlide, revealNext, steps.length]
  );

  // Keyboard navigation (when not focused on input)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if focused on input element
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
        case 'PageDown':
        case 'Enter':
        case 'n':
        case 'N':
          e.preventDefault();
          revealNext();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
        case 'Backspace':
        case 'p':
        case 'P':
          e.preventDefault();
          revealPrev();
          break;
        case 'Home':
          e.preventDefault();
          goToSlide(0);
          break;
        case 'End':
          e.preventDefault();
          goToStep(steps.length - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [revealNext, revealPrev, goToSlide, goToStep, steps.length]);

  // Listen for hash changes (browser back/forward, or a hand-edited URL)
  useEffect(() => {
    const handleHashChange = () => {
      const match = window.location.hash.match(/^#slide-(\d+)$/);
      if (!match) return;
      const stepNum = parseInt(match[1], 10) - 1;
      if (stepNum >= 0 && stepNum < steps.length && stepNum !== currentStep) {
        goToStep(stepNum);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [steps.length, currentStep, goToStep]);

  return {
    currentSlide,
    goToSlide,
    goToSlideWithReveal,
    nextSlide,
    prevSlide,
    revealNext,
    revealPrev,
    handleCommand,
    isFirstSlide: currentSlide === 0,
    isLastSlide: currentSlide === totalSlides - 1,
    revealStage,
    currentStep,
    steps,
  };
}
