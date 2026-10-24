import { ReactNode } from 'react';
import { MONO, SANS } from './theme';

/** A macOS-ish window: traffic lights plus either a URL bar or a title. */
export function Window({
  url,
  title,
  background,
  children,
}: {
  url?: string;
  title?: string;
  background: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 56,
        borderRadius: 18,
        overflow: 'hidden',
        background,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 40px 120px rgba(10,4,24,0.28)',
      }}
    >
      <div
        style={{
          height: 64,
          flexShrink: 0,
          background: url ? '#2b2b31' : '#2b2b31',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '0 22px',
        }}
      >
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
          <div key={c} style={{ width: 16, height: 16, borderRadius: '50%', background: c }} />
        ))}
        {url ? (
          <div
            style={{
              marginLeft: 20,
              flex: 1,
              height: 38,
              borderRadius: 19,
              background: '#1d1d22',
              color: '#c8c8d0',
              fontFamily: SANS,
              fontSize: 28,
              display: 'flex',
              alignItems: 'center',
              padding: '0 20px',
            }}
          >
            {url}
          </div>
        ) : (
          <div
            style={{
              marginLeft: 20,
              color: '#c8c8d0',
              fontFamily: MONO,
              fontSize: 28,
            }}
          >
            {title}
          </div>
        )}
      </div>
      <div style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>{children}</div>
    </div>
  );
}

/** Small corner note marking a frame as a reconstruction, not a recording. */
export function RecreationMark({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: 'absolute',
        right: 60,
        bottom: 16,
        fontFamily: SANS,
        fontSize: 28,
        color: 'rgba(10,4,24,0.45)',
        letterSpacing: 1,
      }}
    >
      {children}
    </div>
  );
}
