const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc'];

/** Compact number formatting: 1234 -> "1.23K", 5e6 -> "5M" */
export function fmt(n: number): string {
  if (!isFinite(n)) return '∞';
  if (n < 0) return '-' + fmt(-n);
  if (n < 1000) {
    if (Number.isInteger(n)) return n.toString();
    return n.toFixed(2).replace(/\.?0+$/, '');
  }
  const tier = Math.min(Math.floor(Math.log10(n) / 3), SUFFIXES.length - 1);
  const scaled = n / Math.pow(10, tier * 3);
  const digits = scaled >= 100 ? 1 : 2;
  return scaled.toFixed(digits).replace(/\.?0+$/, '') + SUFFIXES[tier];
}

/** Rate formatting with one decimal for small values: fmtRate(0.25) -> "0.3/s" */
export function fmtRate(n: number): string {
  if (Math.abs(n) < 1000) return n.toFixed(1) + '/s';
  return fmt(n) + '/s';
}

/** Plain integer with thousands separators */
export function fmtInt(n: number): string {
  return Math.floor(n).toLocaleString('en-US');
}

/** Watts display: 8000 -> "8 kW", 1e6 -> "1 MW" */
export function fmtWatts(w: number): string {
  if (w >= 1e6) return fmt(w / 1e6) + ' MW';
  if (w >= 1e3) return fmt(w / 1e3) + ' kW';
  return fmt(w) + ' W';
}
