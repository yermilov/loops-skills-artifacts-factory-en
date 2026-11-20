import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';
import { CodeBlock } from '../components/CodeBlock';
import { useClock } from './BootstrapSlide';
import { useAnimating } from '../components/frameSettled';

/**
 * Right after the artifact: the same answer, generated two ways, side by side
 * (Yarik, 21.11.2026). Left — the model writes the directions as prose, token by
 * token: the session's own wall of text (AssistantSessionSlide, beat 5), word for
 * word. Right — the same model writes CODE that shows the same three routes: a
 * small React component, a map and three buttons. Both stream at the same pace,
 * because it is the same act — predicting the next token; only what the tokens
 * spell differs.
 *
 * Illustrative: the tokens are cut by a regex (a word or a punctuation mark with
 * its leading space), not by a real tokenizer, and the pace is a readable one.
 * The component is written for the slide — the real artifact is an HTML file
 * (routes.html, set_task_artifact) — and `Map` / `PATHS` stand for the map it draws.
 */

const TEXT =
  'Three ways. By metro: walk 650 m down Kyrylivska to Tarasa Shevchenka, take the blue line '
  + 'five stops to Olimpiiska — past Kontraktova, Poshtova, Maidan and Ploshcha Ukrainskykh '
  + 'Heroiv — then 300 m up Velyka Vasylkivska: 24 minutes door to door. By taxi: along the '
  + 'embankment, up Volodymyrskyi Descent, across Khreshchatyk and down Velyka Vasylkivska — '
  + '16 minutes now, closer to 30 at ten in the morning, about 190 UAH. On foot: Kyrylivska, '
  + 'Kostiantynivska, up Andriivskyi Descent, along Volodymyrska past the Opera, then down to '
  + 'Velyka Vasylkivska — 5.6 km, an hour and ten. I would take the metro.';

const CODE = `const ROUTES = [
  ['Metro', '24 min'],
  ['Taxi', '16–30 min'],
  ['On foot', '1 h 10'],
];
function Routes() {
  const [pick, setPick] = useState(0);
  return <>
    <Map path={PATHS[pick]} />
    {ROUTES.map(([mode, time], i) =>
      <button onClick={() => setPick(i)}>
        {mode} <b>{time}</b>
      </button>)}
  </>;
}`;

/** A word, a number or one punctuation mark, with the whitespace before it — roughly
 *  how a tokenizer cuts, close enough to watch. */
const tokens = (s: string) => s.match(/\s*(?:[\p{L}\p{N}_]+|[^\s\p{L}\p{N}_])/gu) ?? [];
const TEXT_TOKENS = tokens(TEXT);
const CODE_TOKENS = tokens(CODE);

const TOKEN_MS = 70; // one token per this long, in both columns
const START_MS = 600; // a beat of silence before the first token
const END_MS = START_MS + Math.max(TEXT_TOKENS.length, CODE_TOKENS.length) * TOKEN_MS;

const upTo = (list: string[], t: number) =>
  list.slice(0, Math.max(0, Math.min(list.length, Math.floor((t - START_MS) / TOKEN_MS)))).join('');

function Columns() {
  const t = useClock(0);
  useAnimating(t < END_MS);
  const text = upTo(TEXT_TOKENS, t);
  const code = upTo(CODE_TOKENS, t);
  const textDone = text.length === TEXT.length;
  return (
    <div className="ww-tvc">
      <div className="ww-tvc__col">
        <div className="ww-tvc__card ww-tvc__card--text">
          <span className="ww-tvc__who">Assistant:</span> {text}
          {!textDone && <span className="ww-tvc__caret" aria-hidden="true" />}
        </div>
      </div>
      <div className="ww-tvc__col">
        <div className="ww-tvc__card ww-tvc__card--code">
          {code && <CodeBlock language="jsx" code={code} />}
        </div>
      </div>
    </div>
  );
}

export const TextVsCodeSlide: SlideDefinition = {
  id: 'improve-text-vs-code',
  content: () => (
    <>
      <CornerRings corner="bottom-right" />
      <Columns />
    </>
  ),
  notes:
    'Why is that not magic? A staged comparison — it plays by itself. On the left, what the model '
    + 'did in the chat: the directions as prose, one token after another — the paragraph from the '
    + 'session, word for word. On the right, what the same kind of generation looks like when the '
    + 'tokens are code — an illustrative React snippet, played at the same pace: three routes, a map, a button for each. It is the same act — '
    + 'predict the next token — only the tokens spell a program instead of a paragraph. And look '
    + 'at the length: the code is shorter than the prose, and what it produces is one glance '
    + 'instead of a minute of reading. That is all an artifact is: the model choosing to write the '
    + 'UI rather than the text. '
    + 'Honest about the picture: the tokens are cut roughly (by words and punctuation, not by a '
    + 'real tokenizer) and slowed down to be watchable; the component is written for the slide — '
    + 'the real artifact is an HTML file the agent attaches to the task.',
};
