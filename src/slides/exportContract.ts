/**
 * Export-mode allow-lists for the build-time async-slide check.
 *
 * The check (`scripts/check-async-slides.ts`) runs as part of `bun run build`.
 * It greps every slide for fetch/await/.then patterns. Some hits are real
 * runtime async work (we must wait for them); others are template-string
 * code examples that *contain* await/fetch but never actually run.
 *
 * Every slide that grep matches MUST be classified into exactly one set,
 * or the build fails with a hint to come here and classify it.
 */
export const KNOWN_RUNTIME_ASYNC_SLIDES = new Set<string>([]);

/**
 * Slides that contain await/fetch only inside displayed code-example strings,
 * OR fire-and-forget runtime fetches we don't need to wait for in export mode.
 */
export const ASYNC_LITERAL_FALSE_POSITIVES = new Set<string>([
  


]);
