import { SlideDefinition } from '../types/slides';
import dontBelieveClip from '../assets/memento/dont-believe-his-lies.mp4';
import dontBelieve from '../assets/memento/dont-believe-his-lies.jpg';

/** PDF capture has no video playback: export shows the finished note as a still. */
const EXPORT_MODE =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('export') === '1';

/**
 * The question that opens the skills part, over Memento (Christopher Nolan, 2000):
 * Leonard cannot form new memories, so he leaves instructions for the next
 * version of himself — «DON'T BELIEVE HIS LIES», on the back of Teddy's Polaroid —
 * and that version follows them without knowing why. An agent session is the same:
 * the process I just pasted is gone the moment the conversation ends.
 *
 * Clip: Memento, Newmarket Films / Summit Entertainment, 2000 — the ending scene
 * (YouTube w9Q7Loz9j50): he turns Teddy's photo face-down (52.55–53.95 s), then
 * finishes the words (58.4–60.6 s); 3.6 s, played once, holding on the last frame.
 * The poster/export still is the finished note, 24 frames blended. Letterbox cropped.
 * Shown in a talk as commentary.
 */
export const MementoSlide: SlideDefinition = {
  id: 'memento',
  content: (
    <div className="ww-memento">
      {EXPORT_MODE ? (
        <img className="ww-memento__img" src={dontBelieve} alt="Memento (2000): «Don't believe his lies» written on the back of a Polaroid" />
      ) : (
        <video className="ww-memento__img" src={dontBelieveClip} poster={dontBelieve} autoPlay muted playsInline preload="auto" />
      )}
      <div className="ww-memento__q" role="heading" aria-level={2}>
        How do we make sure the agent follows this process every time — without my reminder?
      </div>
    </div>
  ),
  notes:
    'Great — but that process lives only in this one conversation. Next session, it is gone. '
    + 'This is Leonard from Memento: he cannot form new memories, so he writes instructions for the '
    + 'next version of himself — «Don\'t believe his lies», on the back of Teddy\'s Polaroid — and '
    + 'that next version follows them, every time, without remembering why. Every agent session '
    + 'starts like Leonard '
    + 'waking up. So: how do we make sure the agent follows this process every time, without me '
    + 'reminding it? (Still: Memento, Christopher Nolan, 2000.)',
};
