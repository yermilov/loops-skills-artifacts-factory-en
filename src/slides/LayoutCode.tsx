import { SlideDefinition } from '../types/slides';
import { CodeBlock } from '../components/CodeBlock';
import { CornerRings } from '../components/wawtech';

/** Code on the template's grey card (code tier, 24px). */
export const LayoutCode: SlideDefinition = {
  id: 'layout-code',
  title: 'Code on a panel',
  content: (
    <>
      <CornerRings corner="bottom-right" />
      <div className="ww-code">
        <CodeBlock
          language="markdown"
          filename="skills/example/SKILL.md"
          code={`---
name: example
description: What the skill does and when to use it.
---

# Example skill

1. The steps the agent follows.
2. The checks it runs before it reports.`}
        />
      </div>
    </>
  ),
};
