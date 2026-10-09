import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { CodeBlockProps } from '../types/slides';

// Prism theme drawn from the WAWTech tokens
const terminalTheme: { [key: string]: React.CSSProperties } = {
  'code[class*="language-"]': {
    color: 'var(--ww-ink)',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--font-size-code)',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    lineHeight: 'var(--line-height-relaxed)',
    tabSize: 2,
    hyphens: 'none',
  },
  'pre[class*="language-"]': {
    color: 'var(--ww-ink)',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--font-size-code)',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    lineHeight: 'var(--line-height-relaxed)',
    tabSize: 2,
    hyphens: 'none',
    padding: 'var(--space-md)',
    margin: 0,
    overflow: 'auto',
    background: 'transparent',
  },
  // WAWTech light panel: ink text on the template's grey card.
  comment: { color: 'var(--ww-text-muted)', fontStyle: 'italic' },
  prolog: { color: 'var(--ww-text-muted)' },
  doctype: { color: 'var(--ww-text-muted)' },
  cdata: { color: 'var(--ww-text-muted)' },
  punctuation: { color: 'var(--ww-text-muted)' },
  namespace: { opacity: 0.7 },
  property: { color: 'var(--ww-violet)' },
  tag: { color: 'var(--ww-violet)' },
  boolean: { color: 'var(--ww-magenta)' },
  number: { color: 'var(--ww-magenta)' },
  constant: { color: 'var(--ww-magenta)' },
  symbol: { color: 'var(--ww-magenta)' },
  deleted: { color: 'var(--terminal-red)' },
  selector: { color: 'var(--terminal-green)' },
  string: { color: 'var(--terminal-green)' },
  char: { color: 'var(--terminal-green)' },
  builtin: { color: 'var(--ww-violet)' },
  inserted: { color: 'var(--terminal-green)' },
  regex: { color: 'var(--terminal-green)' },
  'attr-value': { color: 'var(--terminal-green)' },
  operator: { color: 'var(--ww-purple)' },
  entity: { color: 'var(--ww-magenta)', cursor: 'help' },
  url: { color: 'var(--terminal-green)' },
  atrule: { color: 'var(--ww-violet)' },
  'attr-name': { color: 'var(--ww-violet)' },
  function: { color: 'var(--ww-purple)', fontWeight: 600 },
  'class-name': { color: 'var(--ww-purple)', fontWeight: 600 },
  keyword: { color: 'var(--ww-magenta)' },
  title: { color: 'var(--ww-magenta)', fontWeight: 600 },
  list: { color: 'var(--ww-magenta)' },
  'front-matter': { color: 'var(--ww-purple)' },
  important: { color: 'var(--ww-magenta)', fontWeight: 'bold' },
  bold: { fontWeight: 'bold' },
  italic: { fontStyle: 'italic' },
  variable: { color: 'var(--ww-violet)' },
};

export function CodeBlock({
  code,
  language = 'typescript',
  showLineNumbers = false,
}: CodeBlockProps) {
  // No window chrome (traffic-light dots / filename / copy button) — code
  // blocks across the deck render as a bare bordered panel.
  return (
    <div className="code-block">
      <SyntaxHighlighter
        language={language}
        style={terminalTheme}
        showLineNumbers={showLineNumbers}
        wrapLines
        customStyle={{
          margin: 0,
          padding: 'var(--space-md)',
          background: 'transparent',
        }}
        codeTagProps={{
          style: {
            fontFamily: 'var(--font-mono)',
          },
        }}
      >
        {code.trim()}
      </SyntaxHighlighter>
    </div>
  );
}
