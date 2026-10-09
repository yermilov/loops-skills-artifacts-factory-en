#!/usr/bin/env bun
// deck-lint — the deck design system's static rules, run before every commit.
//
// Copy this file into a deck as `scripts/deck-lint.ts`; the deck-design-system skill
// (§ "Linting before every commit") shows the package.json script and the git hook.
// Zero dependencies: Bun runs the TypeScript directly.
//
//   bun run scripts/deck-lint.ts            # lint src/ of the current deck
//   bun run scripts/deck-lint.ts --root <dir> [--config <file>]
//
// Exits 1 on any error. Optional `deck-lint.config.json` in the deck root overrides the
// type scale (see DEFAULT_CONFIG). A line you mean to break carries an allow comment on the
// same line or the line directly above it, with a reason:
//
//   /* deck-lint-allow font-size: mock file tab, drawn at the picture's own scale */
//   (the rule name is the one printed in the finding: type-scale, font-size, jsx-font-size, …)
//   {/* deck-lint-allow colour: SVG brand constant */}
//
// Rules: type-scale (tiers in tokens.css), font-size (declarations outside tokens.css),
// jsx-font-size, colour (raw colours outside tokens.css), bullet (a `•` marker instead of `>`).

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

type Config = {
  /** The tier tokens: the only font-size tokens allowed to hold a literal value. */
  tiers: string[];
  /** Small UI sizes that are not slide type (command overlay, progress captions). */
  chrome: string[];
  /** Literal font-size values allowed outside tokens.css (relative to the parent's tier). */
  allowValues: string[];
  /** Where the tokens live, relative to the deck root. */
  tokensFile: string;
  /** Directory to lint, relative to the deck root. */
  srcDir: string;
};

const DEFAULT_CONFIG: Config = {
  tiers: ['--font-size-hero', '--font-size-heading', '--font-size-body', '--font-size-code'],
  chrome: ['--font-size-input', '--font-size-small'],
  allowValues: ['inherit', '1em', '0.88em'],
  tokensFile: 'src/design-system/tokens.css',
  srcDir: 'src',
};

type Finding = { file: string; line: number; rule: string; message: string };

const args = process.argv.slice(2);
const rootArg = args.indexOf('--root');
const root = rootArg >= 0 ? args[rootArg + 1] : process.cwd();

const configArg = args.indexOf('--config');
const configPath = configArg >= 0 ? args[configArg + 1] : join(root, 'deck-lint.config.json');
const config: Config = {
  ...DEFAULT_CONFIG,
  ...(existsSync(configPath) ? JSON.parse(readFileSync(configPath, 'utf8')) : {}),
};
if (configArg >= 0 && !existsSync(configPath)) {
  console.error(`deck-lint: --config ${configPath} does not exist`);
  process.exit(2);
}

const findings: Finding[] = [];
const report = (file: string, line: number, rule: string, message: string) =>
  findings.push({ file: relative(root, file), line, rule, message });

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(css|tsx?|jsx?)$/.test(name)) out.push(p);
  }
  return out;
}

/** True when `lines[i]` or the line above carries `deck-lint-allow <rule>`. */
function allowed(lines: string[], i: number, rule: string): boolean {
  const re = new RegExp(`deck-lint-allow\\s+${rule}\\b`);
  return re.test(lines[i]) || (i > 0 && re.test(lines[i - 1]));
}

/** Strip CSS comments but keep line numbers (comments become spaces). */
/** 1-based line number of a character offset. */
function lineOf(text: string, index: number): number {
  return text.slice(0, index).split('\n').length;
}

function stripCssComments(text: string): string {
  return text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}

