import { useEffect, useRef } from 'react';
import { SlideDefinition } from '../types/slides';
import { exportRegistry } from '../components/exportRegistry';
import lastNormalPhoto from '../assets/history/last-normal-photo.png';
import tweet2022 from '../assets/history/tweet2022.mp4';
import chatUi2022 from '../assets/history/chatui2022.mp4';
import hackerNews2023 from '../assets/history/hackernews2023.mp4';
import gptShellSession2023 from '../assets/history/gptshellsession2023.mp4';
import claudeCodeFirst from '../assets/history/claudecodefirst.mp4';
import githubMcp from '../assets/history/githubmcp.mp4';
import dayPlan from '../assets/history/dayplan.mp4';

/**
 * «Origins of AI agents» — three years, three interfaces, each one a clip
 * rendered with Remotion (see video/). The clips replay what really happened;
 * where no transcript survives, the frame itself says «reconstruction».
 *
 * No title band and no caption: the interface is the whole slide, and the
 * dates and sources are spoken, not printed.
 */

/** PDF capture has no video playback: the exporter waits for images and
 *  animations, so an autoplaying clip photographs as an empty window. In
 *  export mode the clip is therefore parked on its LAST frame — the state the
 *  slide ends on — and the slide settles only once that seek has landed. */
const EXPORT_MODE =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('export') === '1';

/** `from` / `to` (seconds) play one stretch of a clip, so a clip can be split
 *  across beats without re-rendering it. A clip stopped at `to` drops its
 *  autoplay flag, which is what tells the ready mark (frameSettled.ts) that it
 *  has finished rather than still loading. */
export function Clip({ src, slideId, from, to }: { src: string; slideId: string; from?: number; to?: number }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (!EXPORT_MODE) {
      // `asyncSettle` turns Slide.tsx's auto-settle off for these slides, so a
      // normal run has to settle itself or an export of ANY slide would hang.
      exportRegistry.markSlideSettled(slideId);
      // The SAME element carries a split clip from one beat to the next, so the
      // next stretch resumes where the last one stopped — no reload, no blink.
      // Seek only forwards (a cold load of the second beat starts at 0).
      if (from !== undefined && video.currentTime < from) video.currentTime = from;
      if (to === undefined) {
        if (video.paused && !video.ended && video.currentTime > 0) {
          video.autoplay = true;
          void video.play().catch(() => undefined);
        }
        return;
      }
      const stop = () => {
        if (video.currentTime < to) return;
        video.pause();
        video.autoplay = false;
      };
      // stepping BACK onto this beat: park on its own last frame, not the clip's
      if (video.currentTime > to) {
        video.currentTime = to;
        stop();
      }
      video.addEventListener('timeupdate', stop);
      return () => video.removeEventListener('timeupdate', stop);
    }
    video.pause();
    const seekToEnd = () => {
      if (Number.isFinite(video.duration)) video.currentTime = Math.max(0, video.duration - 0.1);
    };
    const settle = () => exportRegistry.markSlideSettled(slideId);
    video.addEventListener('loadedmetadata', seekToEnd);
    video.addEventListener('seeked', settle);
    seekToEnd();
    return () => {
      video.removeEventListener('loadedmetadata', seekToEnd);
      video.removeEventListener('seeked', settle);
    };
  }, [src, slideId, from, to]);
  return <video ref={ref} src={src} autoPlay={!EXPORT_MODE} muted playsInline preload="auto" />;
}

/** 2022 — the tweet, and the last quiet afternoon.
 *
 *  What people then DID with it is the slide after next (`ChatUiSlide`): the
 *  mechanism is explained in between, so «a whole Linux box inside the chat
 *  box» lands on an audience that already knows it is a text completion. */
export const ChatGptLaunchSlide: SlideDefinition = {
  id: 'history-2022',
  // No `asyncSettle` here, unlike its neighbours: the export parks a slide on
  // its MAX reveal, and this slide's last beat is the photo, a plain <img>.
  // Slide.tsx's auto-settle plus the exporter's own image wait is the right
  // path for it; opting out would leave nobody to settle it, since only
  // <Clip> does that for itself.
  maxRevealStages: 2,
  initialRevealStage: 1,
  content: ({ revealStage }) => {
    if (revealStage >= 2) {
      return (
        <>
          <img className="ww-full-bg" src={lastNormalPhoto} alt="" />
          <div className="ww-history__caption">
            all of us moments before that tweet (and never again)
          </div>
        </>
      );
    }
    return (
      <div className="ww-history">
        <Clip key="tweet" src={tweet2022} slideId="history-2022" />
      </div>
    );
  },
  notes:
    '2022. Beat 1: @sama, 30 November 2022, «today we launched ChatGPT». '
    + 'Beat 2: all of us moments before that tweet (the photo is generated, not real). '
    + 'Then the explainer slide, and only after it what people did with it.',
};

/** What people did with it, once they had it: a whole Linux box inside the
 *  chat box — i.e. the completion trick from the slide before, pushed. */
/** Where the first exchange (the setup prompt and «/») has landed, just before
 *  `ls ~` starts typing: video/src/Chat2022.tsx PROMPT_2_AT = frame 203 = 6.77 s. */
