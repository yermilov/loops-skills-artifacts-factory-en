import type { ReactNode } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { SlideDefinition } from '../types/slides';
import { CornerRings } from '../components/wawtech';
import { Code, Emphasis, SlideLink } from '../components/SlideElements';
import bobbyFinn from '../assets/labyrinth/bobby-finn-no.jpg';

/**
 * «Learn how to write great skills» — the labyrinth, after revenge-of-the-skill
 * slide 25 (MetaSkillSlide): the obvious answer, knocked down with «NOOOO because...»,
 * one bullet a click — the way in (you end up with three skills), then the way
 * out (a marketplace that ships them), as one list whose oldest bullets scroll
 * off the top once it outgrows the slide.
 *
 * Both «NOOOO because...» beats land with Bobby Finn's «NO» from his «English Class»
 * sketches (@itsbobbyfinn) — a frame from the still Upworthy ran with its article
 * on them (upworthy.com/?p=3942), credited on the slide. Ask him before the talk.
 */


/** The obvious answer is the title itself; the slide opens on it alone, and the
 *  first click knocks it down. */
const WAY_IN: ReactNode[] = [
  // Bobby Finn's teacher voice: the «because» deliberately explains nothing.
  <>
    <Emphasis color="magenta">NOOOO because...</Emphasis> create a <Code>skill-authoring</Code> skill
  </>,
  <>
    read up on the best practices:{' '}
    <SlideLink href="https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices">
      platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
    </SlideLink>
    ,{' '}
    <SlideLink href="https://agentskills.io/skill-creation/best-practices">
      agentskills.io/skill-creation/best-practices
    </SlideLink>
  </>,
  <>
    <Emphasis color="magenta">NOOOO because...</Emphasis> ask Claude to do the research on how to write great
    skills
  </>,
  <>
    <Emphasis color="magenta">NOOOO because...</Emphasis> create a <Code>research</Code> skill: how to do research
  </>,
  <>
    if you got out of this labyrinth, you now have <Emphasis color="magenta">(at least) three skills</Emphasis>
  </>,
];

const WAY_OUT: ReactNode[] = [
  <>
    create a <Emphasis color="magenta">marketplace</Emphasis> in your repository and organize the skills into
    plugins
  </>,
  <>
    how? create <Code>marketplace-dev</Code> and <Code>plugin-dev</Code> skills
  </>,
  <>
    install the marketplace for your agents and <Emphasis color="magenta">force regular auto-updates</Emphasis>
  </>,
];

/**
 * The labyrinth's exit: the three skills you now have, and what depends on what
 * (an arrow is «depends on»): the process uses skill-authoring; skill-authoring
 * uses research and research uses skill-authoring; and skill-authoring is itself
 * written with skill-authoring. Drawn 1:1 in stage px (IBM Plex Mono, 0.6 em
 * advance at the code tier), bottom right, on the «three skills» beat only.
 */
const CH = 18; // px per character of the code tier (30 px × 0.6)
const NODE_H = 56;
const node = (label: string, cx: number, y: number) => {
  const w = label.length * CH + 48;
  return { label, x: cx - w / 2, y, w, cx };
};
// a triangle: the process on top, the two that feed each other along the base
const DEV = node('development-process', 380, 10);
const AUTH = node('skill-authoring', 180, 196);
const RES = node('research', 570, 196);
const BASE_Y = AUTH.y + NODE_H / 2;

