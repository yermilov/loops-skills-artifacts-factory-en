import { ReactNode, useEffect } from 'react';
import { exportRegistry } from './exportRegistry';

interface SlideProps {
  children: ReactNode;
  isActive?: boolean;
  notes?: string;
  background?: string;
  /** Threaded so non-async slides can auto-settle via exportRegistry. */
  slideId?: string;
  asyncSettle?: boolean;
  /** Optional title rendered as a fixed top-left band above the slide body. */
  title?: ReactNode;
}

export function Slide({
  children,
  isActive = true,
  background,
  slideId,
  asyncSettle,
  title,
}: SlideProps) {
  // Auto-settle on mount for slides that don't do their own async work.
  // Slides with `asyncSettle: true` opt out and call markSlideSettled themselves.
  useEffect(() => {
    if (!isActive || asyncSettle || !slideId) return;
    exportRegistry.markSlideSettled(slideId);
    exportRegistry.retainMounted(slideId);
    return () => exportRegistry.releaseMounted(slideId);
  }, [isActive, asyncSettle, slideId]);

  if (!isActive) return null;

  return (
    <div className="stage">
      <div
        className={title ? 'slide slide--titled' : 'slide'}
        style={background ? { background } : undefined}
      >
        {title && <h2 className="slide-title">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
