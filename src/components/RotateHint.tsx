/**
 * Portrait-orientation hint shown only on small screens.
 * The deck is calibrated for landscape; in portrait on a phone the long
 * axis of the device is wasted and chrome (.input-bar, useTouchNavigation
 * zone math) lives outside any stage transform and assumes portrait means
 * thin vertical strip. Cheaper and more reliable: ask the user to rotate.
 */
export function RotateHint() {
  return (
    <div className="rotate-hint" aria-hidden="true">
      <div className="rotate-hint__icon">⤺</div>
      <div className="rotate-hint__text">Rotate your phone for the full view</div>
    </div>
  );
}
