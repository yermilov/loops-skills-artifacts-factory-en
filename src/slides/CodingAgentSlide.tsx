import { useEffect, useState } from 'react';
import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';

/**
 * How a coding agent works — the same composition as `HowLlmWorksSlide`, on
 * purpose: the text the model is given on the left, what the human sees on
 * the right, and nothing in the middle but an arrow. Two slides earlier the
 * audience watched Claude Code ask permission to run `npm test`; this one
 * says what was actually going on in the text while that happened.
 *
 * Beat 1 — the text opens with a preface, exactly like the chat did:
 *          «You are Claude Code, a coding assistant.»
 * Beat 2 — the preface DECLARES a tool: write this, and I will paste the
 *          file's contents back into your text.
 * Beat 3 — the same for Edit and Bash. Three sentences, and that is the
 *          entire difference between a chatbot and an agent.
 * Beat 4 — a real turn, playing out: the model writes a tool call, the
 *          HARNESS writes the result back, and that alternation repeats until
 *          the model writes prose instead. On the right, the same thing as
 *          the user sees it — four tidy lines.
 *
 * The honest caveat, which belongs in `notes` and in his mouth rather than on
 * the frame: the real protocol is structured tool-call blocks in the API, not
 * literal <TOOL_CALL> tags in the prompt. The tags here are that mechanism
 * made legible from the back row; everything they stand for is real.
 */

/** PDF capture must photograph the finished turn, not a half-typed one. */
const EXPORT_MODE =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('export') === '1';

const TICK_MS = 50;
/**
 * Beat 4 is a performance, and each actor moves differently — that difference
 * is the content, not decoration:
 *   the user TYPES, one character at a time, because a person is at a keyboard;
 *   the model STREAMS, one token at a time, because that is all it ever does
 *     (the slide before this one just spent three beats on exactly that);
 *   the harness PASTES, whole and at once, because it is a program — and it
 *     pastes only after it has gone away and really done the thing. That
 *     pause is not on a timer: the harness stays lit, and the terminal on the
 *     right sits on «running…», until the next click brings the result in.
 */
const TYPE_MS = 34;
const TOKEN_MS = 105;

const PREFACE = 'You are Claude Code, a coding assistant.';

/**
 * The structural tokens of the protocol. They are SPECIAL tokens — single
 * entries in the vocabulary that the model was trained on, not prose it
 * improvises — so they are drawn the way `<|endoftext|>` is drawn on the
 * slide before: an outline, not a filled word-chip.
 */
const CALL = '<|tool_call|>';
const END_CALL = '<|end_call|>';
const RESULT = '<|tool_result|>';
const END_RESULT = '<|end_result|>';
const SPECIAL = new Set([CALL, END_CALL, RESULT, END_RESULT]);

/** What the preface declares. Beat 2 shows the first one, beat 3 the rest.
 *  One shape for all three: a name and named arguments, which is what makes
 *  it something a program can parse rather than prose. */
const TOOLS = [
  {
    intro: 'To read a file, write:',
    call: `${CALL} name="Read" path="…" ${END_CALL}`,
    outro: `…and I answer with ${RESULT} … ${END_RESULT}`,
  },
  { intro: 'To change it:', call: `${CALL} name="Edit" path="…" old="…" new="…" ${END_CALL}`, outro: '' },
  { intro: 'To run a command:', call: `${CALL} name="Bash" cmd="…" ${END_CALL}`, outro: '' },
];

type Who = 'user' | 'model' | 'harness';
type Seen =
  | { type: 'you'; text: string }
  | { type: 'tool'; head: string; foot: string }
  | { type: 'answer'; text: string };

/**
 * One turn, in both columns at once. The left column is drawn exactly like
 * the previous slide's — a script, with the model's own output as magenta
 * token chips — because it IS the same picture; the only new thing on it is
 * a third speaker. So a turn carries either `text` (a person typing) or
 * `tokens` (anything that lands in the text as tokens), and `seen` is what
 * the terminal draws for it — nothing at all, for every harness line.
 */
