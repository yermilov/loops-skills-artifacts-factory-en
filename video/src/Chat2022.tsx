import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { Window } from './Chrome';
import { GPT, PAPER, MONO, SANS, typed, typedFor } from './theme';
import samaAvatar from './assets/sama.jpg';

/** The tweet, verbatim: x.com/sama/status/1598038815599661056 */
const TWEET = 'today we launched ChatGPT. try talking with it here: chat.openai.com';
/**
 * VERBATIM from Jonas Degrave, «Building A Virtual Machine inside ChatGPT»
 * (engraved.blog, 3 December 2022) — read off the author's own screenshots,
 * typos included («Do no write explanations»). The UI around it is recreated.
 */
const PROMPT_PARTS: { text: string; strong?: boolean }[] = [
  { text: 'I want you to act as a Linux terminal.', strong: true },
  {
    text:
      ' I will type commands and you will reply with what the terminal should show. I want you '
      + 'to only reply with the terminal output inside one unique code block, and nothing else. '
      + 'Do no write explanations. Do not type commands unless I instruct you to do so. When I '
      + 'need to tell you something in English I will do so by putting text inside curly '
      + 'brackets {like this}. ',
  },
  { text: 'My first command is pwd.', strong: true },
];
const PROMPT = PROMPT_PARTS.map((p) => p.text).join('');
const ANSWER = '/';
const PROMPT_2 = 'ls ~';
const ANSWER_2 = [
  'bin      Desktop     Music    Pictures  Templates',
  'Documents  Downloads  Public   Videos',
];

const PROMPT_AT = 20;
const ANSWER_AT = PROMPT_AT + typedFor(PROMPT) + 16;
const PROMPT_2_AT = ANSWER_AT + 60;
const ANSWER_2_AT = PROMPT_2_AT + typedFor(PROMPT_2) + 16;

function Tweet({ frame }: { frame: number }) {
  const o = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });
  const y = interpolate(frame, [0, 24], [24, 0], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill
      style={{ justifyContent: 'center', alignItems: 'center', opacity: o, transform: `translateY(${y}px)` }}
    >
      <div
        style={{
          width: 1080,
          background: '#ffffff',
          border: '1px solid #e6e8ea',
          borderRadius: 20,
          padding: 44,
          fontFamily: SANS,
          color: '#0f1419',
          boxShadow: '0 30px 90px rgba(10,4,24,0.18)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <img
            src={samaAvatar}
            alt="Sam Altman"
            style={{ width: 76, height: 76, borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontSize: 45, fontWeight: 700 }}>Sam Altman</div>
            <div style={{ fontSize: 39, color: '#536471' }}>@sama</div>
          </div>
        </div>
        <div style={{ fontSize: 59, lineHeight: 1.35, marginTop: 28 }}>
          {TWEET}
        </div>
        <div style={{ fontSize: 36, color: '#536471', marginTop: 28 }}>7:38 PM · Nov 30, 2022</div>
      </div>
    </AbsoluteFill>
  );
}

/** One turn of the Dec-2022 ChatGPT thread: user row, then the reply row. */
function Row({
  who,
  children,
}: {
  who: 'user' | 'gpt';
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: who === 'gpt' ? GPT.alt : GPT.bg,
        padding: '26px 48px',
        display: 'flex',
        gap: 24,
        alignItems: 'flex-start',
      }}
    >
      {who === 'user' ? (
        <div
          style={{
            width: 44,
            height: 44,
            flexShrink: 0,
            borderRadius: 4,
            background: '#d97036',
            color: GPT.text,
            fontSize: 28,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          GR
        </div>
      ) : (
        <div
          style={{
            width: 44,
            height: 44,
            flexShrink: 0,
            borderRadius: 4,
            background: GPT.accent,
          }}
        />
      )}
      <div style={{ flex: 1, fontSize: 36, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

/** The black code block the model was told to answer inside. */
function CodeBlock({ lines }: { lines: string[] }) {
  return (
    <div style={{ borderRadius: 8, overflow: 'hidden', maxWidth: 1240 }}>
      <div
        style={{
          background: '#2f303a',
          color: GPT.muted,
          fontSize: 28,
          padding: '10px 18px',
          textAlign: 'right',
        }}
      >
        Copy code
      </div>
      <div
        style={{
          background: '#000000',
          color: '#ffffff',
          fontFamily: MONO,
          fontSize: 36,
          lineHeight: 1.5,
          padding: '20px 24px',
          whiteSpace: 'pre',
        }}
      >
        {lines.join('\n')}
      </div>
    </div>
  );
}

/** Types across the whole message, but keeps each part's own emphasis. */
function TypedParts({
  parts,
  shown,
}: {
  parts: { text: string; strong?: boolean }[];
  shown: number;
}) {
  let used = 0;
  return (
    <>
      {parts.map((part) => {
        const slice = part.text.slice(0, Math.max(0, shown - used));
        used += part.text.length;
        if (!slice) return null;
        return part.strong ? (
          <span
            key={part.text}
            style={{
              background: 'rgba(252, 0, 171, 0.35)',
              color: '#ffffff',
              fontWeight: 600,
              boxDecorationBreak: 'clone',
              WebkitBoxDecorationBreak: 'clone',
              padding: '2px 4px',
            }}
          >
            {slice}
          </span>
        ) : (
          <span key={part.text} style={{ color: 'rgba(236, 236, 241, 0.62)' }}>
            {slice}
          </span>
        );
      })}
    </>
  );
}

function ChatUi({ frame }: { frame: number }) {
  const o = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Window url="chat.openai.com" background={GPT.bg}>
        <div style={{ display: 'flex', height: '100%', fontFamily: SANS, color: GPT.text }}>
          <div style={{ width: 280, background: GPT.sidebar, padding: 20 }}>
            <div
              style={{
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 8,
                padding: '14px 18px',
                fontSize: 31,
              }}
            >
              + New chat
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
              }}
            >
              {frame >= PROMPT_AT && (
                <Row who="user">
                  <TypedParts parts={PROMPT_PARTS} shown={typed(PROMPT, frame, PROMPT_AT).length} />
                </Row>
              )}
              {frame >= ANSWER_AT && (
                <Row who="gpt">
                  <CodeBlock lines={[ANSWER]} />
                </Row>
              )}
              {frame >= PROMPT_2_AT && <Row who="user">{typed(PROMPT_2, frame, PROMPT_2_AT)}</Row>}
              {frame >= ANSWER_2_AT && (
                <Row who="gpt">
                  <CodeBlock lines={ANSWER_2} />
                </Row>
              )}
            </div>
            <div style={{ padding: 28 }}>
              <div
                style={{
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: '#40414f',
                  borderRadius: 10,
                  padding: '18px 24px',
                  fontSize: 34,
                  color: GPT.muted,
                }}
              >
                Send a message...
              </div>
            </div>
          </div>
        </div>
      </Window>
    </AbsoluteFill>
  );
}

/** Beat 1: the tweet that started it. */
export const Tweet2022 = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: PAPER, fontFamily: MONO }}>
      <Tweet frame={frame} />
    </AbsoluteFill>
  );
};

/** Beat 2: what everybody did next. */
export const ChatUi2022 = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: PAPER, fontFamily: MONO }}>
      <ChatUi frame={frame} />
    </AbsoluteFill>
  );
};

export const TWEET_2022_FRAMES = 150;
export const CHAT_UI_2022_FRAMES = ANSWER_2_AT + 150;
