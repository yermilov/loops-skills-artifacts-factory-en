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
│   ├── AboutPreplySlide.tsx      # PLACEHOLDER — «Інформація про Преплі»
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

The input is hidden: **Esc** calls the terminal over the slide (Esc again, or running a command,
hides it; on a phone, tap the clock). Arrow keys, Space and PageUp/PageDown work without it.
Commands:
- `next` / `n` → next reveal stage, then next slide
- `prev` / `back` / `p` / `b` → back
- a number → that slide; `first` / `home`, `last` / `end`
- `reveal` / `r` → next reveal stage
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
are spoken, and they live in each slide's `notes`. What is reconstructed says «reconstruction» on
the frame itself; what is verbatim (the gpt-shell run, the tweet) is marked as such in the
composition's own comment. Keep both when editing.

## Deployment

Push to `main` → `.github/workflows/deploy.yml` builds and deploys to Pages (source: GitHub
Actions). Solo project: commit straight to `main`, messages `Add/Update/Fix/Remove …`. The repo is
on the personal `yermilov` GitHub account — a 403 on push means the EMU account is active:
`gh auth switch --user yermilov`.

When the talk is done, publish it on yaroslavyermilov.io (redirect slug + talk entry) — see the
presentation-dev `presentation-stack` skill.

## Troubleshooting

- **`bun install` hangs at "Resolving…"** — a lockfile pointing at a private registry:
  `rm -rf bun.lock node_modules && bun install`.
- **`bun run pdf` says the Playwright browser is missing** — `bunx playwright install chromium`.
- **Build fails on `check:async-slides`** — classify the slide in `src/slides/exportContract.ts`.
