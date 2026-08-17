import { useGameStore, PERK_DEFS } from '../store/gameStore';

/** Shown after an IPO: pick one investor perk. */
export default function PerkModal() {
  const pending = useGameStore((s) => s.pendingPerk);
  const perks = useGameStore((s) => s.perks);
  const choosePerk = useGameStore((s) => s.choosePerk);
  if (!pending) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>🏦 You went public!</h2>
        <p className="modal-sub">+25% earnings secured. Choose your investor perk:</p>
        <div className="perk-grid">
          {PERK_DEFS.map((p) => (
            <button key={p.id} className="perk-card" onClick={() => choosePerk(p.id)}>
              <span className="perk-emoji">{p.emoji}</span>
              <span className="perk-name">{p.name}</span>
              <span className="perk-desc">{p.desc}</span>
              <span className="perk-owned">owned ×{perks[p.id]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
