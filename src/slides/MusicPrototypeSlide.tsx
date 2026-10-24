import { useEffect, useMemo, useState } from 'react';
import { SlideDefinition } from '../types/slides';
import songsData from '../assets/music/songs.json';

/** The covers are imported eagerly so a slide never waits on the network. */
const COVERS = import.meta.glob('../assets/music/*.jpg', { eager: true, import: 'default' }) as Record<
  string,
  string
>;

interface Song {
  rank: number;
  name: string;
  artists: string[];
  album: string;
  cover: string;
  durationMs: number;
}

const SONGS = songsData as Song[];

/** PDF capture must photograph the finished session, not a half-typed one. */
const EXPORT_MODE =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('export') === '1';

const TICK_MS = 40;
/** A human at a keyboard, and a model answering: ms per character. */
const TYPE_MS = 38;
const STREAM_MS = 20;
/** One line of a script arriving, and how long `osascript` takes to answer. */
const LINE_MS = 150;
const RUN_MS = 700;

/**
 * The slide's only clock. Everything below is a pure function of it — the same
 * contract the Remotion clips use, which is what makes the session replay
 * identically every time the slide is opened.
 */
function useClock(): number {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (EXPORT_MODE) {
      setT(Number.MAX_SAFE_INTEGER);
      return;
    }
    const id = setInterval(() => setT((v) => v + TICK_MS), TICK_MS);
    return () => clearInterval(id);
  }, []);
  return t;
}

const typed = (text: string, t: number, start: number, perChar = TYPE_MS) =>
  t < start ? '' : text.slice(0, Math.floor((t - start) / perChar));
const typedDone = (text: string, t: number, start: number, perChar = TYPE_MS) =>
  t >= start + text.length * perChar;

