/**
 * Pure SVG icon generators for map markers. No DOM / Google Maps dependency so
 * they can be unit-tested in isolation.
 */

const RED = '#DC2626'; // red-600
const RED_DARK = '#991B1B'; // red-800 — used for the selected/active state
const WHITE = '#FFFFFF';

function escapeXml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Rounded price bubble with a downward arrow (matches the existing brand shape, now red). */
export function priceLabelSvg(selected: boolean, price: number): string {
  const label = price > 0 ? `$${Math.round(price / 1000)}k` : 'NEOS';
  const bg = selected ? RED_DARK : RED;
  const safeLabel = escapeXml(label);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="76" height="38" viewBox="0 0 76 38">` +
    `<rect x="1" y="1" width="74" height="30" rx="15" fill="${bg}" stroke="${bg}" stroke-width="2"/>` +
    `<path d="M34 30l4 6 4-6" fill="${bg}"/>` +
    `<text x="38" y="21" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="${WHITE}">${safeLabel}</text>` +
    `</svg>`
  );
}

/** Red circular cluster marker displaying the number of properties. */
export function clusterSvg(count: number): string {
  const label = count > 99 ? '99+' : String(count);
  const fontSize = label.length >= 3 ? 26 : 30;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56">` +
    `<circle cx="28" cy="28" r="26" fill="${RED}" stroke="${WHITE}" stroke-width="3"/>` +
    `<text x="28" y="38" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="700" fill="${WHITE}">${escapeXml(label)}</text>` +
    `</svg>`
  );
}

export function svgDataUri(svg: string): string {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