const TURNS: {
  who: Who;
  text?: string;
  tokens?: string[];
  seen?: Seen;
  /** For a tool call: what the harness goes away and really does. */
  runs?: string;
}[] = [
  {
    who: 'user',
    text: 'the cart adds VAT after the discount — fix it and run the tests',
    seen: { type: 'you', text: 'the cart adds VAT after the discount — fix it and run the tests' },
  },
  {
    who: 'model',
    tokens: [CALL, 'name="Read"', 'path="src/cart.ts"', END_CALL],
    runs: 'cat src/cart.ts',
    seen: { type: 'tool', head: 'Read(src/cart.ts)', foot: 'read 48 lines' },
  },
  {
    who: 'harness',
    tokens: [
      RESULT,
      'name="Read"',
      'status="ok"',
      'export function cartTotal(items, discount) { …',
      END_RESULT,
    ],
  },
  {
    who: 'model',
    tokens: [
      CALL,
      'name="Edit"',
      'path="src/cart.ts"',
      'old="total * VAT"',
      'new="net * VAT"',
      END_CALL,
    ],
    runs: 'patch src/cart.ts',
    seen: { type: 'tool', head: 'Edit(src/cart.ts)', foot: '1 addition, 1 removal' },
  },
  {
    who: 'harness',
    tokens: [RESULT, 'name="Edit"', 'status="ok"', '1 line changed', END_RESULT],
  },
  {
    who: 'model',
    tokens: [CALL, 'name="Bash"', 'cmd="npm test"', END_CALL],
    runs: 'npm test',
    seen: { type: 'tool', head: 'Bash(npm test)', foot: '12 passed' },
  },
  {
    who: 'harness',
    tokens: [RESULT, 'name="Bash"', 'status="ok"', '12 passed, 0 failed', END_RESULT],
  },
  {
    who: 'model',
    tokens: ['Fixed', '—', 'VAT', 'now', 'applies', 'to', 'the', 'discounted', 'price.', 'Tests', 'pass.'],
    seen: { type: 'answer', text: 'Fixed — VAT now applies to the discounted price. Tests pass.' },
  },
];

const WHO_LABEL: Record<Who, string> = {
  user: 'User:',
  model: 'Assistant:',
  harness: 'Harness:',
};

/** The scene's only clock, restarted whenever the beat changes. */
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

/**
 * Every turn is its own reveal, so he sets the pace: one click writes one
 * line. The clock only ever drives the NEWEST line — a person typing it, or
 * the model streaming it — and then stops. A harness line needs no clock at
 * all: a program pastes, whole and at once.
 *
 * The pause in between is his to hold: once the model has finished a tool
 * call, the harness lights up and stays lit, running, until he clicks again
 * and the result lands.
 */
const BEATS_BEFORE_TURNS = 3;

const duration = (turn: (typeof TURNS)[number]) =>
  turn.who === 'user'
    ? (turn.text?.length ?? 0) * TYPE_MS
    : turn.who === 'model'
      ? (turn.tokens?.length ?? 0) * TOKEN_MS
      : 0;

/** How far through its line the newest row is, 0…1 (older rows are done). */
const progress = (turn: (typeof TURNS)[number], t: number, live: boolean) => {
  const span = duration(turn);
  if (!live || span === 0) return 1;
  return Math.max(0, Math.min(1, t / span));
};

