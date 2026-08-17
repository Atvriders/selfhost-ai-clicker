import { useGameStore, type Derived } from '../store/gameStore';
import { fmt, fmtInt, fmtRate, fmtBytes } from '../utils/format';

interface Props {
  d: Derived;
}

function loadStatus(load: number): { text: string; cls: string } {
  if (!isFinite(load)) return { text: '⚠️ No hardware online!', cls: 'status-overload' };
  if (load < 0.6) return { text: '🟢 Healthy — room to grow', cls: 'status-good' };
  if (load < 0.85) return { text: '🟡 Getting busy', cls: 'status-busy' };
  if (load < 1) return { text: '🟠 Near capacity — buy more hardware', cls: 'status-warn' };
  if (load < 1.5) return { text: '🔴 OVERLOADED — users are queued', cls: 'status-overload' };
  return { text: '⛔ MELTDOWN — users are leaving!', cls: 'status-meltdown' };
}

export default function UsersPanel({ d }: Props) {
  const users = useGameStore((s) => s.users);
  const status = loadStatus(d.load);
  const loadPct = Math.min(100, d.load * 100);
  const barCls = !isFinite(d.load) ? 'bar-overload'
    : d.load < 0.6 ? 'bar-good'
    : d.load < 0.85 ? 'bar-busy'
    : d.load < 1 ? 'bar-warn'
    : d.load < 1.5 ? 'bar-overload'
    : 'bar-meltdown';

  return (
    <section className="panel users-panel">
      <h2 className="panel-title">Your Users</h2>

      <div className="users-hero">
        <span className="users-count">{fmtInt(users)}</span>
        <span className="users-label">active users</span>
      </div>
      <div className="users-growth">
        {d.growthPerSec >= 0
          ? <span className="ok">+{fmtRate(d.growthPerSec)} signing up</span>
          : <span className="bad">{fmtRate(d.growthPerSec)} churning</span>}
        <span className="dim"> · {fmt(d.growthPct)}%/s</span>
      </div>

      <div className="load-block">
        <div className="load-row">
          <span className="load-label">Server load</span>
          <span className="load-pct">{isFinite(d.load) ? Math.round(d.load * 100) : '∞'}%</span>
        </div>
        <div className="load-bar">
          <div className={`load-fill ${barCls}`} style={{ width: `${loadPct}%` }} />
        </div>
        <p className={`status ${status.cls}`}>{status.text}</p>
      </div>

      <div className="grid-stats">
        <div className="cell">
          <span className="cell-label">Demand</span>
          <span className="cell-value">{fmt(d.demand)} tok/s</span>
        </div>
        <div className="cell">
          <span className="cell-label">Capacity</span>
          <span className="cell-value">{fmt(d.capacity)} tok/s</span>
        </div>
        <div className="cell">
          <span className="cell-label">Serving</span>
          <span className="cell-value ok">{fmt(d.servedTps)} tok/s</span>
        </div>
        <div className="cell">
          <span className="cell-label">Queued</span>
          <span className={`cell-value ${d.queueTps > 0 ? 'bad' : ''}`}>{fmt(d.queueTps)} tok/s</span>
        </div>
      </div>

      <div className="specs-block">
        <h3>Hardware specs</h3>
        <div className="grid-stats three">
          <div className="cell">
            <span className="cell-label">🧠 Total RAM</span>
            <span className="cell-value">{fmtBytes(d.ramGB)}</span>
          </div>
          <div className="cell">
            <span className="cell-label">🎛️ Total VRAM</span>
            <span className="cell-value">{fmtBytes(d.vramGB)}</span>
          </div>
          <div className="cell">
            <span className="cell-label">💾 Models on disk</span>
            <span className="cell-value">{fmtBytes(d.diskGB)}</span>
          </div>
        </div>
      </div>

      <div className="model-block">
        <h3>Currently hosting</h3>
        <p className="model-name">🤖 {d.bestModel}</p>
        <p className="dim">revenue multiplier ×{d.bestRevMult} · {fmt(d.best.demandPerUser)} tok/s per user</p>
        {d.queueTps > 0 && (
          <p className="hint">
            💡 Users are waiting on <b>{fmt(d.queueTps)} tok/s</b> of unserved demand.
            Expand capacity to capture it — and stop them leaving.
          </p>
        )}
      </div>
    </section>
  );
}
