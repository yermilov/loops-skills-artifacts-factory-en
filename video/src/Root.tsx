import { Composition } from 'remotion';
import { Tweet2022, TWEET_2022_FRAMES, ChatUi2022, CHAT_UI_2022_FRAMES } from './Chat2022';
import { HackerNews2023, HN_2023_FRAMES, GptShellSession2023, GPT_SHELL_FRAMES } from './GptShell2023';
import { Prototype2024, PROTOTYPE_FRAMES } from './Prototype2024';
import { CursorTab, CURSOR_TAB_FRAMES } from './CursorTab';
import { ClaudeCodeFirst, CLAUDE_CODE_FIRST_FRAMES } from './ClaudeCodeFirst';
import { GithubMcp, GITHUB_MCP_FRAMES } from './GithubMcp';
import { DayPlan, DAY_PLAN_FRAMES } from './DayPlan';

/** The «origins of AI agents» clips, sized to sit on the deck's stage. */
export const RemotionRoot = () => (
  <>
    <Composition id="Tweet2022" component={Tweet2022} width={1920} height={860} fps={30} durationInFrames={TWEET_2022_FRAMES} />
    <Composition id="ChatUi2022" component={ChatUi2022} width={1920} height={860} fps={30} durationInFrames={CHAT_UI_2022_FRAMES} />
    <Composition id="HackerNews2023" component={HackerNews2023} width={1920} height={860} fps={30} durationInFrames={HN_2023_FRAMES} />
    <Composition id="GptShellSession2023" component={GptShellSession2023} width={1920} height={860} fps={30} durationInFrames={GPT_SHELL_FRAMES} />
    <Composition id="Prototype2024" component={Prototype2024} width={1920} height={860} fps={30} durationInFrames={PROTOTYPE_FRAMES} />
    <Composition id="CursorTab" component={CursorTab} width={1920} height={860} fps={30} durationInFrames={CURSOR_TAB_FRAMES} />
    <Composition id="ClaudeCodeFirst" component={ClaudeCodeFirst} width={1920} height={860} fps={30} durationInFrames={CLAUDE_CODE_FIRST_FRAMES} />
    <Composition id="GithubMcp" component={GithubMcp} width={1920} height={860} fps={30} durationInFrames={GITHUB_MCP_FRAMES} />
    <Composition id="DayPlan" component={DayPlan} width={1920} height={860} fps={30} durationInFrames={DAY_PLAN_FRAMES} />
  </>
);