function AgentScene({ stage }: { stage: number }) {
  const t = useClock(stage);

  const toolCount = stage >= 3 ? TOOLS.length : stage >= 2 ? 1 : 0;
  const shownTurns = Math.max(0, stage - BEATS_BEFORE_TURNS);
  const playing = shownTurns > 0;
  const rows = TURNS.slice(0, shownTurns);
  const liveIndex = rows.length - 1;
  const live = rows[liveIndex];
  const liveProgress = live ? progress(live, t, true) : 1;
  const liveWriting = Boolean(live) && liveProgress < 1;

  // The harness picks up the moment the model's call is complete, and stays
  // on it until the next click brings its result in.
  const harnessRunning = live && live.runs && !liveWriting ? live.runs : null;
  const modelRunning = Boolean(live) && live.who === 'model' && liveWriting;

  const shown = (turn: (typeof TURNS)[number], i: number) => {
    const p = progress(turn, t, i === liveIndex);
    return {
      text: (turn.text ?? '').slice(0, Math.round(p * (turn.text?.length ?? 0))),
      tokens: (turn.tokens ?? []).slice(0, Math.round(p * (turn.tokens?.length ?? 0))),
      writing: i === liveIndex && p < 1,
    };
  };

  return (
    <div className="ww-llm ww-agent">
      {/* The text, which is all there is: preface, declarations, transcript. */}
      <div className="ww-llm__panel">
        <h3 className="ww-llm__label">What the model is given</h3>
        <div className={`ww-llm__script${playing ? ' ww-agent__script--tail' : ''}`}>
          <div className="ww-llm__pre">{PREFACE}</div>
          {TOOLS.slice(0, toolCount).map((tool) => (
            <div key={tool.call} className="ww-agent__decl">
              <div className="ww-llm__pre">{tool.intro}</div>
              <div className="ww-agent__call">{tool.call}</div>
              {tool.outro && <div className="ww-llm__pre">{tool.outro}</div>}
            </div>
          ))}
          {rows.map((turn, i) => {
            const now = shown(turn, i);
            return (
              <div key={i} className="ww-llm__line">
                <span className={`ww-llm__who ww-agent__who--${turn.who}`}>{WHO_LABEL[turn.who]}</span>{' '}
                {turn.who === 'user' ? (
                  <span className="ww-agent__said">{now.text}</span>
                ) : (
                  now.tokens.map((token, n) => (
                    <span
                      key={n}
                      className={`ww-llm__token ww-llm__token--${
                        SPECIAL.has(token) ? 'special' : turn.who === 'harness' ? 'pasted' : 'new'
                      }`}
                    >
                      {token}
                    </span>
                  ))
                )}
                {now.writing && <span className="ww-llm__caret" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* The two things that write into that text, stacked: the model, which
          only ever predicts tokens, and the harness above it, which is the
          one with hands — a shell, a file system, a network. */}
      <div className="ww-llm__engine ww-agent__engine">
        <div className={`ww-agent__box ww-agent__box--harness${harnessRunning ? ' is-busy' : ''}`}>
          <span className="ww-agent__box-name">Harness</span>
          <span className="ww-agent__box-state">
            {harnessRunning ? `$ ${harnessRunning}` : 'watching the text'}
          </span>
        </div>
        <span className="ww-llm__arrow ww-agent__updown" aria-hidden="true">
          ↕
        </span>
        <div className={`ww-agent__box ww-agent__box--model${modelRunning ? ' is-busy' : ''}`}>
          <span className="ww-agent__box-name">Language model</span>
          <span className="ww-agent__box-state">
            {modelRunning ? 'predicting the next token' : 'waiting'}
          </span>
        </div>
      </div>

      {/* What the person at the terminal sees of all that. */}
      <div className="ww-llm__panel ww-llm__panel--out">
        <h3 className="ww-llm__label">What you see</h3>
        {playing ? (
          <div className="ww-agent__term">
            {rows.map((turn, i) => {
              const { seen } = turn;
              if (!seen) return null;
              const now = shown(turn, i);
              if (seen.type === 'you') {
                return (
                  <div key={i} className="ww-agent__you">
                    <span className="ww-agent__caretglyph">&gt;</span> {now.text}
                    {now.writing && <span className="ww-llm__caret" />}
                  </div>
                );
              }
              // A tool line appears once the call is written, and sits on
              // «running…» until the click that brings its result in.
              if (seen.type === 'tool') {
                if (now.writing) return null;
                const settled = i < liveIndex;
                return (
                  <div key={i} className="ww-agent__call-seen">
                    <div className="ww-agent__head">
                      <span className={`ww-agent__dot${settled ? '' : ' ww-agent__dot--busy'}`}>⏺</span>{' '}
                      {seen.head}
                    </div>
                    <div className="ww-agent__foot">⎿ {settled ? seen.foot : 'running…'}</div>
                  </div>
                );
              }
              return (
                <div key={i} className="ww-agent__answer">
                  <span className="ww-agent__dot">⏺</span> {now.tokens.join(' ')}
                  {now.writing && <span className="ww-llm__caret" />}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="ww-agent__nothing">you never see any of this</div>
        )}
      </div>
    </div>
  );
}

export const CodingAgentSlide: SlideDefinition = {
  id: 'coding-agent',
  title: (
    <>
      Coding agent <span className="ww-llm__titlesub">— still just predicts the next token</span>
    </>
  ),
  maxRevealStages: BEATS_BEFORE_TURNS + TURNS.length,
  initialRevealStage: 1,
  content: ({ revealStage }) => (
    <>
      <CornerRings corner="top-right" />
      <AgentScene stage={revealStage} />
    </>
  ),
  notes:
    'Beat 1 — same shape as the chat two slides back: the text opens with a preface, and this '
    + 'one says «You are Claude Code, a coding assistant». '
    + 'Beat 2 — but the preface also DECLARES a tool: if you want a file, write this exact '
    + 'thing, and I will paste the file back into your text. Nothing about the model changed; '
    + 'the text told it a convention. '
    + 'Beat 3 — the same two sentences for Edit and for Bash. That is the whole difference '
    + 'between a chatbot and an agent: three declarations and something that honours them. '
    + 'Beat 4 — watch the alternation. Magenta lines are predicted by the model, violet lines '
    + 'are typed back by the HARNESS — the program around the model that actually reads the '
    + 'file, makes the edit and runs the command. The model never touches the disk; it writes '
    + 'text that asks, and stops. And this is where the permission box from the previous slide '
    + 'lives: between the tool call and the harness obeying it. On the right, the same turn as '
    + 'the user sees it — four tidy lines, and none of the machinery. '
    + 'Caveat to say out loud: the real protocol is structured tool-call blocks in the API, not '
    + 'literal <TOOL_CALL> tags in the prompt — the tags are that mechanism made readable from '
    + 'the back row. Everything they stand for is real, and early agents really were built this '
    + 'way, with tags in the prompt.',
};
