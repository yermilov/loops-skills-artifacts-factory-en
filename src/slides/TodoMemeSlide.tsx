import { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';

/**
 * The plan everybody has — Patrick's to-do list, as a sheet of paper rather
 * than the cartoon frame: three bullet points that sound like a finished
 * assistant and aren't one. The next slides are what is actually missing.
 *
 * Drawn, not photographed: the SpongeBob frame is somebody's copyright, and
 * the joke is the LIST, not the starfish. The boxes and the underline are
 * drawn with roughjs so the sheet reads as hand-made against a deck that is
 * otherwise all straight edges.
 */

/** The first two are ticked: he has them. The third is the one still open —
 *  and the rest of the talk is about what is NOT on this list at all. */
const ITEMS = [
  { text: 'right system prompt', done: true },
  { text: 'loads of MCP servers', done: true },
  { text: 'Claude Code SDK', done: false },
];

/** roughjs needs a colour value, and raw colours live in tokens.css only. */
function token(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

/** A hand-drawn checkbox, ticked or not. */
function Box({ seed, done }: { seed: number; done: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    svg.replaceChildren();
    const ink = token('--ww-purple', '#3f078d');
    const mark = token('--ww-magenta', '#fc00ab');
    const rc = rough.svg(svg);
    svg.appendChild(
      rc.rectangle(6, 6, 52, 52, { stroke: ink, strokeWidth: 3, roughness: 2.2, seed })
    );
    if (done) {
      // Drawn over the box, the way a tick is: it overshoots the top right.
      svg.appendChild(
        rc.linearPath([[14, 32], [27, 48], [56, 4]], {
          stroke: mark,
          strokeWidth: 5,
          roughness: 1.8,
          seed: seed + 1,
        })
      );
    }
  }, [seed, done]);
  return <svg ref={ref} className="ww-todo__box" width="64" height="64" aria-hidden="true" />;
}

/** The wobbly rule under the heading. */
function Underline() {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    svg.replaceChildren();
    const ink = token('--ww-magenta', '#fc00ab');
    const rc = rough.svg(svg);
    svg.appendChild(rc.line(8, 10, 652, 14, { stroke: ink, strokeWidth: 5, roughness: 2.4, seed: 3 }));
  }, []);
  return <svg ref={ref} className="ww-todo__rule" width="660" height="24" aria-hidden="true" />;
}

export const TodoMemeSlide: SlideDefinition = {
  id: 'todo-meme',
  content: () => (
    <>
      <CornerRings corner="bottom-left" />
      <div className="ww-todo">
        <div className="ww-todo__sheet">
          <h2 className="ww-todo__title">My AI assistant</h2>
          <Underline />
          <ul className="ww-todo__list">
            {ITEMS.map((item, i) => (
              <li key={item.text} className="ww-todo__item">
                <Box seed={11 + i * 7} done={item.done} />
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  ),
  notes:
    'The plan everybody writes down: a good system prompt, a pile of MCP servers, and the SDK — '
    + 'and the first two are already ticked. '
    + 'Say it deadpan — this is the Patrick to-do list, i.e. three things that sound like a '
    + 'finished assistant and are not one. Everything so far on the deck is on this list and it '
    + 'still does nothing on its own: nothing decides WHAT to do, nothing runs while you sleep, '
    + 'nothing reports back, nothing remembers that it already tried. That is the rest of the '
    + 'talk. (The sheet is drawn rather than the cartoon frame — the joke is the list.)',
};
