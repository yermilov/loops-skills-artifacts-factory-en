import { useEffect, useRef } from 'react';
import { SlideDefinition } from '../types/slides';
import { exportRegistry } from '../components/exportRegistry';
import lastNormalPhoto from '../assets/history/last-normal-photo.png';
import tweet2022 from '../assets/history/tweet2022.mp4';
import chatUi2022 from '../assets/history/chatui2022.mp4';
import hackerNews2023 from '../assets/history/hackernews2023.mp4';
import gptShellSession2023 from '../assets/history/gptshellsession2023.mp4';

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

