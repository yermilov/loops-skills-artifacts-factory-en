import { EXPORT_MODE, seg } from '../components/ctxScene';
import { noise, useLoopClock } from './FactoryFloorSlide';
import { BEATS, Beat, STATS } from './behindScenesData';
import { Comment, SessionFoot } from './ledgerApp';

/**
 * The encore on the closing slide: a film of how this very deck was made (Yarik,
 * 17.11.2026: «зроби довгий фільм behind the scenes як я в інтерфейсі myclaw +
 * claude code працював над цією презентацією; використовуй мої справжні промпти,
 * справжні відповіді моделі; цілься щоб це разом вийшло хоча б на 3-5 хвилин»).
 *
 * Nothing in it is written for the slide: every prompt is one he typed — on the
 * task's page in the assistant's web app, or into a Claude Code pane — and every
 * reply is the start of what the model answered — both in English, translated
 * where they were Ukrainian (`behindScenesData.ts`, cut from the task's sessions).
 * Next to a reply comes the slide that exchange produced, as it stands today.
 * The two interfaces are not drawn again for the film (his ask: «study myclaw
 * and claude code interfaces to make them more realistic»): a Claude Code beat
 * is the deck's own terminal (`.ww-boot…`, BootstrapSlide — the banner, the
 * `>` line, `⏺` tool calls, the prompt box), a web beat is the task page built
 * from `ledgerApp.tsx` (his comment, the «In flight» card, the session report).
 *
 * It plays by itself on one clock and loops: a beat is the prompt being typed,
 * the model's real tool calls ticking past (his ask: «add more of real
 * intermediate steps into each scene») and folding into a tally, the reply
 * streaming in, the slide arriving, a pause, and a burst of white TV
 * static into the next one. No title and no counter on it (his call) — the two
 * QR stands beside it say what it is. The PDF gets one beat, complete. Styles are `.ww-bts…`.
 */

const TYPE = 26; // ms per character of a prompt
const STREAM = 7; // ms per character of a reply
const THINK = 500;
const STEP = 240; // ms per tool call of the work in between
const SEEN = 3; // how many of them are on screen at once
const HOLD = 2600;
const FADE = 350;
const CUT = 260; // ms of static either side of a cut

const thumbs = import.meta.glob<string>('../assets/bts/*.jpg', { eager: true, import: 'default' });
const thumbOf = (page: number) => thumbs[`../assets/bts/p-${String(page).padStart(2, '0')}.jpg`];

type Timed = Beat & { from: number; typed: number; worked: number; replied: number; to: number };
const TIMELINE: Timed[] = [];
BEATS.reduce((from, beat) => {
  const typed = from + FADE + Math.min(6500, Math.max(900, beat.prompt.length * TYPE));
  const worked = typed + THINK + (beat.steps?.length ?? 0) * STEP;
  const replied = worked + Math.min(4200, beat.reply.length * STREAM);
  const to = replied + HOLD;
  TIMELINE.push({ ...beat, from, typed, worked, replied, to });
  return to;
}, 0);
const TOTAL = TIMELINE[TIMELINE.length - 1].to;
/** The PDF's frame: a beat with a slide beside it, finished. */
const EXPORT_BEAT = TIMELINE.find((beat, i) => i > TIMELINE.length / 3 && beat.page !== undefined) ?? TIMELINE[0];

