// WCAG helpers for computed `rgb(r, g, b)` strings.
export const parseRgb = (s) => {
  const m = s.match(/rgba?\(([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)/);
  if (!m) throw new Error(`not an rgb() color: ${s}`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
};
const lin = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
export const contrast = (a, b) => {
  const [x, y] = [luminance(parseRgb(a)), luminance(parseRgb(b))];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
export const hue = (s) => {
  const [r, g, b] = parseRgb(s).map((v) => v / 255);
  const max = Math.max(r, g, b), d = max - Math.min(r, g, b);
  if (!d) return 0;
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
};
export const hueDistance = (a, b) => { const d = Math.abs(hue(a) - hue(b)); return Math.min(d, 360 - d); };
