import { useGameStore, type Derived } from '../store/gameStore';
import { fmt, fmtInt } from '../utils/format';
import FleetPanel from './FleetPanel';

interface Props {
  d: Derived;
}

export default function ClickPanel({ d }: Props) {
  const click = useGameStore((s) => s.click);
  const totalClicks = useGameStore((s) => s.totalClicks);
  const totalTokens = useGameStore((s) => s.totalTokens);
  const milestones = useGameStore((s) => s.milestones);

  return (
    <section className="panel click-panel">
      <h2 className="panel-title">Serve Requests</h2>
      <button className="click-button" onClick={click} aria-label="Serve a request">
        <span className="click-emoji">⚡</span>
        <span className="click-label">SERVE</span>
        <span className="click-power">+{fmt(d.clickPower)} credits</span>
      </button>
      <div className="mini-stats">
        <div>
          <span className="mini-label">Clicks served</span>
          <span className="mini-value">{fmtInt(totalClicks)}</span>
        </div>
        <div>
          <span className="mini-label">Tokens served (all time)</span>
          <span className="mini-value">{fmt(totalTokens)}</span>
        </div>
      </div>
      <FleetPanel />
      <div className="feed">
        <h3>Activity</h3>
        {milestones.length === 0 && <p className="feed-empty">Buy your first hardware upgrade to get started.</p>}
        {[...milestones].slice(-4).reverse().map((m) => (
          <p key={m.id} className="feed-item">{m.text}</p>
        ))}
      </div>
    </section>
  );
}
