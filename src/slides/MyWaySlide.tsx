import { SlideDefinition } from '../types/slides';
import { CornerRings, Reveal } from '../components/wawtech';

/**
 * The pivot. Everything before this was somebody else's harness — mine,
 * Steinberger's, or one off the shelf. This is where the talk turns: the
 * engineer's answer is neither «write the harness» nor «buy the harness»,
 * it is «there is enough lying around already».
 *
 * The template's statement layout (page 19), because this is the one
 * sentence the room should carry into the second half.
 */

export const MyWaySlide: SlideDefinition = {
  id: 'my-way',
  maxRevealStages: 2,
  initialRevealStage: 1,
  content: ({ revealStage }) => (
    <>
      <CornerRings corner="bottom-left" />
      <CornerRings corner="top-right" />
      <div className="ww-statement ww-myway">
        <div className="ww-block">
          But I am an engineer. So I did the engineer thing:
          <br />
          I assembled mine out of the parts already lying around.
        </div>
        <Reveal at={2} stage={revealStage}>
          <p className="ww-myway__sub">
            No new harness. Nothing to keep up with. Everything in it was already on the machine,
            doing something else.
          </p>
        </Reveal>
      </div>
    </>
  ),
  notes:
    'The turn of the talk. Two options have been on the screen so far and I took neither: write '
    + 'the whole harness yourself, which is a full-time job and a personality type, or install '
    + 'one off the shelf and live in somebody else\'s idea of an assistant. '
    + 'The third option is the engineer\'s one, and it is the only one that was ever realistic '
    + 'for me: everything I needed was already lying around — an agent I already pay for and '
    + 'already trust with my code, a machine that is already on, a queue, a protocol for tools, '
    + 'a way to write things down. None of it was built for this. All of it fits together. '
    + 'Say the second line slowly: no new harness, nothing to keep up with. That is the answer '
    + 'to the slide where I was catching up with Claude Code every week. '
    + 'And then: here is what those parts are.',
};
