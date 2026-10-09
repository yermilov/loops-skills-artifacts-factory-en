import { SlideDefinition } from '../types/slides';
import { Block, CornerRings } from '../components/wawtech';

/** Template slide 17: one huge mint number on a tall purple block. */
export const LayoutBigNumber: SlideDefinition = {
  id: 'layout-big-number',
  content: (
    <>
      <CornerRings corner="top-right" />
      <div className="ww-bignum__aside">
        <h2>One number, said out loud</h2>
      </div>
      <div className="ww-bignum">
        <Block className="ww-bignum__main">
          <div className="ww-bignum__value">96%</div>
          <div>What the number measures</div>
        </Block>
        <Block className="ww-bignum__side">
          <div>And what it is compared against</div>
        </Block>
      </div>
    </>
  ),
};
