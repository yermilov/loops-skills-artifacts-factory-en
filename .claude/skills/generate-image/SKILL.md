---
name: generate-image
description: Generates images for slides via the media:generate-image skill (browser-driven Gemini/ChatGPT) and records the prompt to src/prompts/ for later regeneration. Use when asked to create, generate, or design images for slides, presentations, or visual content.
allowed-tools: Skill, Read, Write, Bash(cp:*), Bash(mv:*), Bash(ls:*)
---

# Image Generation for Slides

Generate slide visuals using the shared **`media:generate-image`** skill, which
drives Gemini or ChatGPT through a real browser (Claude in Chrome) using the user's
existing logged-in session — no API key required.

This repo adds one convention on top: **every generated image's prompt is saved to a
JSON file in `src/prompts/`** so images can be referenced and regenerated later with
the same (or a tweaked) prompt.

## Workflow

1. **Generate the image** by invoking the shared skill:

   ```
   Skill(media:generate-image)
   ```

   Follow its workflow — pick the model (Gemini is a strong default for the
   text-heavy, label-rich diagrams in this deck), craft the prompt, show it to the
   user, generate, review, and iterate. For this deck's terminal aesthetic, keep the
   palette on dark `#0a0e14` with white `#e2e8f0`, orange `#f0883e`, and green
   `#7ee787`, and remember **all labels in the EN deck must be in English**.

2. **Place the image in `public/`.** The shared skill delivers the file to the
   browser's Downloads folder (or you can use its JS canvas-extraction download).
   Move/copy it into `public/` with the final filename, e.g.:

   ```bash
   cp ~/Downloads/output.png public/llm-theory-infographic.png
   ```

   In slide components, import it with the `?url` suffix (required for GitHub Pages):
   `import img from '/llm-theory-infographic.png?url';`

3. **Save the prompt to `src/prompts/<name>.json`** (same base name as the image).
   This is the key convention to preserve. The record format:

   ```json
   {
     "filename": "llm-theory-infographic.png",
     "prompt": "<the exact prompt that was sent>",
     "ratio": "16:9",
     "timestamp": "2026-05-29T12:00:00.000Z",
     "model": "gemini (via media:generate-image, browser)"
   }
   ```

   - `filename` — output image filename in `public/`
   - `prompt` — the exact prompt used (so the image can be regenerated)
   - `ratio` — aspect ratio (16:9, 4:3, 1:1, 4:5)
   - `timestamp` — ISO timestamp of generation
   - `model` — which model/route produced it (e.g. `gemini` or `chatgpt` via
     `media:generate-image`)

   If you're updating an existing image, overwrite its existing
   `src/prompts/<name>.json` so there's one source of truth per image.

## Regenerating an existing image

1. Read the existing `src/prompts/<name>.json` for the previous prompt.
2. Tweak the prompt as needed (e.g. translate labels to English).
3. Run the workflow above, overwrite `public/<name>` and update
   `src/prompts/<name>.json` with the new prompt and timestamp.

## Notes

- Build-time PNG/JPEG compression is handled automatically by
  `vite-plugin-imagemin`, so no manual compression is needed.
