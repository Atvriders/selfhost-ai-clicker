import { useGameStore, type Derived } from '../store/gameStore';
import { fmt, fmtInt, fmtRate, fmtBytes, fmtDuration, fmtKW } from '../utils/format';
import PromptFeed from './PromptFeed';

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

function ResBar({ emoji, label, used, total, format = fmtBytes }: {
  emoji: string;
  label: string;
  used: number;
  total: number;
  format?: (n: number) => string;
}) {
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  const cls = pct < 60 ? 'res-ok' : pct < 85 ? 'res-busy' : 'res-warn';
  return (
    <div className="res-row">
      <div className="res-head">
        <span>{emoji} {label}</span>
        <span className="res-nums">{format(used)} / {format(total)} · {Math.round(pct)}%</span>
      </div>
      <div className="res-bar">
        <div className={`res-fill ${cls}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const fmtKWBar = (n: number) => fmtKW(n);

export default function UsersPanel({ d }: Props) {
  const users = useGameStore((s) => s.users);
  const createdAt = useGameStore((s) => s.createdAt);
  const status = loadStatus(d.load);
  const loadPct = Math.min(100, d.load * 100);
  const barCls = !isFinite(d.load) ? 'bar-overload'
    : d.load < 0.6 ? 'bar-good'
    : d.load < 0.85 ? 'bar-busy'
    : d.load < 1 ? 'bar-warn'
    : d.load < 1.5 ? 'bar-overload'
    : 'bar-meltdown';
  const uptime = fmtDuration((Date.now() - createdAt) / 1000);

  return (
    <section className="panel users-panel">
      <h2 className="panel-title">Operations</h2>

      <div className="users-hero">
        <span className="users-count">{fmtInt(users)}</span>
        <span className="users-label">active users</span>
      </div>
      <div className="users-growth">
        {d.growthPerSec >= 0
          ? <span className="ok">+{fmtRate(d.growthPerSec)} signing up</span>
          : <span className="bad">{fmtRate(d.growthPerSec)} churning</span>}
        <span className="dim"> · {fmt(d.growthPct)}%/s · {fmt(d.reqPerSec)} req/s · {d.latencyMs} ms p50 · 🕐 {uptime}</span>
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
        <div className="cell">
          <span className="cell-label">⚡ Electricity</span>
          <span className="cell-value">-{fmt(d.electricity)}/s</span>
        </div>
        <div className="cell">
          <span className="cell-label">🌐 Network</span>
          <span className="cell-value">{fmt(d.netMBps)} MB/s</span>
        </div>
      </div>

      <div className="specs-block">
        <h3>⚡ Power</h3>
        <ResBar emoji="⚡" label="Power" used={d.powerDemandKW} total={d.powerSupplyKW} format={fmtKWBar} />
        {!d.powerOk && (
          <p className="hint">
            ⚠️ Not enough power! The fleet is throttled to <b>{Math.round(d.powerFactor * 100)}%</b> capacity.
            Buy generators in the ⚡ Power tab.
          </p>
        )}
      </div>

      <div className="specs-block">
        <h3>Resource usage</h3>
        <ResBar emoji="🧠" label="AI RAM" used={d.ramUseGB} total={d.ramPoolGB} />
        <ResBar emoji="🎛️" label="AI VRAM" used={d.vramUseGB} total={d.vramPoolGB} />
        <ResBar emoji="💾" label="Disk (library + replicas)" used={d.diskGB} total={d.diskTotalGB} />
      </div>

      <PromptFeed load={d.load} />

      <div className="model-block">
        <h3>Currently hosting</h3>
        <p className="model-name">🤖 {d.bestModel}</p>
        <p className="dim">revenue multiplier ×{d.bestRevMult} · {fmt(d.activeModel.demandPerUser)} tok/s per user</p>
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
