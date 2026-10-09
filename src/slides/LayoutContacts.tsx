import { QRCodeSVG } from 'qrcode.react';
import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';

const DECK_URL = 'https://yermilov.github.io/loops-skills-artifacts-factory-en/';

/** Template slide 26: «Get in touch» list + a QR code. The QR points at this deck;
 *  fill in the contact rows. */
export const LayoutContacts: SlideDefinition = {
  id: 'layout-contacts',
  content: (
    <>
      <CornerRings corner="bottom-left" />
      <div className="ww-contacts">
        <div>
          <h2>Get in touch</h2>
          <div className="ww-contacts__list">
            <div className="ww-contacts__row"><span className="ww-contacts__dot" />LinkedIn — fill in</div>
            <div className="ww-contacts__row"><span className="ww-contacts__dot" />Website — fill in</div>
            <div className="ww-contacts__row"><span className="ww-contacts__dot" />Slides — this QR</div>
          </div>
        </div>
        <div className="ww-contacts__qr">
          <QRCodeSVG value={DECK_URL} size={480} fgColor="var(--ww-purple)" bgColor="var(--ww-white)" />
        </div>
      </div>
    </>
  ),
};
