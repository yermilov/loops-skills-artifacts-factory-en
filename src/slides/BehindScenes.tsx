import { EXPORT_MODE, clamp01, seg } from '../components/ctxScene';
import portrait from '../assets/about/yaroslav.jpg';
import { useLoopClock } from './FactoryFloorSlide';
import { BEATS, Beat, STATS } from './behindScenesData';

/**
 * The encore on the closing slide: a film of how this very deck was made (Yarik,
 * 17.11.2026: «зроби довгий фільм behind the scenes як я в інтерфейсі myclaw +
 * claude code працював над цією презентацією; використовуй мої справжні промпти,
 * справжні відповіді моделі; цілься щоб це разом вийшло хоча б на 3-5 хвилин»).
 *
 * Nothing in it is written for the slide: every prompt is one he typed — on the
 * task's page in the assistant's web app, or into a Claude Code pane — and every
 * reply is the start of what the model answered, both as they were, in the
 * language they were in (`behindScenesData.ts`, cut from the task's sessions).
 * Next to a reply comes the slide that exchange produced, as it stands today.
 *
 * It plays by itself on one clock and loops: a beat is the prompt being typed,
 * the reply streaming in, the slide arriving, a pause. The PDF gets one beat,
 * complete. Styles are `.ww-bts…`.
 */

const TYPE = 26; // ms per character of a prompt
const STREAM = 7; // ms per character of a reply
const THINK = 500;
const HOLD = 2600;
const FADE = 350;

const thumbs = import.meta.glob<string>('../assets/bts/*.jpg', { eager: true, import: 'default' });
const thumbOf = (page: number) => thumbs[`../assets/bts/p-${String(page).padStart(2, '0')}.jpg`];

type Timed = Beat & { from: number; typed: number; replied: number; to: number };
const TIMELINE: Timed[] = [];
BEATS.reduce((from, beat) => {
  const typed = from + FADE + Math.min(6500, Math.max(900, beat.prompt.length * TYPE));
  const replied = typed + THINK + Math.min(4200, beat.reply.length * STREAM);
  const to = replied + HOLD;
  TIMELINE.push({ ...beat, from, typed, replied, to });
  return to;
}, 0);
const TOTAL = TIMELINE[TIMELINE.length - 1].to;
/** The PDF's frame: a beat with a slide beside it, finished. */
const EXPORT_BEAT = TIMELINE.find((beat, i) => i > TIMELINE.length / 3 && beat.page !== undefined) ?? TIMELINE[0];

const clock = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;

export function BehindScenes() {
  const t = useLoopClock(EXPORT_BEAT.to - 1) % TOTAL;
  const index = Math.max(0, TIMELINE.findIndex((beat) => t < beat.to));
  const beat = TIMELINE[index];
  const still = EXPORT_MODE;

  const prompt = still ? beat.prompt : beat.prompt.slice(0, Math.round(beat.prompt.length * seg(t, beat.from + FADE, beat.typed - beat.from - FADE)));
  const reply = still ? beat.reply : beat.reply.slice(0, Math.round(beat.reply.length * seg(t, beat.typed + THINK, beat.replied - beat.typed - THINK)));
  const typing = !still && t < beat.typed;
  const thinking = !still && t >= beat.typed && t < beat.typed + THINK;
  const arrived = still ? 1 : seg(t, beat.replied - 500, 500);
  const shown = still ? 1 : seg(t, beat.from, FADE) * (1 - seg(t, beat.to - FADE, FADE));
  const thumb = beat.page === undefined ? undefined : thumbOf(beat.page);

  return (
    <div className="ww-bts" role="img" aria-label={`How I prepared this talk: a film of ${BEATS.length} real prompts and the model's real replies, out of ${STATS.sessions} sessions over ${STATS.days} days`}>
      <div className="ww-bts__film">
        <div className="ww-bts__head">
          <span className="ww-bts__title">How I prepared this talk</span>
          <span className="ww-bts__count">
            {beat.at} · {index + 1}/{TIMELINE.length} · {clock(t)}/{clock(TOTAL)}
          </span>
        </div>
        <div className="ww-bts__bar">
          <span style={{ width: `${(100 * clamp01(t / TOTAL)).toFixed(2)}%` }} />
        </div>

        <div className={`ww-bts__pane ww-bts__pane--${beat.where}`} style={{ opacity: shown.toFixed(2) }}>
          <div className="ww-bts__chrome">
            {beat.where === 'web' ? (
              <>
                <img className="ww-bts__avatar" src={portrait} alt="" />
                <span className="ww-bts__where">myclaw</span>
                <span className="ww-bts__path">task · WAWTech talk · comment</span>
              </>
            ) : (
              <>
                <span className="ww-bts__dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="ww-bts__where">claude code</span>
                <span className="ww-bts__path">~/src/loops-skills-artifacts-factory-en</span>
              </>
            )}
          </div>

          <p className="ww-bts__prompt">
            <span className="ww-bts__mark" aria-hidden="true">
              {beat.where === 'web' ? '@me' : '>'}
            </span>
            {prompt}
            {typing && <span className="ww-bts__caret" aria-hidden="true" />}
          </p>

          <div className="ww-bts__answer">
            <p className="ww-bts__reply">
              <span className="ww-bts__mark ww-bts__mark--agent" aria-hidden="true">
                {thinking ? '…' : reply ? '⏺' : ''}
              </span>
              {reply}
            </p>
            {thumb && (
              <figure className="ww-bts__slide" style={{ opacity: arrived.toFixed(2), transform: `translateX(${((1 - arrived) * 60).toFixed(0)}px) rotate(1.5deg)` }}>
                <img src={thumb} alt="" />
              </figure>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