const CHAT_UI_CUT = 6.3;
export const ChatUiSlide: SlideDefinition = {
  id: 'history-2022-chatui',
  asyncSettle: true,
  // one question and answer per beat; the PDF parks on the last frame as before
  maxRevealStages: 2,
  initialRevealStage: 1,
  content: ({ revealStage }) => (
    <div className="ww-history">
      {/* one key for both beats: the video element survives the click */}
      <Clip
        key="ui"
        src={chatUi2022}
        slideId="history-2022-chatui"
        from={revealStage >= 2 ? CHAT_UI_CUT : undefined}
        to={revealStage >= 2 ? undefined : CHAT_UI_CUT}
      />
    </div>
  ),
  notes:
    'What people actually did with it — Jonas Degrave running a whole Linux box inside the chat '
    + 'box, engraved.blog, 3 December 2022. Transcript verbatim. Beat 1: the setup prompt and «pwd» → «/». '
    + '[reveal] Beat 2: «ls ~». Point at the mechanism from the '
    + 'previous slide: the «terminal» is the model completing a script in which one of the '
    + 'characters is a shell.',
};

/** 2023 — the claim, then the loop making good on it. */
export const GptShellSlide: SlideDefinition = {
  id: 'history-2023',
  asyncSettle: true,
  maxRevealStages: 2,
  initialRevealStage: 1,
  content: ({ revealStage }) => (
    <div className="ww-history">
      {revealStage >= 2 ? (
        <Clip key="session" src={gptShellSession2023} slideId="history-2023" />
      ) : (
        <Clip key="hn" src={hackerNews2023} slideId="history-2023" />
      )}
    </div>
  ),
  notes:
    '2023. Beat 1: ArenaSource on Hacker News, 27 March — put GPT-4 on a loop with a shell '
    + 'and it does whatever the job needs. Beat 2: it does exactly that — ping is missing, '
    + 'so it reaches for curl by itself. Verbatim from jla/gpt-shell’s own run.',
};

/**
 * The first released Claude Code: you chat in the terminal and it asks before
 * every move. The explainer slide comes next, and `GithubMcpSlide` after it
 * returns to this very session — its clip opens on this one's LAST frame
 * (both are drawn by the shared transcript in video/src/claudeTerminal.tsx).
 */
export const ClaudeCodeSlide: SlideDefinition = {
  id: 'history-claude-code',
  asyncSettle: true,
  content: () => (
    <div className="ww-history">
      <Clip key="claude-code" src={claudeCodeFirst} slideId="history-claude-code" />
    </div>
  ),
  notes:
    'The first released Claude Code: 0.2.9 on npm, 24 February 2025, a research '
    + 'preview on Claude 3.7 Sonnet. You chatted to it in the terminal and it asked before '
    + 'everything: run a command, edit a file, run the SAME command again. Note the second '
    + 'option in every box — «don\'t ask again» — it is the whole story of the two years after. '
    + 'Every string, glyph and colour is read off the published package 0.2.9; the session and '
    + 'the repo are invented — a reconstruction. Next slide: what is actually going on under '
    + 'that prompt.',
};

/** Back in the same session, now with somebody else's API in it. The clip
 *  opens on the frame `ClaudeCodeSlide` ended on, so it reads as a return. */
export const GithubMcpSlide: SlideDefinition = {
  id: 'history-github-mcp',
  asyncSettle: true,
  content: () => (
    <div className="ww-history">
      <Clip key="github-mcp" src={githubMcp} slideId="history-github-mcp" />
    </div>
  ),
  notes:
    'MCP, announced 25 November 2024 with six servers on day one (Google Drive, '
    + 'Slack, GitHub, Git, Postgres, Puppeteer). The same session you saw two slides ago, '
    + 'carried on — the clip opens on the exact frame that one ended on: now the terminal '
    + 'holds somebody else\'s API, and the tools are no longer the three baked into the '
    + 'harness. The permission is no longer «run npm test» but «use github:list_issues» — one '
    + 'rule per TOOL, which is why he picks «don\'t ask again» twice. Strings and glyphs are '
    + 'read off claude-code 1.0.0; the repo and issue numbers are invented.',
};

/** The terminal leaves the repo: two MCP servers that have nothing to do with
 *  code, and what comes out is a plan for the day rather than a commit. */
export const DayPlanSlide: SlideDefinition = {
  id: 'history-day-plan',
  asyncSettle: true,
  content: () => (
    <div className="ww-history">
      <Clip key="day-plan" src={dayPlan} slideId="history-day-plan" />
    </div>
  ),
  notes:
    'Same terminal, and nothing here is a repository: cwd is my home directory, the servers are '
    + 'Google Calendar and Slack, and what comes out is not a commit but my day. This is the '
    + 'turn the whole talk is about — the moment the coding tool stopped being about code. Note '
    + 'it reads BOTH and then reasons across them: the pickup in the calendar is what makes '
    + '17:05 the leaving time, and the two-day-old thread is what buys the 10:00 slot. Banner '
    + 'and panel are claude-code 1.0.0; the tool names are the real ones (list-events from the '
    + 'google-calendar server, slack_get_channel_history from the reference Slack server, which '
    + 'prefixes its own tools — hence slack:slack_…). The day itself is invented.',
};
