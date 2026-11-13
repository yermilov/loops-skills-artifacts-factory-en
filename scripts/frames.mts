// Prints which frames (#slide-N) each slide owns. Frame numbers shift with every reveal
// added or removed, so read them off this instead of counting by hand:
//   bunx vite-node scripts/frames.mts
// (vite-node, not bun: the slides use import.meta.glob.)
import { slides } from '../src/slides/index.ts';
let n = 0;
slides.forEach((s: any, i: number) => {
  const max = s.maxRevealStages ?? 0;
  const first = Math.max(0, Math.min(s.initialRevealStage ?? 0, max));
  const a = n + 1; n += max - first + 1;
  console.log(`${a}-${n}`, i, s.id, `stages ${first}..${max}`);
});
