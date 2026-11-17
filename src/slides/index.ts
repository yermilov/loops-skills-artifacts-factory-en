import { TitleSlide } from './TitleSlide';
import { AboutMeSlide } from './AboutMeSlide';
import { PreplyProductSlide, PreplyHiringSlide } from './preply';
import {
  ChatGptLaunchSlide,
  ChatUiSlide,
  GptShellSlide,
  CursorTabSlide,
  ClaudeCodeSlide,
  GithubMcpSlide,
  DayPlanSlide,
} from './history';
import { HowLlmWorksSlide } from './HowLlmWorksSlide';
import { CodingAgentSlide } from './CodingAgentSlide';
import { McpSlide } from './McpSlide';
import { TodoMemeSlide } from './TodoMemeSlide';
import { SdkChatSlide } from './SdkChatSlide';
import { WhyNotSlide } from './WhyNotSlide';
import { GigachadSlide } from './GigachadSlide';
import { MyWaySlide } from './MyWaySlide';
import { BootstrapSlide, BootstrapRestSlide, BootstrapTaskSlide, BootstrapProcessSlide } from './BootstrapSlide';
import { ClaudeMdSlide } from './ClaudeMdSlide';
import { LoopIsCronSlide } from './LoopIsCronSlide';
import { MusicPrototypeSlide } from './MusicPrototypeSlide';
import { LayoutTwoColumns } from './LayoutTwoColumns';
import { LayoutBullets } from './LayoutBullets';
import { LayoutIconCards } from './LayoutIconCards';
import { LayoutStats } from './LayoutStats';
import { LayoutFeatureGrid } from './LayoutFeatureGrid';
import { LayoutBigNumber } from './LayoutBigNumber';
import { LayoutStatement } from './LayoutStatement';
import { LayoutTimeline } from './LayoutTimeline';
import { LayoutAccordion } from './LayoutAccordion';
import { LayoutCode } from './LayoutCode';
import { LayoutImage } from './LayoutImage';
import { LayoutBreak } from './LayoutBreak';
import { LayoutBigTitle } from './LayoutBigTitle';
import { LayoutContacts } from './LayoutContacts';
import { FinalSlide } from './FinalSlide';
// the side view is kept for a rollback: swap the two names here and in the list
import { FactoryFloorSlide } from './FactoryFloorSlide';
import { EngineersFactorySlide } from './EngineersFactorySlide';
import { MementoSlide } from './MementoSlide';
import { SkillUnitSlide, SkillUnitRefsSlide, SkillUnitScriptsSlide } from './SkillUnitSlide';
import { SkillReadRefSlide, SkillRunScriptSlide } from './SkillFilesSlide';
import { SkillLabyrinthSlide } from './SkillLabyrinthSlide';
import { SelfLearningSlide } from './SelfLearningSlide';
import { GoldbergSlide } from './GoldbergSlide';
import { SkillToolSlide } from './SkillToolSlide';
import { AssistantReadySlide } from './AssistantReadySlide';
import { AssistantSessionSlide } from './AssistantSessionSlide';
import {
  TaskBoardSlide,
  ArtifactSlide,
  RunnerSlide,
  IdleSlide,
  AnyAgentSlide,
  PaceSlide,
  FreeModelsSlide,
} from './improve';
import { MiniappBirthSlide, MiniappsSlide, MiniappsMoreSlide, MiniappsHomeSlide, MiniappsLastSlide, MiniappsEndSlide, MiniappsTreeSlide } from './MiniappsSlide';
import { ArchitectureSlide, ArchitectureDaemonSlide, ArchitectureTwoSlide, ArchitectureWebSlide, ArchitectureAppsSlide, ArchitectureMobileSlide, ArchitectureHomeSlide, ArchitectureHealthSlide, ArchitectureServicesSlide, RepairsItselfSlide, RepairLoopsSlide, FordFactorySlide, FactoryRevealSlide, ArchitectureAppTaskSlide, BuildsItselfSlide, LearnsItselfSlide } from './factory';

/**
 * LAYOUT GALLERY — one example of every WAWTech layout, kept as reference code
 * only: it is deliberately NOT in `slides`, so the deck shows real slides alone.
 * Copy the one you need into a real slide; delete these files once none is needed.
 */
export const LAYOUT_GALLERY = [
  LayoutTwoColumns,
  LayoutBullets,
  LayoutIconCards,
  LayoutStats,
  LayoutFeatureGrid,
  LayoutBigNumber,
  LayoutStatement,
  LayoutTimeline,
  LayoutAccordion,
  LayoutCode,
  LayoutImage,
  LayoutBreak,
  LayoutBigTitle,
  LayoutContacts,
];

export const slides = [
  TitleSlide,
  AboutMeSlide,
  PreplyProductSlide,
  PreplyHiringSlide,
  ChatGptLaunchSlide,
  HowLlmWorksSlide,
  ChatUiSlide,
  GptShellSlide,
  MusicPrototypeSlide,
  CursorTabSlide,
  ClaudeCodeSlide,
  CodingAgentSlide,
  GithubMcpSlide,
  McpSlide,
  DayPlanSlide,
  TodoMemeSlide,
  SdkChatSlide,
  WhyNotSlide,
  GigachadSlide,
  MyWaySlide,
  BootstrapSlide,
  ClaudeMdSlide,
  BootstrapRestSlide,
  LoopIsCronSlide,
  BootstrapTaskSlide,
  BootstrapProcessSlide,
  MementoSlide,
  SkillUnitSlide,
  SkillToolSlide,
  SkillUnitRefsSlide,
  SkillReadRefSlide,
  SkillUnitScriptsSlide,
  SkillRunScriptSlide,
  SkillLabyrinthSlide,
  SelfLearningSlide,
  GoldbergSlide,
  AssistantReadySlide,
  AssistantSessionSlide,
  ArchitectureSlide,
  RunnerSlide,
  AnyAgentSlide,
  ArchitectureDaemonSlide,
  ArchitectureTwoSlide,
  IdleSlide,
  PaceSlide,
  FreeModelsSlide,
  TaskBoardSlide,
  ArchitectureWebSlide,
  ArtifactSlide,
  MiniappBirthSlide,
  ArchitectureAppsSlide,
  MiniappsSlide,
  ArchitectureMobileSlide,
  MiniappsMoreSlide,
  ArchitectureAppTaskSlide,
  MiniappsHomeSlide,
  ArchitectureHomeSlide,
  MiniappsLastSlide,
  ArchitectureHealthSlide,
  MiniappsEndSlide,
  ArchitectureServicesSlide,
  MiniappsTreeSlide,
  FactoryRevealSlide,
  BuildsItselfSlide,
  LearnsItselfSlide,
  RepairsItselfSlide,
  RepairLoopsSlide,
  FordFactorySlide,
  FactoryFloorSlide,
  EngineersFactorySlide,
  FinalSlide,
];