const COLOUR = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(/;
const SIZE_TOKEN = /^--(?:font-size|slide-text|slide-section-header|slide-code)[\w-]*$/;

// ── tokens.css: the scale itself ────────────────────────────────────────────
const tokensPath = join(root, config.tokensFile);
if (!existsSync(tokensPath)) {
  console.error(`deck-lint: no tokens file at ${config.tokensFile} — pass --root or set tokensFile`);
  process.exit(2);
}
const tokensRaw = readFileSync(tokensPath, 'utf8');
const tokensText = stripCssComments(tokensRaw);
const tokensRawLines = tokensRaw.split('\n');

const isScaleRoot = (n: string) => config.tiers.includes(n) || config.chrome.includes(n);

/** Every declaration of a size custom property in tokens.css (configured names included), in order. */
const sizeDecls: { name: string; value: string; line: number }[] = [];
for (const m of tokensText.matchAll(/(?<![\w-])(--[\w-]+)\s*:\s*([^;{}]+?)\s*(?:;|(?=\}))/g)) {
  if (SIZE_TOKEN.test(m[1]) || isScaleRoot(m[1])) {
    sizeDecls.push({ name: m[1], value: m[2].replace(/\s+/g, ' ').trim(), line: lineOf(tokensText, m.index!) });
  }
}
const sizeTokens = new Set(sizeDecls.map((d) => d.name));
/** Values a non-tier token may hold without being a size of its own. */
const TOKEN_SAFE = ['inherit', '1em'];
const aliasOf = (value: string) => value.match(/^var\((--[\w-]+)\)$/)?.[1];

/** Follow every alias chain from `name`; the set of scale roots / dead ends it can reach. */
function reaches(name: string, path: Set<string> = new Set()): Set<string> {
  if (isScaleRoot(name)) return new Set([name]);
  if (path.has(name)) return new Set(['<cycle>']);
  const here = new Set(path).add(name);
  const out = new Set<string>();
  for (const d of sizeDecls.filter((x) => x.name === name)) {
    const target = aliasOf(d.value);
    if (target && sizeTokens.has(target)) reaches(target, here).forEach((r) => out.add(r));
    else if (!TOKEN_SAFE.includes(d.value)) out.add(`<${d.value}>`);
  }
  return out;
}

