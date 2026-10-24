---
name: design-system
description: Apply this deck's WAWTech design system when creating or modifying slides — the conference's light template («WAWTECH_Template_white») re-drawn as a fixed 1920×1080 stage, IBM Plex Sans + Inter Tight, the purple / magenta / mint palette, the four-tier type scale (96 / 80 / 32 / 24) and the `ww-` layout kit in `src/components/wawtech`. TRIGGER when creating a slide under `src/slides/`, styling slide content, editing CSS, picking colours or fonts, adjusting spacing, touching `src/design-system/` or `src/styles/slide-layouts.css`, when a hex value or px font-size shows up in a diff, or when a slide "doesn't look like the WAWTech template".
---

## Scope

The deck wears the organisers' light template, **«WAWTECH_Template_white»** (Google Slides,
`1kZiy2idTaKX-NRZggacqQ7z13qDwimkMg9vI0Cn1p4w`, sent by DOU on 07.09.2026 with the request to use
it "if possible"). Every colour was sampled from its PDF export; the fonts are the two it embeds;
the rings, logo, gradient and icons are its own images (`src/assets/wawtech/`). Stay inside the
template's vocabulary: white paper, deep purple text and blocks, one magenta and one mint accent,
faded violet rings in a corner, purple gradients rising from the bottom edge.

Venue: WAWTech 2026, Warsaw, 26–27 November — a hall. **The slot is 26 November, 12:00–12:45,
ENGINEERING stage: 45 minutes, no Q&A** (the talk track in
`TalkTrack.tsx` counts down 45:00).

## The stage

Every slide is composed for a **1920×1080 canvas** (`.stage`, `base.css`). `Presentation.tsx`
picks the scale that fits 1920×1080 into the space above the bottom strip (`--stage-scale`,
measured with a ResizeObserver) and then **grows the stage along the longer axis** to that space's
own aspect (`--stage-width` / `--stage-height`), so the slide fills the screen edge to edge — a
wider screen gets a wider stage, never paper bars. So:

- **anchor layouts to the stage's edges** (`left`/`right`/`top`/`bottom`, flex/grid) rather than
  assuming exactly 1920 px of width: on a 16:9 projector with the strip below, the stage is ~2000 px
  wide; on a 16:10 laptop it is taller than 1080;

- **all lengths in slide CSS are stage pixels** — no `vw`, no `clamp()`;
- one template point = 2.667 stage px, if you are copying a position from the Google Slides file;
- the chrome lives OUTSIDE the stage and keeps fluid sizes (`--font-size-input`,
  `--font-size-small`): a thin talk track at the bottom (fill = material, tick = clock), and the
  terminal input, hidden until Esc calls it over the slide;
- the PDF export (`bun run pdf`) captures at 1920×1080, i.e. the stage at scale 1.

## Where things live

| Concern | File |
|---|---|
| Tokens — palette, type tiers, spacing, radii, motion | `src/design-system/tokens.css` |
| Stage, slide defaults, headings, lists, inline code | `src/design-system/base.css` |
| Text utilities, `<SlideItem>` / `<SectionHeader>` / `<Emphasis>` styles, reveal animations | `src/design-system/patterns.css` |
| Chrome — talk track, command overlay, code block, rotate hint | `src/design-system/components.css` |
| Layout kit styles, one block per template layout (`ww-…`) | `src/styles/slide-layouts.css` |
| Layout kit components — `CornerRings`, `Logo`, `BottomFade`, `Card`, `Stat`, `Block`, `Pill`, `Icon`, `Reveal` | `src/components/wawtech/index.tsx` |
| One worked example of every layout | `src/slides/Layout*.tsx` (the "layout gallery") |

**Read `tokens.css` before writing any style.** Slides use the `--ww-*` names. The `--terminal-*`
names still exist only as aliases so the inherited chrome components keep working — don't use
them in new slide code.

## Palette

| Token | Value | Use |
|---|---|---|
| `--ww-paper` | `#fdfdfb` | slide background |
| `--ww-purple` | `#3f078d` | all text, flat blocks, hairlines |
| `--ww-magenta` | `#fc00ab` | accent 1 — subtitle box, pills, list markers, h3 labels |
| `--ww-mint` | `#02feb9` | accent 2 — logo box, stat cards, the big number. **Never as text on paper** (too light); its readable shade is `--terminal-green` |
| `--ww-violet` | `#9141e5` | gradient mid, rings |
| `--ww-lavender` | `#e8dcfb` | inline-code fill, faint fills |
| `--ww-card` | `#f3f3f3` | grey cards, code panel |
| `--ww-ink` | `#0a0418` | title box on the title slide, dark cards |

