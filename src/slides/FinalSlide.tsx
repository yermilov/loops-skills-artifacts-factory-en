import { QrLink } from '../components/QrLink';
import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';
import { ThankStickers } from '../components/HelloStickers';
import portrait from '../assets/about/yaroslav.jpg';
import { BehindScenes } from './BehindScenes';

const LINKEDIN_URL = 'https://www.linkedin.com/in/yarik-yermilov/';
const SLIDES_URL = 'https://yermilov.github.io/loops-skills-artifacts-factory-en/';

/** The close, and the encore beside it (Yarik, 17.11.2026: «обєднаємо … зліва будуть qr коди,
 *  а справа стаб де я буду показувати наче на біс How I prepared this talk»). Then, same day: «зліва мій код,
 *  справа слайди, а по центру як я робив цю презентацію». Left: me on LinkedIn (the about-me
 *  stand: photo, handle, blue QR). Right: these slides (QR only; the URL is too long to read
 *  off a screen). Centre: the encore — a film of how this deck was made, cut from the
 *  task's real sessions (`BehindScenes.tsx`). «Thank you» stickers — the about-me
 *  slide's «hello» pack — run across the top and the bottom. */
export const FinalSlide: SlideDefinition = {
  id: 'final',
  content: (
    <>
      <CornerRings corner="top-right" />
      <div className="ww-final">
        <ThankStickers group="top" />

        <div className="ww-final__stands">
          <div className="ww-final__stand">
            <div className="ww-final__head">
              <img className="ww-about__photo ww-final__photo" src={portrait} alt="Yaroslav Yermilov" />
              <div className="ww-about__qr-text">
                <span className="ww-about__in" aria-hidden="true">in</span>
                <span>yarik-yermilov</span>
              </div>
            </div>
            <QrLink
              className="ww-final__qr"
              value={LINKEDIN_URL}
              size={300}
              level="M"
              fgColor="var(--ww-linkedin)"
              bgColor="var(--ww-white)"
              title="QR code: Yaroslav Yermilov on LinkedIn"
            />
          </div>

          <div className="ww-final__encore">
            <BehindScenes />
          </div>

          <div className="ww-final__stand">
            <div className="ww-final__head ww-final__head--slides">
              <div className="ww-final__label">these slides</div>
            </div>
            <QrLink
              className="ww-final__qr"
              value={SLIDES_URL}
              size={300}
              level="M"
              fgColor="var(--ww-purple)"
              bgColor="var(--ww-white)"
              title="QR code: these slides"
            />
          </div>
        </div>

        <ThankStickers group="bottom" />
      </div>
    </>
  ),
  notes:
    'Closing slide. 45-minute slot, no Q&A. Thank you — on the left, me on LinkedIn; on the right, '
    + 'these slides, everything in them is live. And while you scan, an encore in the middle: how I '
    + 'prepared this talk — with the same assistant. It is a film that plays by itself and loops, '
    + 'about five minutes: every prompt in it is one I really typed — on the task page in myclaw '
    + 'or in a Claude Code pane — and every answer is what the model really said, with the slide '
    + 'that came out of it. Leave it running while people scan.',
};
