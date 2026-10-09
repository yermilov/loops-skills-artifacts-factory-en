#!/usr/bin/env bash
# Export the built deck to a 1920×1080 PDF via headless Playwright Chromium.
#
# Adapted from `zarazhangrui/frontend-slides` (MIT).
#
# Usage: bun run pdf

set -euo pipefail

cd "$(dirname "$0")/.."

# 1. Build the deck (also runs check:async-slides).
echo "==> Building deck..."
bun run build > /tmp/deck-build.log 2>&1 || {
  echo "Build failed. Tail:"
  tail -30 /tmp/deck-build.log
  exit 1
}

# 2. Ensure Playwright's bundled Chromium is installed.
if [ ! -d "$HOME/Library/Caches/ms-playwright" ] && [ ! -d "$HOME/.cache/ms-playwright" ]; then
  echo "==> Installing Playwright Chromium (one-time)..."
  bunx playwright install chromium
fi

# 3. Spawn `bun run preview` in the background.
echo "==> Starting preview server..."
PREVIEW_PORT=4173
bun run preview --port $PREVIEW_PORT > /tmp/deck-preview.log 2>&1 &
PREVIEW_PID=$!
trap 'kill $PREVIEW_PID 2>/dev/null || true' EXIT

# 4. Wait for the server to come up.
for i in $(seq 1 30); do
  if curl -sf "http://localhost:$PREVIEW_PORT/loops-skills-artifacts-factory-en/" -o /dev/null; then
    break
  fi
  sleep 0.5
done

# 5. Run the Playwright capture script.
echo "==> Capturing slides..."
bun run scripts/export-pdf.mjs "http://localhost:$PREVIEW_PORT/loops-skills-artifacts-factory-en/" "dist/loops-skills-artifacts-factory-en.pdf"

echo "==> Done: dist/loops-skills-artifacts-factory-en.pdf"
