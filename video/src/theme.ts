/** Shared look of the three history videos: the deck's paper, plus each
 *  interface's own measured colours. */
export const PAPER = '#fdfdfb';
export const INK = '#0a0418';
export const PURPLE = '#3f078d';
export const MAGENTA = '#fc00ab';

/** gpt-shell's frame grammar, read off the author's own screenshots
 *  (github.com/jla/gpt-shell, assets/examples). */
export const SHELL = {
  bg: '#1c1c1c',
  text: '#f2f2f2',
  prompt: '#4ade80',
  gpt: '#4ade80',
  shellBox: '#7c5cff',
};

/** ChatGPT, November 2022. */
export const GPT = {
  bg: '#343541',
  alt: '#444654',
  sidebar: '#202123',
  text: '#ececf1',
  muted: '#8e8ea0',
  accent: '#19c37d',
};

export const MONO = 'IBM Plex Mono, ui-monospace, monospace';
export const SANS = 'IBM Plex Sans, system-ui, sans-serif';

/** Characters typed per frame, for the lines a HUMAN types (never model output). */
export const TYPE_SPEED = 4;
export const typed = (s: string, frame: number, start: number) =>
  s.slice(0, Math.max(0, Math.floor((frame - start) * TYPE_SPEED)));
export const typedFor = (s: string) => Math.ceil(s.length / TYPE_SPEED);
