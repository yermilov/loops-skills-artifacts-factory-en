import { QRCodeSVG } from 'qrcode.react';
import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';
import { ThankStickers } from '../components/HelloStickers';
import portrait from '../assets/about/yaroslav.jpg';

const LINKEDIN_URL = 'https://www.linkedin.com/in/yarik-yermilov/';
const SLIDES_URL = 'https://yermilov.github.io/loops-skills-artifacts-factory-en/';

/** The close: «thank you» die-cut stickers — the about-me slide's «hello» pack, in the same
 *  nations — framing two things to scan: me on LinkedIn (the about-me stand: photo, handle,
 *  blue QR) and these slides (QR only; the URL is too long to be worth reading off a screen). */
export const FinalSlide: SlideDefinition = {
  id: 'final',
  content: (
    <>
      <CornerRings corner="top-right" />
      <div className="ww-final">
        <ThankStickers group="top" />

        <div className="ww-final__stands">
          <ThankStickers group="left" />

          <div className="ww-final__stand">
            <div className="ww-final__head">
              <img className="ww-about__photo ww-final__photo" src={portrait} alt="Yaroslav Yermilov" />
              <div className="ww-about__qr-text">
                <span className="ww-about__in" aria-hidden="true">in</span>
                <span>yarik-yermilov</span>
              </div>
            </div>
            <QRCodeSVG
              className="ww-final__qr"
              value={LINKEDIN_URL}
              size={420}
              level="M"
              fgColor="var(--ww-linkedin)"
              bgColor="var(--ww-white)"
              title="QR code: Yaroslav Yermilov on LinkedIn"
            />
          </div>

          <ThankStickers group="mid" />

          <div className="ww-final__stand">
            <div className="ww-final__head ww-final__head--slides">
              <div className="ww-final__label">these slides</div>
            </div>
            <QRCodeSVG
              className="ww-final__qr"
              value={SLIDES_URL}
              size={420}
              level="M"
              fgColor="var(--ww-purple)"
              bgColor="var(--ww-white)"
              title="QR code: these slides"
            />
          </div>

          <ThankStickers group="right" />
        </div>

        <ThankStickers group="bottom" />
      </div>
    </>
  ),
  notes:
    'Closing slide. 45-minute slot, no Q&A. Thank you — on the left, me on LinkedIn; on the right, '
    + 'these slides, everything in them is live.',
};
