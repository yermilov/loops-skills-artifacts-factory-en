import { QRCodeSVG } from 'qrcode.react';
import type { ComponentProps } from 'react';

/** A QR code that is also a link: the room scans it, and anyone reading the deck on
 *  the web clicks it — every QR on the slides goes through here (Yarik, 16.11.2026).
 *  The anchor is `display: contents`, so the SVG keeps its own box and class and
 *  every slide's layout stays as it was; touch navigation already ignores links. */
export function QrLink(props: ComponentProps<typeof QRCodeSVG>) {
  const href = String(props.value);
  return (
    <a className="ww-qrlink" href={href} target="_blank" rel="noreferrer" aria-label={props.title ?? `Open ${href}`}>
      <QRCodeSVG {...props} />
    </a>
  );
}
