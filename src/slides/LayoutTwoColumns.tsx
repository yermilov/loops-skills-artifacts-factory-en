import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';

/** Template slide 5: title band + two text columns with caps labels. */
export const LayoutTwoColumns: SlideDefinition = {
  id: 'layout-two-columns',
  title: 'Two columns of text',
  content: (
    <>
      <CornerRings corner="bottom-left" />
      <div className="ww-columns">
        <div>
          <h3>Subtitle</h3>
          <p>
            A short paragraph. Keep it to what you will actually say — the slide is a cue,
            not the script.
          </p>
        </div>
        <div>
          <h3>Subtitle</h3>
          <p>
            A second column for the contrast: before / after, theory / practice, the hype /
            what it does in production.
          </p>
        </div>
      </div>
    </>
  ),
};