export function BehindScenes() {
  const t = useLoopClock(EXPORT_BEAT.to - 1) % TOTAL;
  const index = Math.max(0, TIMELINE.findIndex((beat) => t < beat.to));
  const beat = TIMELINE[index];
  const still = EXPORT_MODE;

  const prompt = still ? beat.prompt : beat.prompt.slice(0, Math.round(beat.prompt.length * seg(t, beat.from + FADE, beat.typed - beat.from - FADE)));
  const reply = still ? beat.reply : beat.reply.slice(0, Math.round(beat.reply.length * seg(t, beat.worked, beat.replied - beat.worked)));
  // the work in between: the tool calls tick past, and fold into one line once the answer starts
  const steps = beat.steps ?? [];
  const working = !still && t >= beat.typed + THINK && t < beat.worked;
  const done = Math.min(steps.length, Math.floor((t - beat.typed - THINK) / STEP) + 1);
  const answered = still || t >= beat.worked;
  const tally = beat.total ? `${beat.total} tool calls${beat.minutes ? ` · ${beat.minutes} min` : ''}` : '';
  const typing = !still && t < beat.typed;
  const thinking = !still && t >= beat.typed && t < beat.typed + THINK;
  const arrived = still ? 1 : seg(t, beat.replied - 500, 500);
  // between two beats the picture breaks up into static, the way a behind-the-scenes reel cuts
  const cut = still ? 0 : Math.max(1 - seg(t, beat.from, CUT), seg(t, beat.to - CUT, CUT));
  const frame = Math.floor(t / 45);
  const thumb = beat.page === undefined ? undefined : thumbOf(beat.page);

  const pane =
    beat.where === 'code' ? (
      // a Claude Code session, drawn with the deck's own terminal (BootstrapSlide's `.ww-boot…`)
      <div className="ww-boot__term ww-bts__term">
        <div className="ww-boot__chrome">
          <span className="ww-dot ww-dot--red" />
          <span className="ww-dot ww-dot--amber" />
          <span className="ww-dot ww-dot--green" />
          <span className="ww-boot__title">~/src/loops-skills-artifacts-factory-en — claude</span>
        </div>
        <div className="ww-boot__body">
          <div className="ww-boot__you ww-bts__pre">
            <span className="ww-boot__caret">&gt;</span> {prompt}
            {typing && <span className="ww-boot__cursor ww-boot__cursor--inline" />}
          </div>
          {!still &&
            t >= beat.typed + THINK &&
            steps.slice(0, done).map((step, i) => (
              <div key={i} className="ww-boot__tool ww-bts__line">
                <span className={`ww-boot__bullet${i < done - 1 || answered ? ' ww-boot__bullet--done' : ' ww-boot__bullet--busy'}`}>⏺</span> {step}
              </div>
            ))}
          {thinking && (
            <div className="ww-boot__fire">
              <span aria-hidden="true">✻</span> Thinking…
            </div>
          )}
          {answered && tally && (
            <div className="ww-boot__fire">
              <span aria-hidden="true">✻</span> {tally}
            </div>
          )}
          {reply && (
            <div className="ww-boot__say ww-bts__pre">
              <span className="ww-boot__bullet">⏺</span> {reply}
              {!still && t < beat.replied && <span className="ww-boot__cursor ww-boot__cursor--inline" />}
            </div>
          )}
        </div>
        <div className="ww-boot__prompt">
          <div className="ww-boot__input">
            <span className="ww-boot__caret">&gt;</span>
            <span className="ww-boot__cursor" />
          </div>
          <div className="ww-boot__hint">? for shortcuts</div>
        </div>
      </div>
    ) : (
      // the task's page in the assistant's web app, drawn with the deck's own pieces of it (ledgerApp.tsx)
      <div className="ww-bts__web">
        <div className="ww-jg__detail ww-bts__thread">
          <span className="ww-jg__title">WAWTech talk</span>
          <Comment who="@me" when={beat.at} plain>
            <span className="ww-bts__pre">
              {prompt}
              {typing && <span className="ww-bts__caret" aria-hidden="true" />}
            </span>
          </Comment>
          {working && steps.length > 0 && (
            <Comment who="Claude Code" tag="In flight" when="now">
              <span className="ww-jg__stream">
                {steps.slice(Math.max(0, done - SEEN), done).map((step, i, seen) => (
                  <span key={done - seen.length + i} className="ww-jg__streamline ww-bts__line">
                    {step}
                  </span>
                ))}
              </span>
            </Comment>
          )}
          {answered && reply && (
            <Comment who="Claude Code" tag="Session report" when="now">
              <span className="ww-bts__pre">{reply}</span>
              {tally && <SessionFoot>{tally}</SessionFoot>}
            </Comment>
          )}
        </div>
      </div>
    );

  return (
    <div className="ww-bts" role="img" aria-label={`How I prepared this talk: a film of ${BEATS.length} real prompts and the model's real replies, out of ${STATS.sessions} sessions over ${STATS.days} days`}>
      <div className="ww-bts__film">
        {pane}
        {thumb && (
          <figure className={`ww-bts__slide ww-bts__slide--${beat.where}`} style={{ opacity: arrived.toFixed(2), transform: `translateX(${((1 - arrived) * 60).toFixed(0)}px) rotate(1.5deg)` }}>
            <img src={thumb} alt="" />
          </figure>
        )}
        {cut > 0 && (
          <svg className="ww-bts__static" aria-hidden="true" style={{ opacity: Math.min(1, cut * 1.6).toFixed(2) }}>
            <filter id="ww-bts-snow" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.85 0.55" numOctaves="2" seed={frame} />
              <feColorMatrix type="matrix" values="2.6 0 0 0 -0.75  2.6 0 0 0 -0.75  2.6 0 0 0 -0.75  0 0 0 0 1" />
            </filter>
            <rect width="100%" height="100%" filter="url(#ww-bts-snow)" />
            {/* two bands of tear that jump from frame to frame */}
            <rect className="ww-bts__tear" x="0" y={`${(100 * noise(frame, 1)).toFixed(1)}%`} width="100%" height="5%" />
            <rect className="ww-bts__tear" x="0" y={`${(100 * noise(frame, 2)).toFixed(1)}%`} width="100%" height="2%" />
          </svg>
        )}
      </div>
    </div>
  );
}
