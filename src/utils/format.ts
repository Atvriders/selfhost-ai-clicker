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

/** Byte display from GB: 229 -> "229 GB", 13824 -> "13.82 TB", 3.5M -> "3.54 PB" */
export function fmtBytes(gb: number): string {
  if (gb >= 1e6) return fmt(gb / 1e6) + ' PB';
  if (gb >= 1e3) return fmt(gb / 1e3) + ' TB';
  return fmt(gb) + ' GB';
}

/** Uptime display: 95 -> "1m 35s", 7320 -> "2h 2m", 100000 -> "1d 3h" */
export function fmtDuration(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

/** Power display: 1.5 -> "1.5 kW", 2000 -> "2 MW", 1e6 -> "1 GW" */
export function fmtKW(kw: number): string {
  if (kw >= 1e6) return fmt(kw / 1e6) + ' GW';
  if (kw >= 1e3) return fmt(kw / 1e3) + ' MW';
  return fmt(kw) + ' kW';
}
