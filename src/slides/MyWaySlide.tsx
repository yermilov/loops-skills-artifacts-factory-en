import { SlideDefinition } from '../types/slides';
import meme from '../assets/history/something-of-an-engineer.jpg';

/**
 * The pivot, as a meme: Norman Osborn's «You know, I'm something of a
 * scientist myself» (Spider-Man, 2002), with the job swapped. Everything before
 * this was somebody else's harness — mine, Steinberger's, or one off the shelf;
 * the engineer's answer is to assemble one out of the parts already lying
 * around. The job title is set warped (an SVG displacement filter), as asked.
 * The frame is the imgflip template 133946291 (i.imgflip.com/27qxmb.jpg,
 * 1200×600); the caption is set in the deck's own type, not baked in.
 */

export const MyWaySlide: SlideDefinition = {
  id: 'my-way',
  content: () => (
    <div className="ww-myway">
      {/* the warp for the job title: fractal noise displacing the glyphs, so the
          words look smeared rather than set — no extra font file to ship */}
      <svg className="ww-myway__defs" aria-hidden="true">
        <filter id="ww-myway-warp" x="-5%" y="-20%" width="110%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.06" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="30" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <img className="ww-myway__img" src={meme} alt="Willem Dafoe as Norman Osborn, smiling" />
      <p className="ww-myway__caption">
        You know, I’m something of an
        <br />
        <span className="ww-myway__warp">AI-native Engineer</span> myself
      </p>
    </div>
  ),
  notes:
    'The turn of the talk — let the meme land, then say it: but I am an engineer, so I did the '
    + 'engineer thing — I assembled mine out of the parts already lying around. '
    + 'Two options have been on the screen so far and I took neither: write the whole harness '
    + 'yourself, which is a full-time job and a personality type, or install one off the shelf '
    + 'and live in somebody else\'s idea of an assistant. '
    + 'The third option is the engineer\'s one, and it is the only one that was ever realistic '
    + 'for me: everything I needed was already lying around — an agent I already pay for and '
    + 'already trust with my code, a machine that is already on, a queue, a protocol for tools, '
    + 'a way to write things down. None of it was built for this. All of it fits together. '
    + 'No new harness, nothing to keep up with — the answer to the slide where I was catching up '
    + 'with Claude Code every week. And then: here is what those parts are.',
};