function SkillGraph() {
  return (
    <svg className="ww-labyrinth__graph ww-overlay reveal-in" width="680" height="360" viewBox="0 0 680 360" aria-label="development-process depends on skill-authoring; skill-authoring and research depend on each other; skill-authoring depends on itself">
      <defs>
        <marker id="ww-dep-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" className="ww-labyrinth__arrowhead" />
        </marker>
      </defs>
      {/* the process → skill-authoring, down the left side */}
      <path className="ww-labyrinth__edge" d={`M${DEV.x + 90} ${DEV.y + NODE_H} L${AUTH.cx + 40} ${AUTH.y - 6}`} markerEnd="url(#ww-dep-arrow)" />
      {/* skill-authoring ⇄ research, along the base */}
      <path className="ww-labyrinth__edge" d={`M${AUTH.x + AUTH.w} ${BASE_Y - 12} L${RES.x - 6} ${BASE_Y - 12}`} markerEnd="url(#ww-dep-arrow)" />
      <path className="ww-labyrinth__edge" d={`M${RES.x} ${BASE_Y + 12} L${AUTH.x + AUTH.w + 6} ${BASE_Y + 12}`} markerEnd="url(#ww-dep-arrow)" />
      {/* skill-authoring → itself, a loop under it */}
      <path
        className="ww-labyrinth__edge"
        d={`M${AUTH.cx - 50} ${AUTH.y + NODE_H} C ${AUTH.cx - 80} ${AUTH.y + NODE_H + 96}, ${AUTH.cx + 80} ${AUTH.y + NODE_H + 96}, ${AUTH.cx + 50} ${AUTH.y + NODE_H + 6}`}
        markerEnd="url(#ww-dep-arrow)"
      />
      {[DEV, AUTH, RES].map((n) => (
        <g key={n.label}>
          <rect className="ww-labyrinth__node" x={n.x} y={n.y} width={n.w} height={NODE_H} rx={NODE_H / 2} />
          <text className="ww-labyrinth__label" x={n.cx} y={n.y + NODE_H / 2} dominantBaseline="central" textAnchor="middle">
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** The «three skills» beat — the last of the way in. */
const GRAPH_STAGE = 5;

/**
 * The labyrinth again, on «how? create marketplace-dev and plugin-dev»: the same
 * three skills and their arrows, plus the two new ones — and now every one of the
 * three depends on both (they live in, and ship through, the marketplace), while
 * the two depend on themselves, on each other and on skill-authoring. A wide band
 * along the bottom; its new arrows are violet.
 */
const T_DEV = node('development-process', 300, 10);
const T_AUTH = node('skill-authoring', 170, 196);
const T_RES = node('research', 530, 196);
const MKT = node('marketplace-dev', 1260, 30);
const PLG = node('plugin-dev', 1260, 236);
const ALL_STAGE = 7;

function SkillGraphAll() {
  const baseY = T_AUTH.y + NODE_H / 2;
  const left = (n: ReturnType<typeof node>, dy = 0) => `${n.x - 6} ${n.y + NODE_H / 2 + dy}`;
  return (
    <svg className="ww-labyrinth__graph ww-overlay reveal-in" width="1500" height="370" viewBox="0 0 1500 370" aria-label="development-process, skill-authoring and research each depend on marketplace-dev and plugin-dev; marketplace-dev and plugin-dev each depend on themselves, on each other and on skill-authoring">
      <defs>
        <marker id="ww-dep-arrow2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" className="ww-labyrinth__arrowhead" />
        </marker>
        <marker id="ww-dep-arrow-new" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" className="ww-labyrinth__arrowhead ww-labyrinth__arrowhead--new" />
        </marker>
      </defs>
      {/* the old triangle */}
      <path className="ww-labyrinth__edge" d={`M${T_DEV.x + 80} ${T_DEV.y + NODE_H} L${T_AUTH.cx + 30} ${T_AUTH.y - 6}`} markerEnd="url(#ww-dep-arrow2)" />
      <path className="ww-labyrinth__edge" d={`M${T_AUTH.x + T_AUTH.w} ${baseY - 12} L${T_RES.x - 6} ${baseY - 12}`} markerEnd="url(#ww-dep-arrow2)" />
      <path className="ww-labyrinth__edge" d={`M${T_RES.x} ${baseY + 12} L${T_AUTH.x + T_AUTH.w + 6} ${baseY + 12}`} markerEnd="url(#ww-dep-arrow2)" />
      <path
        className="ww-labyrinth__edge"
        d={`M${T_AUTH.cx - 50} ${T_AUTH.y + NODE_H} C ${T_AUTH.cx - 80} ${T_AUTH.y + NODE_H + 96}, ${T_AUTH.cx + 80} ${T_AUTH.y + NODE_H + 96}, ${T_AUTH.cx + 50} ${T_AUTH.y + NODE_H + 6}`}
        markerEnd="url(#ww-dep-arrow2)"
      />
      {/* …and everyone → the two new ones */}
      <path className="ww-labyrinth__edge ww-labyrinth__edge--new" d={`M${T_DEV.x + T_DEV.w} ${T_DEV.y + 24} C 800 20, 900 40, ${left(MKT, -10)}`} markerEnd="url(#ww-dep-arrow-new)" />
      <path className="ww-labyrinth__edge ww-labyrinth__edge--new" d={`M${T_DEV.x + T_DEV.w} ${T_DEV.y + 40} C 820 90, 900 230, ${left(PLG, -10)}`} markerEnd="url(#ww-dep-arrow-new)" />
      <path className="ww-labyrinth__edge ww-labyrinth__edge--new" d={`M${T_RES.x + T_RES.w} ${baseY - 14} C 840 200, 900 80, ${left(MKT, 4)}`} markerEnd="url(#ww-dep-arrow-new)" />
      <path className="ww-labyrinth__edge ww-labyrinth__edge--new" d={`M${T_RES.x + T_RES.w} ${baseY + 10} C 840 230, 940 270, ${left(PLG, 4)}`} markerEnd="url(#ww-dep-arrow-new)" />
      <path className="ww-labyrinth__edge ww-labyrinth__edge--new" d={`M${T_AUTH.cx + 110} ${T_AUTH.y} C 420 110, 860 130, ${left(MKT, 16)}`} markerEnd="url(#ww-dep-arrow-new)" />
      <path className="ww-labyrinth__edge ww-labyrinth__edge--new" d={`M${T_AUTH.cx + 110} ${T_AUTH.y + NODE_H} C 440 350, 980 340, ${left(PLG, 18)}`} markerEnd="url(#ww-dep-arrow-new)" />
      {/* …and the two new ones → each other, themselves, and skill-authoring */}
      <path className="ww-labyrinth__edge ww-labyrinth__edge--new" d={`M${MKT.cx - 30} ${MKT.y + NODE_H} V${PLG.y - 6}`} markerEnd="url(#ww-dep-arrow-new)" />
      <path className="ww-labyrinth__edge ww-labyrinth__edge--new" d={`M${MKT.cx + 30} ${PLG.y} V${MKT.y + NODE_H + 6}`} markerEnd="url(#ww-dep-arrow-new)" />
      {[MKT, PLG].map((n) => (
        <path
          key={`loop-${n.label}`}
          className="ww-labyrinth__edge ww-labyrinth__edge--new"
          d={`M${n.x + n.w} ${n.y + 14} C ${n.x + n.w + 100} ${n.y - 24}, ${n.x + n.w + 100} ${n.y + NODE_H + 24}, ${n.x + n.w + 4} ${n.y + NODE_H - 14}`}
          markerEnd="url(#ww-dep-arrow-new)"
        />
      ))}
      <path className="ww-labyrinth__edge ww-labyrinth__edge--new" d={`M${MKT.x + 24} ${MKT.y + NODE_H} C 880 170, 520 150, ${T_AUTH.x + T_AUTH.w - 30} ${T_AUTH.y - 6}`} markerEnd="url(#ww-dep-arrow-new)" />
      <path className="ww-labyrinth__edge ww-labyrinth__edge--new" d={`M${PLG.x + 30} ${PLG.y + NODE_H} C 900 372, 420 372, ${T_AUTH.x + T_AUTH.w - 34} ${T_AUTH.y + NODE_H + 6}`} markerEnd="url(#ww-dep-arrow-new)" />
      {[T_DEV, T_AUTH, T_RES, MKT, PLG].map((n) => (
        <g key={n.label}>
          <rect className={`ww-labyrinth__node${n === MKT || n === PLG ? ' ww-labyrinth__node--new' : ''}`} x={n.x} y={n.y} width={n.w} height={NODE_H} rx={NODE_H / 2} />
          <text className="ww-labyrinth__label" x={n.cx} y={n.y + NODE_H / 2} dominantBaseline="central" textAnchor="middle">
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/**
 * The last beat, after the whole list: the way out is already built and public.
 * His own marketplace, in the bottom band the second labyrinth has just left —
 * a QR, the link and the one command that installs it (the skills themselves
 * are named in the notes).
 */
const YYSTACK_URL = 'https://github.com/yermilov/yystack';
const YYSTACK_STAGE = WAY_IN.length + WAY_OUT.length + 1;

function Yystack() {
  return (
    <aside className="ww-labyrinth__yystack ww-overlay reveal-in">
      <QRCodeSVG
        className="ww-labyrinth__yystack-qr"
        value={YYSTACK_URL}
        size={260}
        level="M"
        fgColor="var(--ww-purple)"
        bgColor="var(--ww-white)"
        title="QR code: github.com/yermilov/yystack"
      />
      <div className="ww-labyrinth__yystack-text">
        <p>
          or skip the labyrinth — <Emphasis color="magenta">copy from me</Emphasis>:
        </p>
        <a className="ww-labyrinth__yystack-url" href={YYSTACK_URL}>
          github.com/yermilov/yystack
        </a>
        <Code>/plugin marketplace add yermilov/yystack</Code>
      </div>
    </aside>
  );
}

/** The three «NOOOO because...» beats: Bobby Finn peeks up on each. */
const FINN_STAGES = [1, 3, 4];

const ALL = [...WAY_IN, ...WAY_OUT];
/** How many bullets fit under the title at the deck's shortest stage (1080) —
 *  fewer from the second labyrinth on, to leave the bottom band for it. */
const WINDOW = 6;
const WINDOW_WITH_BAND = 4;

export const SkillLabyrinthSlide: SlideDefinition = {
  id: 'skill-labyrinth',
  title: 'Learn how to write great skills',
  maxRevealStages: YYSTACK_STAGE,
  content: ({ revealStage }) => {
    // one list, one bullet a click; once it outgrows the slide, the oldest
    // bullets leave from the top, one by one
    // (the yystack beat adds no bullet — the list stays as the last click left it)
    const shown = Math.min(revealStage, ALL.length);
    const first = Math.max(0, shown - (shown >= ALL_STAGE ? WINDOW_WITH_BAND : WINDOW));
    return (
      <>
        <CornerRings corner="bottom-right" />
        <ul className="ww-labyrinth">
          {ALL.slice(first, shown).map((b, i) => (
            <li key={first + i} className={first + i === revealStage - 1 ? 'reveal-in' : undefined}>
              {b}
            </li>
          ))}
        </ul>
        {FINN_STAGES.includes(revealStage) && (
          <figure key={revealStage} className="ww-labyrinth__finn ww-overlay">
            <img src={bobbyFinn} alt="Bobby Finn, as the English teacher, mid-«NO»" />
            <figcaption>@itsbobbyfinn</figcaption>
          </figure>
        )}
        {revealStage === GRAPH_STAGE && <SkillGraph />}
        {revealStage === ALL_STAGE && <SkillGraphAll />}
        {revealStage === YYSTACK_STAGE && <Yystack />}
      </>
    );
  },
  notes:
    'So: learn how to write great skills — the obvious answer. [reveal] NOOOO — because! (say it like '
    + 'Bobby Finn\'s English teacher, he pops up from below for a second): make a '
    + 'skill that writes skills; a skill-authoring skill. [reveal] Fine — then read the best practices: '
    + 'Anthropic\'s, agentskills.io. [reveal] NOOOO because... (him again): ask Claude to do that research for you. '
    + '[reveal] NOOOO because... (and again): the research itself is a skill — how to do research. [reveal] If you '
    + 'made it out of this labyrinth, you have at least three skills: the process, skill-authoring and '
    + 'research — and look how they depend on each other: the process is written with skill-authoring, '
    + 'skill-authoring needs research, research is itself a skill written with skill-authoring, and '
    + 'skill-authoring improves itself. [reveal] Next: put them in a marketplace, right in your repository, organized into '
    + 'plugins. [reveal] How? Skills again — a marketplace-dev and a plugin-dev skill. And here is the labyrinth '
    + 'again: every one of the three now depends on both of them — and the two new ones depend on '
    + 'themselves, on each other and on skill-authoring. [reveal] Then '
    + 'install the marketplace for your agents and force regular auto-updates, so every agent always '
    + 'runs the latest version. [reveal] Or skip the labyrinth: mine are public, in the yermilov/yystack '
    + 'marketplace — the QR and the link are on the screen, one command installs it: meta:skill-authoring, '
    + 'meta:plugin-dev and meta:enable-autoupdate, and research:deep-research as the research skill — '
    + 'install them and you start out of the labyrinth. Leave the QR up for a few seconds.',
};