for (const t of config.tiers) {
  if (!sizeTokens.has(t)) report(tokensPath, 1, 'type-scale', `tier token ${t} is not declared`);
}
for (const { name, value, line } of sizeDecls) {
  if (allowed(tokensRawLines, line - 1, 'type-scale')) continue;
  const target = aliasOf(value);
  if (isScaleRoot(name)) {
    // A tier holds its own value (media-query overrides included) — never another size.
    if ([...value.matchAll(/var\((--[\w-]+)/g)].some((r) => sizeTokens.has(r[1]))) {
      report(tokensPath, line, 'type-scale', `${name}: ${value} — a tier holds its own value, not another size`);
    }
    continue;
  }
  if (TOKEN_SAFE.includes(value)) continue;
  if (!target) {
    report(tokensPath, line, 'type-scale', `${name}: ${value} is an extra size — alias it onto a tier (${config.tiers.join(' / ')})`);
  } else if (!sizeTokens.has(target)) {
    report(tokensPath, line, 'type-scale', `${name} aliases ${target}, which tokens.css does not declare`);
  } else {
    const bad = [...reaches(target)].filter((r) => !config.tiers.includes(r));
    if (bad.length) {
      report(tokensPath, line, 'type-scale', `${name}: ${value} does not land on a tier (reaches ${bad.join(', ')})`);
    }
  }
}

// ── every source file ───────────────────────────────────────────────────────
for (const file of walk(join(root, config.srcDir))) {
  const isTokens = file === tokensPath;
  const raw = readFileSync(file, 'utf8');
  const rawLines = raw.split('\n');

  if (file.endsWith('.css')) {
    const stripped = stripCssComments(raw);
    const lines = stripped.split('\n');
    // font-size declarations — every one, even several per line or one value spread over lines.
    // (tokens.css too: its `--font-size-*:` definitions never match `font-size:`, its rules do.)
    for (const fs of stripped.matchAll(/(?<![\w-])font-size\s*:\s*([^;}]+)/gi)) {
      const i = lineOf(stripped, fs.index!) - 1;
      if (!allowed(rawLines, i, 'font-size')) {
        const value = fs[1].replace(/\s+/g, ' ').replace(/\s*!important\s*$/, '').trim();
        const ref = value.match(/^var\((--[\w-]+)\)$/);
        if (ref) {
          if (!sizeTokens.has(ref[1])) {
            report(file, i + 1, 'font-size', `${ref[1]} is not a size token in tokens.css`);
          }
        } else if (!config.allowValues.includes(value)) {
          const why = /calc\(/.test(value) && /var\(--/.test(value)
            ? 'a derived size smuggles in an extra tier'
            : 'a raw size bypasses the scale';
          report(file, i + 1, 'font-size', `font-size: ${value} — ${why}; use a tier token`);
        }
      }
    }
    // the `font:` shorthand carries a size too — a literal length in it is a raw size
    for (const f of stripped.matchAll(/(?<![\w-])font\s*:\s*([^;}]+)/gi)) {
      const i = lineOf(stripped, f.index!) - 1;
      if (/\d(?:\.\d+)?(?:px|r?em|pt|vw|vh|vmin|vmax|%)|calc\(/i.test(f[1]) && !allowed(rawLines, i, 'font-size')) {
        report(file, i + 1, 'font-size', `font: ${f[1].trim()} — the shorthand sets a raw size; use font-size: var(<tier>)`);
      }
    }
    // size tokens are defined in tokens.css only — a local redefinition is a size the scale never saw
    for (const t of isTokens ? [] : stripped.matchAll(/(?<![\w-])(--[\w-]+)\s*:\s*([^;{}]+?)\s*(?:;|(?=\}))/g)) {
      if (!(SIZE_TOKEN.test(t[1]) || isScaleRoot(t[1]))) continue;
      const i = lineOf(stripped, t.index!) - 1;
      if (!allowed(rawLines, i, 'type-scale')) {
        report(file, i + 1, 'type-scale', `${t[1]} redefined outside ${config.tokensFile} — size tokens live there only`);
      }
    }
    // the bullet marker, anywhere in a content: value (even one spread over lines)
    for (const c of stripped.matchAll(/(?<![\w-])content\s*:[^;}]*•/g)) {
      const i = lineOf(stripped, c.index! + c[0].length - 1) - 1;
      if (!allowed(rawLines, i, 'bullet')) report(file, i + 1, 'bullet', 'a `•` marker — the deck uses `>` (or a counter)');
    }
    lines.forEach((l, i) => {
      // raw colours outside tokens.css
      if (!isTokens && COLOUR.test(l) && !/mask(?:-image)?\s*:/.test(l) && !allowed(rawLines, i, 'colour')) {
        report(file, i + 1, 'colour', `raw colour "${l.trim()}" — use a token`);
      }
    });
  } else {
    // code only: block / JSX comments and `//` line comments blanked, line numbers kept
    const codeText = stripCssComments(raw).replace(/(^|\s)\/\/.*$/gm, '$1');
    for (const fs of codeText.matchAll(/fontSize\s*[:=]\s*(\{[^}]*\}|['"`][^'"`]*['"`]|[^,}\s]+)/g)) {
      const i = lineOf(codeText, fs.index!) - 1;
      if (allowed(rawLines, i, 'jsx-font-size')) continue;
      const ref = fs[1].match(/^\{?\s*['"`]var\((--[\w-]+)\)['"`]\s*\}?$/);
      if (!ref || !sizeTokens.has(ref[1])) {
        const shown = fs[1].replace(/\s+/g, ' ').trim();
        report(file, i + 1, 'jsx-font-size', `fontSize ${shown} — use 'var(<a size token>)', or allow it as picture-scale text`);
      }
    }
    codeText.split('\n').forEach((l, i) => {
      if (/•/.test(l) && !allowed(rawLines, i, 'bullet')) {
        report(file, i + 1, 'bullet', 'a `•` marker in copy — the deck uses `>`');
      }
    });
    // style={{ … }} objects, single- or multi-line
    for (const block of codeText.matchAll(/\bstyle=\{\{[\s\S]*?\}\}/g)) {
      const startLine = lineOf(codeText, block.index!) - 1;
      block[0].split('\n').forEach((bl, j) => {
        const i = startLine + j;
        if (COLOUR.test(bl) && !allowed(rawLines, i, 'colour')) {
          report(file, i + 1, 'colour', 'raw colour in style={{}} — use a token');
        }
      });
    }
  }
}

// ── report ──────────────────────────────────────────────────────────────────
const byRule = new Map<string, number>();
for (const f of findings) {
  console.log(`${f.file}:${f.line}  ${f.rule}  ${f.message}`);
  byRule.set(f.rule, (byRule.get(f.rule) ?? 0) + 1);
}
if (findings.length) {
  console.log(`\ndeck-lint: ${findings.length} problem(s) — ${[...byRule].map(([r, n]) => `${r} ${n}`).join(', ')}`);
  process.exit(1);
}
console.log(`deck-lint: clean (${config.tiers.length} tiers: ${config.tiers.join(' / ')})`);
