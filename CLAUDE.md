# CLAUDE.md

## Project Overview

The deck for **«Loops, Skills, Artifacts, Factory: How I Turned AI Buzzwords Into a Personal
Assistant That Actually Improved My Life»** — Yaroslav Yermilov (Principal Engineer at Preply) at
**WAWTech 2026** by DOU, Warsaw, 26–27 November 2026. English. **45-minute slot, no Q&A —
26 November, 12:00–12:45, ENGINEERING stage (#AI).**
Hosted on GitHub Pages at https://yermilov.github.io/loops-skills-artifacts-factory-en/

It wears the conference's light template, «WAWTECH_Template_white», re-drawn as React on a fixed
1920×1080 stage. **Read `.claude/skills/design-system/SKILL.md` before touching any slide or
style** — palette, the four type tiers, the stage, and the layout kit are all there.

The engine (reveal stages, terminal-style input navigation, timer, PDF export) comes from the
`revenge-of-the-skill-en` deck; the presentation-dev marketplace skills (`deck-engine`,
`slide-layouts`, `slide-content`, `deck-design-system`) describe it in depth.

## Tech Stack

Bun · Vite 5 · React 18 · TypeScript strict · react-syntax-highlighter · qrcode.react · roughjs ·
vite-plugin-imagemin · Playwright (PDF export) · GitHub Pages via GitHub Actions.

## Commands

```bash
bun install      # REQUIRED before the first dev run; also installs the pre-commit hook
bun run dev      # http://localhost:5173/loops-skills-artifacts-factory-en/
bun run check    # deck-lint + async-slide check + tsc (the pre-commit hook runs this)
bun run build    # check:async-slides → tsc → vite build
bun run pdf      # 1920×1080 PDF of every slide at max reveal → dist/loops-skills-artifacts-factory-en.pdf
bun run preview  # serve dist/
```

## Project Structure

```
src/
├── App.tsx                       # renders <Presentation slides={slides} />
├── index.css                     # font imports (IBM Plex Sans / Mono, Inter Tight) + reset
├── slides/
│   ├── index.ts                  # THE SLIDE ORDER — register slides here
│   ├── TitleSlide.tsx            # template p.1 + p.2: talk, subtitle, speaker, venue
│   ├── AboutMeSlide.tsx          # about me, no title band — Preply / Grammarly / photo + LinkedIn QR
│   ├── preply.tsx                # Preply: product (three steps, reveal one by one), «We are hiring» — booth, cities, careers QR
│   ├── history.tsx               # «Origins of AI agents» 2022 + 2023 — Remotion clips
│   ├── MusicPrototypeSlide.tsx   # 2024 — live Ghostty/oh-my-zsh terminal + macOS Music, random song
│   ├── AgendaSlide.tsx           # template p.3 — exports AGENDA (the four words)
│   ├── sectionSlide.tsx          # factory for section openers (template p.11/18)
│   ├── sections.tsx              # one opener per AGENDA word
│   ├── Layout*.tsx               # LAYOUT GALLERY — examples only, not shown in the deck
│   ├── FinalSlide.tsx            # template p.27 «Thank You!»
│   └── exportContract.ts         # async-slide allow-lists for the build check
├── components/
│   ├── wawtech/index.tsx         # layout kit: CornerRings, Logo, BottomFade, Card, Stat, Block, Pill, Icon, Reveal
│   ├── Presentation.tsx          # navigation, timer, Esc command overlay, stage scaling, export API
│   ├── Slide.tsx                 # .stage (1920×1080) > .slide; optional title band
│   ├── CodeBlock.tsx             # Prism with a WAWTech light theme
│   ├── SlideElements.tsx         # SlideItem, SectionHeader, Code, Emphasis, Quote, SlideLink
│   ├── TalkTrack.tsx / TerminalInput.tsx / RotateHint.tsx   # chrome: bottom track, Esc terminal
│   └── exportRegistry.ts         # settle protocol for the PDF export
├── design-system/                # tokens.css · base.css · patterns.css · components.css
├── styles/slide-layouts.css      # one `ww-…` block per layout
├── assets/wawtech/               # the template's own images: rings, logo, gradient, icons
├── assets/history/               # the history clips, rendered from video/
├── assets/music/                 # album covers + songs.json for the 2024 slide's random track
├── hooks/                        # useSlideNavigation, useTouchNavigation
└── utils/preloadAssets.ts        # warms every src/assets/** file while the title is up
```

## Adding a slide

1. Copy the closest `src/slides/Layout*.tsx` to `src/slides/<Name>Slide.tsx`, rename the export
   and give it a unique `id`.
2. Import it in `src/slides/index.ts` and put it in the `slides` array where it belongs.
3. `bun run dev`, look at it; `bun run check`.

The **layout gallery** (`LAYOUT_GALLERY` in `src/slides/index.ts`) is reference code, not part of
the deck: it is exported but deliberately left out of `slides`, so only real slides show. Copy from
it; delete the entries and files once none is needed.

```tsx
import { SlideDefinition } from '../types/slides';
import { CornerRings, Reveal } from '../components/wawtech';

export const MySlide: SlideDefinition = {
  id: 'my-slide',
  title: 'What this slide says',          // optional: the standard top-left title band
  maxRevealStages: 2,                     // optional: beats on this slide
  content: ({ revealStage }) => (
    <>
      <CornerRings corner="bottom-left" />
      <Reveal at={1} stage={revealStage}><p>First beat</p></Reveal>
      <Reveal at={2} stage={revealStage}><p>Second beat</p></Reveal>
    </>
  ),
  notes: 'Speaker notes',
};
```

### Assets

- **Import every asset** (`import img from '../assets/x.png'`, or `'/x.png?url'` for `public/`).
  A literal `src="/x.png"` works on localhost and 404s on Pages (base is
  `/loops-skills-artifacts-factory-en/`).
- Files under `src/assets/**` (png/jpg/svg/webp, wav/mp3) are preloaded automatically.
- Animated content is **MP4, not GIF**:
  `ffmpeg -i in.gif -vf "fps=15,scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -pix_fmt yuv420p -crf 28 out.mp4`
- Don't hand-compress images; `vite-plugin-imagemin` does it at build time.

## Navigation

**The deck is addressed in FRAMES, not slides.** A frame is a slide at one reveal stage, and
`#slide-N` is the N-th frame — so every reveal has its own URL and a link points at the beat you
were actually looking at. `buildSteps()` in `useSlideNavigation.ts` flattens `slides` into that
list: each slide contributes one frame per stage from `initialRevealStage` to `maxRevealStages`
(the stages below `initialRevealStage` are not frames — on those slides they draw the same picture
as the first beat, so they would get a second number for one frame). The count moves with every
reveal you add, so read it off the deck rather than quoting a number from here.
Adding a reveal anywhere renumbers every frame after it, so don't treat an old `#slide-N` as
stable. `bun run pdf` is unaffected: it drives the export API, one page per slide at max reveal.

The input is hidden: **Esc** calls the terminal over the slide (Esc again, or running a command,
hides it; on a phone, tap the clock). Arrow keys, Space and PageUp/PageDown work without it.
Commands:
- `next` / `n` → next slide (skipping the rest of this one's reveals)
- `prev` / `back` / `p` / `b` → previous slide
- a number → that **frame**, the same number the hash shows; a negative number counts frames back
  from the end; `first` / `home`, `last` / `end`
- `reveal` / `r` → next frame
- Arrows / Space / PageUp/PageDown step one frame at a time in both directions, so going back
  lands on the previous slide's LAST reveal — the frame you just saw, not its bare first beat
- The bottom strip is the talk track: the magenta fill is how far the deck has got, the purple
  tick is where it should be by the clock. The clock starts when you leave the title slide and
  counts down 45:00; it turns amber, then red, when the tick runs ahead of the fill.

## Verify every change visually

After any change to slides, styles or config, open the dev server (or `bun run pdf`) and look at
the slide before calling it done — at 1920×1080 (the PDF), and once at a wider and a taller
aspect (e.g. 1920×1000 and 1440×1000): the stage stretches to the screen's aspect, so a layout that
assumes exactly 1920×1080 shows a gap there.

## The history clips (`video/`)

The «origins of AI agents» slides play MP4s rendered with **Remotion** from `video/` (its own
npm project, outside the deck's Bun build):

```bash
cd video && npm install
npx remotion studio                       # preview
npx remotion render src/index.ts <Id> out/<Id>.mp4
# ids → deck assets: Tweet2022 → tweet2022.mp4 · ChatUi2022 → chatui2022.mp4
#                   HackerNews2023 → hackernews2023.mp4 · GptShellSession2023 → gptshellsession2023.mp4
#                   CursorTab → cursortab.mp4 · ClaudeCodeFirst → claudecodefirst.mp4
#                   GithubMcp → githubmcp.mp4 · DayPlan → dayplan.mp4
# (2024 is not a clip: src/slides/MusicPrototypeSlide.tsx plays itself in React)
```

Then transcode into the deck — Remotion writes full-range `yuvj420p`, which browsers refuse to
play. Back in the REPO ROOT (the block above left you in `video/`):

```bash
cd ..
ffmpeg -y -i video/out/<Id>.mp4 -vf "scale=in_range=full:out_range=tv,format=yuv420p" \
  -c:v libx264 -profile:v high -crf 21 -color_range tv -colorspace bt709 \
  -movflags +faststart -an src/assets/history/<id>.mp4
```

**A recreated interface is a factual claim.** The slides carry no captions — the dates and sources
are spoken, and they live in each slide's `notes`, which is also where a reconstruction says it is
one. What is verbatim (the gpt-shell run, the tweet) is marked as such in the composition's own
comment. Keep that when editing.

**A slide that DRAWS Claude Code reuses the clips' own emulation.** `video/src/claudeTerminal.tsx`
is the reference — it was built by reading the published packages, and it owns the shapes: the
welcome box (a rounded frame in the `claude` colour, `✻ Welcome to Claude Code!`, a dim italic
`/help for help, /status for your current setup`, then `cwd:`), `⏺` for a step and `⎿` for its
result, indented. Its palette lives in `tokens.css` as `--cc-bg` / `--cc-text` / `--cc-dim` /
`--cc-claude` / `--cc-success`, so a React slide and a rendered clip look like one program; never
re-pick those colours by eye. Two details measured off the installed CLI (2.1.321) and worth
keeping: the bullet is `\u23FA` on macOS (`\u25CF` elsewhere), and a real session shows a prompt box
with `? for shortcuts` under it. A session already under way has no banner at all — in a real
terminal it has scrolled off — which is also the honest way to avoid dating the frame.

**Read the interface off the shipped artefact, never off memory.** For anything that was released,
the strings, glyphs and colours are still downloadable, and they are always slightly different from
what you remember. The Claude Code clips were built this way:

```bash
cd "$(mktemp -d)" && npm pack @anthropic-ai/claude-code@0.2.9 && tar -xf *.tgz   # first release
grep -o 'Do you want[^"]\{0,60\}' package/cli.mjs | sort -u                      # then grep cli.mjs
```

It settled things guessing would have got wrong: 0.2.9's options are NOT numbered (numbering came
later), its banner says «research preview!» while 1.0.0's does not, 1.0.0 renders an MCP tool as
`server:tool (MCP)` with a colon, and its «don't ask again» line says «commands» even for a tool
that is not a command. npm keeps every version, so pick the one from the era the slide claims, and
say in the composition's comment which version you read. The same trick works for any npm/PyPI
tool, and for MCP servers it gives you the real tool names (`list-events`, `slack_get_channel_history`).

## Deployment

Push to `main` → `.github/workflows/deploy.yml` builds and deploys to Pages (source: GitHub
Actions). Solo project: commit straight to `main`, messages `Add/Update/Fix/Remove …`.

**GitHub account switching (mandatory).** The repo is on the personal `yermilov` GitHub account,
while the default active `gh` account is the work EMU account `yaroslav-yermilov`. Before **any**
git operation, switch to `yermilov`; immediately after it, switch back — in the same command, so
the switch-back runs even if the git step fails:

```bash
gh auth switch --user yermilov; git push; rc=$?; gh auth switch --user yaroslav-yermilov; exit $rc
```

Never leave `yermilov` active between commands.

When the talk is done, publish it on yaroslavyermilov.io (redirect slug + talk entry) — see the
presentation-dev `presentation-stack` skill.

## Troubleshooting

- **`bun install` hangs at "Resolving…"** — a lockfile pointing at a private registry:
  `rm -rf bun.lock node_modules && bun install`.
- **`bun run pdf` says the Playwright browser is missing** — `bunx playwright install chromium`.
- **Build fails on `check:async-slides`** — classify the slide in `src/slides/exportContract.ts`.
- **`bun run pdf` hangs forever on one slide** — an INFINITE animation is still running in that
  slide's max-reveal state. The exporter awaits `document.getAnimations()`, and an infinite one
  never settles, so it waits with no error and no timeout. Export mode now kills every animation
  (`:root[data-export='1']` in `base.css`), so this should stay fixed — but if a slide ever starts
  its own animation imperatively, that is where to look first.
