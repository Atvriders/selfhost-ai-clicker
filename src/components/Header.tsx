import { fmt, fmtWatts } from '../utils/format';
import { useGameStore, ipoRequirement, type Derived } from '../store/gameStore';

interface Props {
  d: Derived;
}

export default function Header({ d }: Props) {
  const credits = useGameStore((s) => s.credits);
  const reset = useGameStore((s) => s.reset);
  const ipo = useGameStore((s) => s.ipo);
  const ipos = useGameStore((s) => s.ipos);
  const lifetimeEarned = useGameStore((s) => s.lifetimeEarned);
  const soundOn = useGameStore((s) => s.soundOn);
  const toggleSound = useGameStore((s) => s.toggleSound);
  const req = ipoRequirement(ipos);
  const ipoReady = lifetimeEarned >= req;

  return (
    <header className="header">
      <div className="header-title">
        <span className="logo">🖥️</span>
        <div>
          <h1>SelfHost.AI</h1>
          <p>your own AI cloud — click to serve</p>
        </div>
      </div>
      <div className="header-stats">
        <div className="stat">
          <span className="stat-label">Compute Credits</span>
          <span className="stat-value credits">{fmt(credits)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Income</span>
          <span className="stat-value ok">+{fmt(d.net)}/s</span>
        </div>
        <div className="stat">
          <span className="stat-label">Throughput</span>
          <span className="stat-value">{fmt(d.servedTps)} tok/s</span>
        </div>
        <div className="stat">
          <span className="stat-label">Power draw</span>
          <span className="stat-value">{fmtWatts(d.watts)}</span>
        </div>
      </div>
      <button
        className="btn-ipo"
        disabled={!ipoReady}
        title={
          ipoReady
            ? `Go public: reset progress, keep IPOs, +25% earnings forever`
            : `Requires ${fmt(req)} lifetime credits`
        }
        onClick={() => {
          if (
            window.confirm(
              `IPO #${ipos + 1} — sell shares, reset your empire, and keep a permanent +25% earnings boost?`
            )
          )
            ipo();
        }}
      >
        🏦 IPO ×{fmt(d.prestigeMult)}
      </button>
      <button className="btn-icon" onClick={toggleSound} title={soundOn ? 'Mute sounds' : 'Unmute sounds'}>
        {soundOn ? '🔊' : '🔇'}
      </button>
      <button
        className="btn-reset"
        onClick={() => {
          if (window.confirm('Wipe your self-hosted empire and start over?')) reset();
        }}
        title="Reset game"
      >
        ↺ Reset
      </button>
    </header>
  );
}
