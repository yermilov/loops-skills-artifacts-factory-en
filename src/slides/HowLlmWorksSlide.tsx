import { useEffect, useState } from 'react';
import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';

/**
 * How the thing in that chat window actually works, in three beats.
 *
 * The composition never moves: the model block sits in the middle of all
 * three frames, the panel on its left is always «what the model is given» and
 * the one on its right «what comes out». Only the text in those panels
 * changes — which IS the argument: beat 3 swaps a sentence for a dialogue
 * script and the machine does the same thing it did in beat 1.
 *
 * Beat 1 — it is a language model: give it text, it gives the next token.
 * Beat 2 — append that token and run it again; the text completes itself.
 * Beat 3 — a chat is a preface plus a dialogue script, and the model is
 *          completing the script. The assistant is a character in a text it
 *          is writing one token at a time.
 *
 * Live React rather than a clip (the neighbours are Remotion mp4s): the copy
 * is still being written, and the reveals let him set the pace from the stage.
 *
 * The candidate percentages are illustrative, not measured — said so in the
 * notes, which is where this deck declares that kind of thing.
 */

/** PDF capture must photograph the finished frame, not a half-typed one. */
const EXPORT_MODE =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('export') === '1';

const TICK_MS = 50;
/** One generated token lands every TOKEN_MS — a readable pace, not a real one. */
const TOKEN_MS = 280;
/**
 * Beat 1, in the order the mechanism actually runs: the model scores every
 * token it could say next (the distribution), and only THEN is one of them
 * picked. Showing the chosen token first would tell the story backwards.
 */
const CANDIDATES_MS = 500;
const FIRST_TOKEN_MS = 1200;
/**
 * …and then, still on beat 1, the token leaves the output panel and lands at
 * the end of the text on the left. That flight IS the mechanism: the answer is
 * not kept anywhere, it is appended to the input. Beat 2 opens with it already
 * landed and just keeps going, so the click adds speed, not a new idea.
 */
const FLY_MS = 2600;

/**
 * The end-of-text token — GPT-2/GPT-3's real one, spelled exactly as the
 * tokenizer spells it. It is how the loop STOPS: the model emits it like any
 * other token, and whoever is running the loop stops asking for more. In beat
 * 3 it is also what ends the assistant's turn — and the chat window on the
 * right never shows it, which is the same illusion the whole slide is about.
 */
const END = '<|endoftext|>';

/** The prompt, already split the way a tokenizer would roughly split it. */
const PROMPT = ['The', 'capital', 'of', 'France', 'is'];
/** What the loop adds, token by token, until it emits the end of the text. */
const COMPLETION = ['Paris', ',', 'the', 'largest', 'city', 'in', 'the', 'country', '.', END];

const CANDIDATES = [
  { token: 'Paris', share: 0.94 },
  { token: 'the', share: 0.02 },
  { token: 'a', share: 0.01 },
];

const PREFACE = ['You are ChatGPT, a helpful assistant.', 'Answer briefly and politely.'];
const SCRIPT = [
  { who: 'User', text: 'how long do I boil an egg?' },
  { who: 'Assistant', text: 'Seven minutes for a firm yolk.' },
  { who: 'User', text: 'and for a soft one?' },
];
/** The model completes the last, empty «Assistant:» line — this is that line.
 *  It ends with END, which is what hands the turn back to you. */
const REPLY = ['Four', 'minutes,', 'then', 'cold', 'water.', END];

/**
 * The scene's only clock, restarted whenever the beat changes so each reveal
 * plays its own animation. Everything below is a pure function of it, so a
 * frame looks the same every time the beat is opened.
 */
function useClock(resetKey: number): number {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (EXPORT_MODE) {
      setT(Number.MAX_SAFE_INTEGER);
      return;
    }
    setT(0);
    const id = setInterval(() => setT((v) => v + TICK_MS), TICK_MS);
    return () => clearInterval(id);
  }, [resetKey]);
  return t;
}

/** How many of a list's tokens have arrived by `t`. */
const arrived = (count: number, t: number, start: number) =>
  Math.max(0, Math.min(count, Math.floor((t - start) / TOKEN_MS) + 1));

function Tokens({
  given,
  generated,
  caret,
  landing,
}: {
  given: string[];
  generated: string[];
  caret: boolean;
  /** Index of the token that has just flown in from the output panel. */
  landing?: number;
}) {
  return (
    <div className="ww-llm__tokens">
      {given.map((token, i) => (
        <span key={`g${i}`} className="ww-llm__token">
          {token}
        </span>
      ))}
      {generated.map((token, i) => (
        <span
          key={`n${i}`}
          className={
            `ww-llm__token ww-llm__token--${token === END ? 'end' : 'new'}`
            + (i === landing ? ' ww-llm__token--land' : '')
          }
        >
          {token}
        </span>
      ))}
      {caret && <span className="ww-llm__caret" />}
    </div>
  );
}

