import { useGameStore } from '../store/gameStore';
import { HARDWARE } from '../data/hardware';
import { fmt } from '../utils/format';

const MAX_TILES = 48;

/** Visual rack: one blinking tile per owned unit. Pure CSS LEDs, no timers. */
export default function FleetPanel() {
  const hardware = useGameStore((s) => s.hardware);
  const tiles: { emoji: string; key: string }[] = [];
  let total = 0;

  for (const h of HARDWARE) {
    const c = hardware[h.id] ?? 0;
    total += c;
    const shown = Math.min(c, 8);
    for (let i = 0; i < shown; i++) {
      tiles.push({ emoji: h.emoji, key: `${h.id}-${i}` });
    }
  }
  const hidden = total - tiles.length;
  const shownTiles = tiles.slice(0, MAX_TILES);

  return (
    <div className="fleet">
      <div className="fleet-head">
        <h3>Your fleet</h3>
        <span className="fleet-count">{fmt(total)} units</span>
      </div>
      <div className="fleet-grid">
        {shownTiles.map((t, i) => (
          <span key={t.key} className="fleet-tile" title={t.key.split('-')[0]}>
            <span className="fleet-emoji">{t.emoji}</span>
            <span className="led" style={{ animationDelay: `-${((i * 137) % 97) / 10}s` }} />
          </span>
        ))}
        {hidden > 0 && <span className="fleet-more">+{fmt(hidden)}</span>}
      </div>
    </div>
  );
}
