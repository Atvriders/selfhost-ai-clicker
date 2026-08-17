// Tiny Web Audio sound effects — no assets, all synthesized.
let ctx: AudioContext | null = null;
let muted = false;

export function setSoundMuted(m: boolean) {
  muted = m;
}

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function blip(freq: number, dur = 0.08, type: OscillatorType = 'square', vol = 0.04, delay = 0) {
  if (muted) return;
  const c = ac();
  if (!c) return;
  const t = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export const sfx = {
  click: () => blip(880, 0.05, 'square', 0.022),
  buy: () => {
    blip(660, 0.07, 'square', 0.03);
    blip(990, 0.09, 'square', 0.03, 0.06);
  },
  prestige: () => {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => blip(f, 0.16, 'triangle', 0.05, i * 0.09));
  },
};
