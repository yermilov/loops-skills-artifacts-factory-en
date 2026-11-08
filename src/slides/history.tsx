import { useEffect, useRef } from 'react';
import { SlideDefinition } from '../types/slides';
import { exportRegistry } from '../components/exportRegistry';
import lastNormalPhoto from '../assets/history/last-normal-photo.png';
import tweet2022 from '../assets/history/tweet2022.mp4';
import chatUi2022 from '../assets/history/chatui2022.mp4';
import hackerNews2023 from '../assets/history/hackernews2023.mp4';
import gptShellSession2023 from '../assets/history/gptshellsession2023.mp4';
import cursorTab from '../assets/history/cursortab.mp4';
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

function Clip({ src, slideId }: { src: string; slideId: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (!EXPORT_MODE) {
      // `asyncSettle` turns Slide.tsx's auto-settle off for these slides, so a
      // normal run has to settle itself or an export of ANY slide would hang.
      exportRegistry.markSlideSettled(slideId);
      return;
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
  }, [src, slideId]);
  return <video ref={ref} src={src} autoPlay={!EXPORT_MODE} muted playsInline preload="auto" />;
}

/** 2022 — the tweet, the last quiet afternoon, and what people did with it. */
export const ChatGptLaunchSlide: SlideDefinition = {
  id: 'history-2022',
  asyncSettle: true,
  maxRevealStages: 3,
  initialRevealStage: 1,
  content: ({ revealStage }) => {
    if (revealStage >= 3) {
      return (
        <div className="ww-history">
          <Clip key="ui" src={chatUi2022} slideId="history-2022" />
        </div>
      );
    }
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
    + 'Beat 3: what people actually did with it — Jonas Degrave running a whole Linux box '
    + 'inside the chat box, engraved.blog, 3 December 2022. Transcript verbatim.',
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

/** The editor everyone moved into: a chat to agree what to build, and a tab
 *  model that writes whole blocks and then jumps — down the file, and into the
 *  next file the change breaks. */
export const CursorTabSlide: SlideDefinition = {
  id: 'history-cursor',
  asyncSettle: true,
  content: () => (
    <div className="ww-history">
      <Clip key="cursor" src={cursorTab} slideId="history-cursor" />
    </div>
  ),
  notes:
    'Cursor. First the chat on the right: you agree WHAT you want before a line is written. '
    + 'Then Tab — not one line but a whole block, then Tab again to jump to the next place '
    + 'the change needs, and finally the portal at the bottom: the edit this one forces in '
    + 'another file. Reconstruction — the behaviour is from Cursor\'s own docs, the code is '
    + 'invented.',
};

/**
 * Claude Code, in two beats of one session: the first release that asked for
 * everything, and then MCP, which changed WHAT it asks for. Beat 2 opens on
 * beat 1's last frame — the clips share their transcript (video/src/
 * claudeTerminal.tsx), so the reveal reads as the session carrying on.
 */
export const ClaudeCodeSlide: SlideDefinition = {
  id: 'history-claude-code',
  asyncSettle: true,
  maxRevealStages: 2,
  initialRevealStage: 1,
  content: ({ revealStage }) => (
    <div className="ww-history">
      {revealStage >= 2 ? (
        <Clip key="github-mcp" src={githubMcp} slideId="history-claude-code" />
      ) : (
        <Clip key="claude-code" src={claudeCodeFirst} slideId="history-claude-code" />
      )}
    </div>
  ),
  notes:
    'Beat 1 — the first released Claude Code: 0.2.9 on npm, 24 February 2025, a research '
    + 'preview on Claude 3.7 Sonnet. You chatted to it in the terminal and it asked before '
    + 'everything: run a command, edit a file, run the SAME command again. '
    + 'Beat 2 — MCP, announced 25 November 2024 with six servers on day one (Google Drive, '
    + 'Slack, GitHub, Git, Postgres, Puppeteer). Same session, carried on: now the terminal '
    + 'holds somebody else\'s API, and the permission is no longer «run npm test» but «use '
    + 'github:list_issues» — one rule per TOOL, which is why he picks «don\'t ask again» twice. '
    + 'That second option, in every box on both beats, is the whole story of the two years '
    + 'after. Every string, glyph and colour is read off the published packages (0.2.9 and '
    + '1.0.0); the session, the repo and the issue numbers are invented — a reconstruction.',
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
