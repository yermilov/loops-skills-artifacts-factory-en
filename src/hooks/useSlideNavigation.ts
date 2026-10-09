import { useState, useCallback, useEffect, useRef } from 'react';
import { SlideDefinition } from '../types/slides';

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
}

export function useSlideNavigation(
  slides: SlideDefinition[],
  initialSlide: number = 0
): UseSlideNavigationReturn {
  const totalSlides = slides.length;

  // Parse initial slide from URL hash if present
  const getInitialSlide = (): number => {
    if (typeof window === 'undefined') return initialSlide;
    const hash = window.location.hash;
    const match = hash.match(/^#slide-(\d+)$/);
    if (match) {
      const slideNum = parseInt(match[1], 10) - 1; // Convert from 1-indexed
      if (slideNum >= 0 && slideNum < totalSlides) {
        return slideNum;
      }
    }
    return initialSlide;
  };

  const [currentSlide, setCurrentSlide] = useState(getInitialSlide);
  const [revealStage, setRevealStage] = useState(
    () => slides[getInitialSlide()]?.initialRevealStage ?? 0
  );

  // Refs to avoid stale closures in the keyboard listener
  const revealStageRef = useRef(0);
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

  // Update URL hash when slide changes
  const updateHash = useCallback((index: number) => {
    if (typeof window === 'undefined') return;
    const newHash = `#slide-${index + 1}`; // Convert to 1-indexed for URL
    if (window.location.hash !== newHash) {
      window.history.replaceState(null, '', newHash);
    }
  }, []);

  // Go to specific slide
  const goToSlide = useCallback(
    (index: number) => {
      const clampedIndex = clampIndex(index);
      // Any explicit jump resets detour state so detours re-arm cleanly.
      detourReturnRef.current = null;
      skipIndicesRef.current.clear();
      detourFiredRef.current.clear();
      setCurrentSlide(clampedIndex);
      setRevealStage(slides[clampedIndex]?.initialRevealStage ?? 0);
      updateHash(clampedIndex);
    },
    [clampIndex, updateHash, slides]
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
      updateHash(clampedIndex);
    },
    [clampIndex, slides, updateHash]
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

  // Roll back reveal stage if any revealed, otherwise go to previous slide
  const revealPrev = useCallback(() => {
    if (revealStageRef.current > 0) {
      setRevealStage(prev => prev - 1);
    } else {
      prevSlide();
    }
  }, [prevSlide]);

  // Parse and handle command input
  const handleCommand = useCallback(
    (command: string) => {
      const trimmed = command.trim().toLowerCase();

      // Empty command - do nothing
      if (!trimmed) return;

      // Check for number (go to specific slide)
      const slideNumber = parseInt(trimmed, 10);
      if (!isNaN(slideNumber) && slideNumber > 0) {
        goToSlide(slideNumber - 1); // Convert from 1-indexed user input
        return;
      }

      // Negative number — N-th slide before the last (e.g. -1 = second to last)
      if (!isNaN(slideNumber) && slideNumber < 0) {
        goToSlide(totalSlides - 1 + slideNumber);
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
          goToSlide(totalSlides - 1);
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
    [goToSlide, nextSlide, prevSlide, revealNext, totalSlides]
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
          goToSlide(totalSlides - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [revealNext, revealPrev, goToSlide, totalSlides]);

  // Listen for hash changes (browser back/forward)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const match = hash.match(/^#slide-(\d+)$/);
      if (match) {
        const slideNum = parseInt(match[1], 10) - 1;
        if (slideNum >= 0 && slideNum < totalSlides && slideNum !== currentSlide) {
          setCurrentSlide(slideNum);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [totalSlides, currentSlide]);

  // Set initial hash on mount
  useEffect(() => {
    updateHash(currentSlide);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
  };
}
