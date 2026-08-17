import { useMemo } from 'react';
import { fmt, fmtInt, fmtWatts } from '../utils/format';
import { useGameStore, getDerived, type Derived } from '../store/gameStore';

interface Props {
  d: Derived;
}

export default function Header({ d }: Props) {
  const credits = useGameStore((s) => s.credits);
  const reset = useGameStore((s) => s.reset);

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
          <span className="stat-label">Power draw</span>
          <span className="stat-value">{fmtWatts(d.watts)}</span>
        </div>
      </div>
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
