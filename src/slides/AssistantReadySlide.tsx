import { SlideDefinition } from '../types/slides';
import wakesClip from '../assets/assistant/c3po-wakes.mp4';
import isntHeGreat from '../assets/assistant/c3po-isnt-he-great.jpg';

/** PDF capture has no video playback: export shows the last frame as a still. */
const EXPORT_MODE =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('export') === '1';

/**
 * «Our barebones AI assistant is ready» — the announcement, full bleed, before the
 * session that tests it (AssistantSessionSlide, which has no title band of its own).
 * The picture is the workshop scene of Star Wars: Episode I — The Phantom Menace
 * (Lucasfilm, 1999): the boy who built C-3PO out of spare parts switches him on —
 * «isn't he great? He's not finished yet». Which is the whole next slide: three
 * things that are great, and four that are not finished.
 *
 * Clip: ONE shot, 5.6 s, silent, played once and holding on its last frame — the
 * boy's hand on the droid's head, the eyes light up, he looks about, turns to Padmé
 * and back to the camera. From the compilation «C-3PO Prequel Trilogy» (YouTube
 * QZ257peBilo, 1080p), 0:10.6–0:16.2, recorded off the playing video on 13.11.2026
 * and cut one frame inside each edit. The poster / export still is its last frame.
 * Shown in a talk as commentary, like the Memento clip.
 */
const ALT = 'The Phantom Menace (1999): the half-built C-3PO, eyes lit, between Padmé and the boy who made him';

export const AssistantReadySlide: SlideDefinition = {
  id: 'assistant-ready',
  content: (
    <div className="ww-ready">
      {EXPORT_MODE ? (
        <img className="ww-ready__img" src={isntHeGreat} alt={ALT} />
      ) : (
        <video
          className="ww-ready__img"
          src={wakesClip}
          poster={isntHeGreat}
          aria-label={ALT}
          autoPlay
          muted
          playsInline
          preload="auto"
        />
      )}
      <div className="ww-ready__title" role="heading" aria-level={2}>
        Our barebones AI assistant is ready
      </div>
    </div>
  ),
  notes:
    'And that is it. Claude Code, a CLAUDE.md, a loop and a task queue: our barebones AI '
    + 'assistant is ready. (Let the clip play — five seconds: he is switched on, looks around.) '
    + 'This is Anakin, nine years old, showing off the droid he built out of spare parts — '
    + '«isn\'t he great? He\'s not finished yet.» Both halves of that line are the next slide: '
    + 'what is great about it, and what is not finished. '
    + '(The Phantom Menace, Lucasfilm, 1999.)',
};
