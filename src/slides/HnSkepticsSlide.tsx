import { SlideDefinition } from '../types/slides';

/**
 * 2023, the other half of the room: what Hacker News answered when ArenaSource
 * said «put GPT-4 on a loop with a shell and it finishes the job» (the clip
 * before this slide). Drawn as the HN page it happened on, like the clips.
 *
 * Drawn as the two real threads, in their real nesting. Every line is a short
 * VERBATIM excerpt («…» marks a cut), attributed, from
 * news.ycombinator.com — the replies under item 35328514 (27 Mar 2023, «Retrieval
 * in LangChain»), plus the one reply under the same author's next plug of
 * gpt-shell, item 35490810 (8 Apr 2023, «Show HN: ChatGDB»). Typos are the authors'.
 */

/** One HN comment. `context`: a parent shown so the reply sits where it really
 *  sat — dimmer and smaller; the replies the slide is about are full size. */
type Comment = { who: string; when: string; text: string; context?: boolean; replies?: Comment[] };

/** Two real threads, in their real nesting (who replied to whom), trimmed to the
 *  four replies that land best on stage plus the comments they answered. */
const THREADS: { on: string; root: Comment }[] = [
  {
    on: 'Show HN: ChatGDB',
    root: {
      who: 'ArenaSource',
      when: 'April 7, 2023',
      text: 'If you feel brave and have credits to burn https://github.com/jla/gpt-shell (shameless auto-promotion) …',
      context: true,
      replies: [
        {
          who: 'gumballindie',
          when: 'April 8, 2023',
          text: 'This is [hilarious] - it’s actions are either [outright wrong] or already supported by the native shell itself.',
        },
      ],
    },
  },
  {
    on: 'Retrieval in LangChain',
    root: {
      who: 'ArenaSource',
      when: 'March 27, 2023',
      text: 'If you put GPT-4 on a loop with access to the shell it manages to do whatever is needed to finish the job',
      context: true,
      replies: [
        {
          who: 'hellcow',
          when: 'March 27, 2023',
          text: 'My experience with GPT-4 has been really disappointing. It didn’t feel like a step up from 3.5. …',
          context: true,
          replies: [
            {
              who: 'dragonwriter',
              when: 'March 27, 2023',
              text: '… you are, in effect, hoping it will fill in gaps in missing data, prompting [hallucinations].',
            },
            {
              who: 'roflyear',
              when: 'March 27, 2023',
              text: '… It is really good at chess actually. But [not programming].',
            },
            {
              who: 'VectorLock',
              when: 'March 27, 2023',
              text: 'GPT-4 is [just regurgitating] what its “learned” from previously scraped content on the Internet. …',
            },
          ],
        },
      ],
    },
  },
];

/** `[words]` in a reply are marked with a highlighter, the way a reviewer's
 *  pull-quote is: the marker sweeps over them just after the comment appears. */
function Marked({ text, delay }: { text: string; delay: number }) {
  return (
    <>
      {text.split(/(\[[^\]]+\])/).map((part, i) =>
        part.startsWith('[') ? (
          <mark key={i} className="ww-hn__mark" style={{ animationDelay: `${delay + 450}ms` }}>
            {part.slice(1, -1)}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

/** The replies fade in one after another, in reading order. */
let order = 0;
function Thread({ c, depth, on }: { c: Comment; depth: number; on?: string }) {
  const delay = c.context ? 0 : 150 + order++ * 260;
  return (
    <>
      <div
        className={`ww-hn__comment${c.context ? ' ww-hn__comment--context' : ''}`}
        style={{ marginLeft: `calc(${depth} * var(--hn-indent))`, animationDelay: `${delay}ms` }}
      >
        <div className="ww-hn__meta">
          <span className="ww-hn__vote" aria-hidden="true">▲</span> {c.who} on {c.when} |{' '}
          {on ? `on: ${on}` : 'parent | next'} [–]
        </div>
        <div className="ww-hn__text">
          <Marked text={c.text} delay={delay} />
        </div>
      </div>
      {c.replies?.map((r) => <Thread key={r.who} c={r} depth={depth + 1} />)}
    </>
  );
}

export const HnSkepticsSlide: SlideDefinition = {
  id: 'history-2023-skeptics',
  content: () => {
    order = 0;
    return (
      <div className="ww-hn">
        <div className="ww-hn__bar">
          <span className="ww-hn__y">Y</span>
          <span className="ww-hn__name">Hacker News</span>
        </div>
        <div className="ww-hn__page">
          {THREADS.map(({ on, root }) => (
            <div key={on} className="ww-hn__thread">
              <Thread c={root} depth={0} on={on} />
            </div>
          ))}
        </div>
      </div>
    );
  },
  notes:
    'And the replies. For every «it finishes the job» there was this — «hilarious: either wrong or '
    + 'something the shell already does», good at chess but not programming, just regurgitating the '
    + 'internet, hallucinations to fill the gaps. Both halves were right in '
    + '2023. Sources, verbatim excerpts: Hacker News item 35328514 and its replies (27 March 2023, the '
    + '«Retrieval in LangChain» thread), and item 35490810 (8 April 2023, under «Show HN: ChatGDB»).',
};
