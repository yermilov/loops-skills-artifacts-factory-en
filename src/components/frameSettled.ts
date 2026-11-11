/**
 * «This frame has finished playing» — the signal behind the ready mark in the
 * bottom-right corner, which tells the speaker the next click is safe.
 *
 * A frame is settled when, inside the stage:
 *   - no FINITE CSS animation or transition is still running (a blinking caret
 *     or any other infinite loop is ambient, not «still playing»);
 *   - no non-looping <video> is still loading or playing (the history clips play
 *     once; the Preply loops carry `loop` and are ambient);
 *   - no slide has declared itself busy with `useAnimating(true)`.
 *
 * The last one is for slides that animate on their own JavaScript clock
 * (setInterval / requestAnimationFrame): the browser cannot see when such a
 * timeline ends, so the slide says so itself, from the same state it renders.
 */
import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';

const busy = new Set<string>();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

/** Declare this component «still playing» while `active` is true. */
export function useAnimating(active: boolean): void {
  const id = useId();
  useEffect(() => {
    if (!active) return;
    busy.add(id);
    emit();
    return () => {
      busy.delete(id);
      emit();
    };
  }, [active, id]);
}

function useAnyAnimating(): boolean {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => busy.size > 0,
  );
}

function stageIsMoving(host: Element | null): boolean {
  if (!host) return false;
  const running = host.getAnimations({ subtree: true }).some((animation) => {
    if (animation.playState !== 'running') return false;
    const end = animation.effect?.getComputedTiming().endTime;
    return typeof end === 'number' && Number.isFinite(end);
  });
  if (running) return true;
  // A one-shot clip is busy until it has ENDED: an autoplay clip that is still loading
  // reports paused (and readyState 0), which must not read as «finished». A clip that
  // failed to load cannot finish, so it does not hold the mark forever.
  return Array.from(host.querySelectorAll('video')).some(
    (video) => !video.loop && !video.ended && !video.error && (video.autoplay || !video.paused),
  );
}

/** Polled, because CSS animations and video playback have no single «all
 *  done» event. A short floor after every frame change keeps the mark from
 *  flashing before a reveal's own fade has even started. */
const POLL_MS = 150;
const FLOOR_MS = 400;

/** True once the current frame (`frameKey`) has finished playing. */
export function useFrameSettled(frameKey: number, hostRef: React.RefObject<Element | null>): boolean {
  const anyAnimating = useAnyAnimating();
  const animatingRef = useRef(anyAnimating);
  animatingRef.current = anyAnimating;
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    setSettled(false);
    const since = performance.now();
    const id = window.setInterval(() => {
      const quiet =
        performance.now() - since >= FLOOR_MS && !animatingRef.current && !stageIsMoving(hostRef.current);
      setSettled(quiet);
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [frameKey, hostRef]);

  return settled && !anyAnimating;
}