Gradients: `--ww-grad-magenta` (lead cards), `--ww-grad-mint` (stat cards), `--ww-grad-fade` (the
bottom fade on section slides), `--ww-grad-card` (image placeholders). Derive tints with
`color-mix()` over a token — never a raw hex outside `tokens.css`.

## Type — four sizes, and only four

| Tier | Token | px | Use |
|---|---|---|---|
| Hero | `--font-size-hero` | 96 | the title slide; the closing «Thank You!» and other display words (scaled up with `transform`, see below) |
| Heading | `--font-size-heading` | 80 | every other slide title; agenda rows; stat values |
| Body | `--font-size-body` | 40 | everything else — paragraphs, bullets, card text, labels |
| Code | `--font-size-code` | 30 | code blocks, pills, the section eyebrow |

Hierarchy inside a tier comes from **weight** (Plex 300 / 400 / 500 / 600 / 700), **colour** and
**capitals** — never from a fifth size. The template's huge display words («Thank You!», «96%»,
«Break Slide») are the hero tier scaled with `transform: scale()` and carry a
`deck-lint-allow font-size:` comment; don't add more of those without the same reason.

Fonts: **IBM Plex Sans** for titles and body, **Inter Tight** available as `--font-tight` for
small print, **IBM Plex Mono** for code. All load from Google Fonts in `src/index.css` and all
carry Cyrillic.

## Layouts

Start every new slide by copying the closest `src/slides/Layout*.tsx`:

| Gallery slide | Template page | Shape |
|---|---|---|
| `TitleSlide` | 1 + 2 | rings backdrop, mint logo box + venue chip, ink title, magenta box with subtitle and speaker |
| `AboutMeSlide` | — | no title band: two logo cards (ink «now», grey «before»), portrait with the LinkedIn QR on it |
| `AgendaSlide` | 3 | caps rows with numbers; stages spotlight one row |
| `sectionSlide()` | 11 / 18 | eyebrow + title + optional pill and columns, purple fade, big number |
| `LayoutTwoColumns` | 5 | title band + two text columns |
| `LayoutBullets` | — | magenta-bar bullets with staged reveal |
| `LayoutIconCards` | 6 | tray of four tall cards with the template icons |
| `LayoutStats` | 7 | magenta lead card + mint stat cards |
| `LayoutFeatureGrid` | 12 | title left, 2×2 grey cards right |
| `LayoutBigNumber` | 17 | huge mint number on a tall purple block |
| `LayoutStatement` | 19 | one sentence in a purple box |
| `LayoutTimeline` | 15 | overlapping magenta circles |
| `LayoutAccordion` | 20 | purple rows; the stage opens one |
| `LayoutCode` | — | code on the grey panel with a mint edge |
| `LayoutImage` | — | picture / video under the title |
| `LayoutBreak` | 25 | grainy purple gradient, white title |
| `LayoutBigTitle` | 24 | one huge bold word + outline pills |
| `LayoutContacts` | 26 | «Get in touch» + QR |
| `FinalSlide` | 27 | logo, «Thank You!», footer |

A slide with a `title` gets the standard title band (top-left, heading tier) and a padded flex
column for its body. Full-composition slides omit `title` and position an absolutely-placed
`ww-…` container themselves.

Rules the template implies:

- **One corner of rings per slide** (`<CornerRings corner=…>`), at 20% — the statement slide is
  the only one with two.
- **Accents are areas, not hairlines**: magenta and mint appear as boxes, cards, pills and bars.
- **Reveal with `<Reveal at stage>`** (visibility, not unmounting) so nothing jumps.
- **Split a dense slide rather than shrinking text.** 40px on the stage is the floor for anything
  the audience must read.

## Linting

`bun run check` = `deck-lint` (four tiers, no raw sizes or colours outside `tokens.css`, no `•`)
+ the async-slide check + `tsc`. It runs from `.githooks/pre-commit` (installed by `bun install`
via `prepare`). A justified exception carries `deck-lint-allow <rule>: <reason>` on the line.

## Validation

1. `bun run check` is clean.
2. `bun run dev` → http://localhost:5173/loops-skills-artifacts-factory-en/ — look at the slide.
3. `bun run pdf` and look at the page (1920×1080, max reveal) — it is also the organiser
   deliverable, so produce the final one LAST, after the final build.
4. Check a phone in landscape (844×390): the stage just scales; nothing should reflow.