function LlmScene({ stage }: { stage: number }) {
  const t = useClock(stage);

  // Beat 1 ends with the first token landing on the left; beat 2 carries the
  // loop on from there; beat 3 runs it over the reply instead.
  const landed = stage === 1 && t >= FLY_MS ? 1 : 0;
  const completionCount =
    stage >= 3
      ? COMPLETION.length
      : stage === 2
        ? 1 + arrived(COMPLETION.length - 1, t, TOKEN_MS)
        : landed;
  const replyCount = stage >= 3 ? arrived(REPLY.length, t, FIRST_TOKEN_MS) : 0;

  // The chip on the right is the token the model has just produced: the first
  // one in beat 1 (until it flies off to the left), and then whichever the
  // loop is on.
  // Beat 2 opens with nothing on the right: `Paris` flew into the text at the
  // end of beat 1, so the panel is empty until the loop produces the NEXT one.
  const liveToken =
    stage >= 3
      ? REPLY[Math.max(0, replyCount - 1)]
      : stage === 2
        ? (completionCount > 1 ? COMPLETION[completionCount - 1] : null)
        : t >= FIRST_TOKEN_MS
          ? COMPLETION[0]
          : null;
  const flying = stage === 1 && t >= FLY_MS;

  const looping = stage === 2 ? completionCount < COMPLETION.length : stage >= 3 && replyCount < REPLY.length;

  return (
    <div className={`ww-llm${stage >= 3 ? ' ww-llm--chat' : ''}`}>
      <div className="ww-llm__panel">
        <h3 className="ww-llm__label">What the model is given</h3>
        {stage >= 3 ? (
          <div className="ww-llm__script">
            {PREFACE.map((line) => (
              <div key={line} className="ww-llm__pre">
                {line}
              </div>
            ))}
            {SCRIPT.map(({ who, text }) => (
              <div key={who + text} className="ww-llm__line">
                <span className="ww-llm__who">{who}:</span> {text}
              </div>
            ))}
            <div className="ww-llm__line">
              <span className="ww-llm__who">Assistant:</span>{' '}
              {REPLY.slice(0, replyCount).map((token, i) => (
                <span
                  key={i}
                  className={`ww-llm__token ww-llm__token--${token === END ? 'end' : 'new'}`}
                >
                  {token}
                </span>
              ))}
              {looping && <span className="ww-llm__caret" />}
            </div>
          </div>
        ) : (
          <Tokens
            given={PROMPT}
            generated={COMPLETION.slice(0, completionCount)}
            caret={stage < 2 || looping}
            landing={stage === 1 ? 0 : undefined}
          />
        )}
      </div>

      <div className="ww-llm__engine">
        <span className="ww-llm__arrow" aria-hidden="true">
          →
        </span>
      </div>

      <div className="ww-llm__panel ww-llm__panel--out">
        <h3 className="ww-llm__label">{stage >= 3 ? 'What you see' : 'The next token'}</h3>
        {stage >= 3 ? (
          <div className="ww-llm__chat">
            {SCRIPT.map(({ who, text }) => (
              <div
                key={who + text}
                className={`ww-llm__bubble ww-llm__bubble--${who === 'User' ? 'user' : 'bot'}`}
              >
                {text}
              </div>
            ))}
            <div className="ww-llm__bubble ww-llm__bubble--bot">
              {REPLY.slice(0, replyCount).filter((token) => token !== END).join(' ')}
              {looping && <span className="ww-llm__caret" />}
            </div>
          </div>
        ) : (
          <>
            {t >= CANDIDATES_MS && stage < 2 && (
              <div className="ww-llm__cands">
                {CANDIDATES.map(({ token, share }) => (
                  <div key={token} className="ww-llm__cand">
                    <span className="ww-llm__token">{token}</span>
                    <span className="ww-llm__bar" style={{ width: `${Math.round(share * 100)}%` }} />
                    <span className="ww-llm__share">{Math.round(share * 100)}%</span>
                  </div>
                ))}
              </div>
            )}
            <div className="ww-llm__out">
              {liveToken ? (
                <span
                  className={
                    `ww-llm__token ww-llm__token--${liveToken === END ? 'end' : 'new'} ww-llm__token--out`
                    + (flying ? ' ww-llm__token--fly' : '')
                  }
                >
                  {liveToken}
                </span>
              ) : (
                <span className="ww-llm__caret" />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export const HowLlmWorksSlide: SlideDefinition = {
  id: 'how-llm-works',
  // The machine used to be a purple block in the middle of the row; it is the
  // title now, so the row is just text in, text out, and the thing doing it is
  // said once, at the top.
  title: (
    <>
      Language model <span className="ww-llm__titlesub">— predicts the next token</span>
    </>
  ),
  maxRevealStages: 3,
  initialRevealStage: 1,
  content: ({ revealStage }) => (
    <>
      <CornerRings corner="top-right" />
      <LlmScene stage={revealStage} />
    </>
  ),
  notes:
    'Beat 1 — it is a LANGUAGE model, nothing more: you hand it text, it hands back one token, '
    + 'the most likely continuation. It scores every token it could say next — that is the '
    + 'distribution on the right — and one of them is then picked; the percentages are '
    + 'illustrative, not measured. Then watch where the token goes: it is appended to the text, '
    + 'which is the whole of beat 2. '
    + 'Beat 2 — the only trick: append that token to the text and run it again. Token by token '
    + 'the text completes itself. There is no plan and no answer, just the next token, over and over. '
    + 'It stops because it predicts <|endoftext|> — the real GPT-2/GPT-3 end-of-text token, one more '
    + 'token like any other; whoever runs the loop sees it and stops asking. '
    + 'Beat 3 — so where does the assistant come from? The machine in the middle has not changed. '
    + 'What changed is the text: a preface («You are ChatGPT, a helpful assistant»), then a script '
    + 'of a dialogue, ending on an empty «Assistant:» line. The model completes THAT line — and the '
    + 'app on the right draws the completion as a bubble — and it never draws the end token, which '
    + 'is what hands the turn back to you (chat formats have their own, <|im_end|>). '
    + 'Nobody is talking to you: it is writing '
    + 'the next line of a script in which one of the characters is helpful. Everything in this talk '
    + 'is built on top of this one mechanism.',
};