/** mm:ss, the way a player writes it. */
function clock(ms: number): string {
  const total = Math.round(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

/** macOS Music, already playing — the thing the AppleScript is asking about. */
function MusicApp({ song, played }: { song: Song; played: number }) {
  const cover = COVERS[`../assets/music/${song.cover}`];
  const artists = song.artists.join(', ');
  return (
    <div className="ww-music">
      <div className="ww-music__chrome">
        <span className="ww-dot ww-dot--red" />
        <span className="ww-dot ww-dot--amber" />
        <span className="ww-dot ww-dot--green" />
        <div className="ww-music__now">
          <img src={cover} alt="" />
          <div className="ww-music__nowtext">
            <strong>{song.name}</strong>
            <span>{artists}</span>
            <div className="ww-music__bar">
              <span className="ww-music__time">{clock(song.durationMs * played)}</span>
              <div className="ww-music__track">
                <div className="ww-music__fill" style={{ width: `${played * 100}%` }} />
              </div>
              <span className="ww-music__time">-{clock(song.durationMs * (1 - played))}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="ww-music__body">
        <div className="ww-music__sidebar">
          <div className="ww-music__section">Library</div>
          <div className="ww-music__row ww-music__row--on">Songs</div>
          <div className="ww-music__row">Albums</div>
          <div className="ww-music__row">Artists</div>
          <div className="ww-music__section">Playlists</div>
          <div className="ww-music__row">Yarik&apos;s Top 100</div>
        </div>
        <div className="ww-music__main">
          <img className="ww-music__art" src={cover} alt={`${song.album} cover`} />
          <div className="ww-music__meta">
            <div className="ww-music__title">{song.name}</div>
            <div className="ww-music__artist">{artists}</div>
            <div className="ww-music__album">{song.album}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The oh-my-zsh (robbyrussell) prompt, which is what Boris's shell shows. */
function Prompt({ children }: { children?: React.ReactNode }) {
  return (
    <div className="ww-proto__line">
      <span className="ww-proto__arrow">➜</span>
      <span className="ww-proto__cwd">/Users/bcherny/experiments</span>
      <span className="ww-proto__git">git:(</span>
      <span className="ww-proto__branch">main</span>
      <span className="ww-proto__git">)</span>
      <span className="ww-proto__dirty">✗</span>
      {children}
    </div>
  );
}

const CARET = <span className="ww-proto__caret" />;

/**
 * 2024 — Boris Cherny's first week at Anthropic, replayed end to end.
 *
 * ON RECORD (his Pragmatic Engineer interview): he was getting to know
 * Anthropic's public API; the prototype could NOT read files and could NOT run
 * bash; it reached the computer through AppleScript ALONE; it could say what
 * was playing and change the track on his word; he called it «a cool demo»
 * that «wasn't that interesting» — until the file and bash tools arrived.
 *
 * So what is drawn here is the smallest thing that satisfies all of that: one
 * tool, `run_applescript`, driven by the Messages API's tool-use loop in a
 * hand-rolled CLI. The glyphs of today's Claude Code are deliberately absent —
 * they did not exist, and a week-one prototype prints the tool name and the
 * script because that is what you need to debug it.
 *
 * The slide plays itself: no reveal stages, one clock, and the player on the
 * right changes track at the exact moment `play next track` returns. The songs
 * are drawn at random from Yarik's own top 100 (the same ranking juggernaut's
 * `/api/public/music/favourite` serves), baked in so the talk never depends on
 * the network.
 */
export const MusicPrototypeSlide: SlideDefinition = {
  id: 'history-2024',
  content: () => <PrototypeSession />,
  notes:
    '2024, Boris Cherny’s first week: one tool, AppleScript, no files and no bash. It reads the '
    + 'track, then changes it — both are on record. «A cool demo that wasn’t that interesting» — '
    + 'until he gave it the filesystem and bash. The slide plays itself; the songs are drawn at '
    + 'random from my own top 100, and the shell and the player are recreated.',
};

function PrototypeSession() {
  const t = useClock();
  // Two distinct favourites per mount: one playing, one it skips to.
  const [first, second] = useMemo(() => {
    const i = Math.floor(Math.random() * SONGS.length);
    const j = (i + 1 + Math.floor(Math.random() * (SONGS.length - 1))) % SONGS.length;
    return [SONGS[i]!, SONGS[j]!];
  }, []);

  const CMD = 'bun run cli.ts';
  const Q1 = 'what music am I listening to?';
  const SCRIPT1 = [
    'tell application "Music"',
    '  if player state is playing then',
    '    return name of current track & " — " & artist of current track',
    '  end if',
    'end tell',
  ];
  const R1 = `${first.name} — ${first.artists.join(', ')}`;
  const A1 = `You're listening to "${first.name}" by ${first.artists.join(', ')} — off ${first.album}.`;
  const Q2 = 'play something else';
  const SCRIPT2 = ['tell application "Music" to play next track'];
  const R2 = `${second.name} — ${second.artists.join(', ')}`;
  const A2 = `Done — skipped to "${second.name}" by ${second.artists.join(', ')}.`;

  // One timeline, absolute milliseconds, built from the text it has to carry.
  const at = useMemo(() => {
    let ms = 500;
    const cmd = ms;
    ms += CMD.length * TYPE_MS + 500;
    const q1 = ms;
    ms += Q1.length * TYPE_MS + 420;
    const tool1 = ms;
    ms += 380;
    const script1 = ms;
    ms += SCRIPT1.length * LINE_MS + RUN_MS;
    const result1 = ms;
    ms += 260;
    const answer1 = ms;
    ms += A1.length * STREAM_MS + 1100;
    const q2 = ms;
    ms += Q2.length * TYPE_MS + 420;
    const tool2 = ms;
    ms += 380;
    const script2 = ms;
    ms += SCRIPT2.length * LINE_MS + RUN_MS;
    const result2 = ms;
    ms += 260;
    const answer2 = ms;
    ms += A2.length * STREAM_MS + 400;
    return { cmd, q1, tool1, script1, result1, answer1, q2, tool2, script2, result2, answer2, end: ms };
  }, [A1, A2, Q2, R1, R2]);

  const lines1 = Math.max(0, Math.min(SCRIPT1.length, Math.floor((t - at.script1) / LINE_MS)));
  const lines2 = Math.max(0, Math.min(SCRIPT2.length, Math.floor((t - at.script2) / LINE_MS)));
  // The player follows the SCRIPT, not the clock's end: it changes track the
  // moment `play next track` returns.
  const skipped = t >= at.result2;
  const playing = skipped ? second : first;

  return (
    <div className="ww-proto">
      <div className="ww-proto__term">
        <div className="ww-proto__chrome">
          <span className="ww-dot ww-dot--red" />
          <span className="ww-dot ww-dot--amber" />
          <span className="ww-dot ww-dot--green" />
          <span className="ww-proto__title">experiments — zsh — 112×28</span>
        </div>
        <div className="ww-proto__body">
          <Prompt>
            <span className="ww-proto__cmd">{typed(CMD, t, at.cmd)}</span>
            {t < at.q1 && CARET}
          </Prompt>

          {t >= at.q1 && (
            <div className="ww-proto__line ww-proto__line--you">
              <span className="ww-proto__you">&gt;</span> {typed(Q1, t, at.q1)}
              {!typedDone(Q1, t, at.q1) && CARET}
            </div>
          )}
          {t >= at.tool1 && (
            <div className="ww-proto__tool">
              <div className="ww-proto__toolname">run_applescript</div>
              {SCRIPT1.slice(0, lines1).map((l) => (
                <div key={l} className="ww-proto__exec">
                  {l}
                </div>
              ))}
              {t >= at.result1 && <div className="ww-proto__out">→ {R1}</div>}
            </div>
          )}
          {t >= at.answer1 && (
            <div className="ww-proto__answer">
              {typed(A1, t, at.answer1, STREAM_MS)}
              {!typedDone(A1, t, at.answer1, STREAM_MS) && (
                <span className="ww-proto__caret ww-proto__caret--thin" />
              )}
            </div>
          )}

          {t >= at.q2 && (
            <div className="ww-proto__line ww-proto__line--you">
              <span className="ww-proto__you">&gt;</span> {typed(Q2, t, at.q2)}
              {!typedDone(Q2, t, at.q2) && CARET}
            </div>
          )}
          {t >= at.tool2 && (
            <div className="ww-proto__tool">
              <div className="ww-proto__toolname">run_applescript</div>
              {SCRIPT2.slice(0, lines2).map((l) => (
                <div key={l} className="ww-proto__exec">
                  {l}
                </div>
              ))}
              {t >= at.result2 && <div className="ww-proto__out">→ {R2}</div>}
            </div>
          )}
          {t >= at.answer2 && (
            <div className="ww-proto__answer">
              {typed(A2, t, at.answer2, STREAM_MS)}
              {!typedDone(A2, t, at.answer2, STREAM_MS) && (
                <span className="ww-proto__caret ww-proto__caret--thin" />
              )}
            </div>
          )}
          {t >= at.end && <Prompt>{CARET}</Prompt>}
        </div>
      </div>
      <MusicApp song={playing} played={skipped ? 0.04 : 0.42} />
    </div>
  );
}
