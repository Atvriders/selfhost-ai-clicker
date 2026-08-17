import { useState } from 'react';
import { useGameStore, hardwareCost, BASE_RATE, type Derived } from '../store/gameStore';
import { HARDWARE } from '../data/hardware';
import { CLICK_UPGRADES } from '../data/clickUpgrades';
import { MARKETING } from '../data/marketing';
import { MODELS } from '../data/models';
import { POWER, POWER_COST_GROWTH } from '../data/power';
import { fmt, fmtBytes, fmtKW } from '../utils/format';

type Tab = 'hardware' | 'models' | 'power' | 'click' | 'market';

interface Props {
  d: Derived;
}

export default function ShopPanel({ d }: Props) {
  const [tab, setTab] = useState<Tab>('hardware');
  const credits = useGameStore((s) => s.credits);
  const hardware = useGameStore((s) => s.hardware);
  const upgrades = useGameStore((s) => s.upgrades);
  const marketing = useGameStore((s) => s.marketing);
  const models = useGameStore((s) => s.models);
  const power = useGameStore((s) => s.power);
  const buyHardware = useGameStore((s) => s.buyHardware);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);
  const buyMarketing = useGameStore((s) => s.buyMarketing);
  const buyModel = useGameStore((s) => s.buyModel);
  const buyPower = useGameStore((s) => s.buyPower);

  return (
    <section className="panel shop-panel">
      <div className="tabs">
        <button className={tab === 'hardware' ? 'tab active' : 'tab'} onClick={() => setTab('hardware')}>
          🖥️ Hardware
        </button>
        <button className={tab === 'models' ? 'tab active' : 'tab'} onClick={() => setTab('models')}>
          🧠 Models
        </button>
        <button className={tab === 'power' ? 'tab active' : 'tab'} onClick={() => setTab('power')}>
          ⚡ Power
        </button>
        <button className={tab === 'click' ? 'tab active' : 'tab'} onClick={() => setTab('click')}>
          👆 Clicking
        </button>
        <button className={tab === 'market' ? 'tab active' : 'tab'} onClick={() => setTab('market')}>
          📣 Marketing
        </button>
      </div>

      <div className="shop-list">
        {tab === 'hardware' &&
          HARDWARE.map((h) => {
            const count = hardware[h.id] ?? 0;
            const cost = Math.round(hardwareCost(h.id, count, d.costGrowth) * d.newsCostMult);
            const afford = credits >= cost;
            const fullRev = h.tokensPerSec * h.revMult * BASE_RATE * d.prestigeMult;
            const locked = count === 0 && h !== HARDWARE[0] && !HARDWARE.slice(0, HARDWARE.indexOf(h)).every((p) => (hardware[p.id] ?? 0) > 0);
            return (
              <div key={h.id} className={`card ${locked ? 'locked' : ''}`}>
                <div className="card-head">
                  <span className="card-emoji">{h.emoji}</span>
                  <span className="card-name">{h.name}</span>
                  <span className="card-count">×{count}</span>
                </div>
                <p className="card-flavor">{h.flavor}</p>
                <div className="card-specs">
                  <span>⚙️ {fmt(h.tokensPerSec)} tok/s</span>
                  <span>🧠 {fmtBytes(h.ramGB)} RAM</span>
                  <span>🎛️ {h.vramGB > 0 ? fmtBytes(h.vramGB) + ' VRAM' : 'CPU-only'}</span>
                  <span>💾 {fmtBytes(h.diskGB)} on disk</span>
                  <span>⚡ {h.watts >= 1000 ? fmt(h.watts / 1000) + ' kW' : h.watts + ' W'}</span>
                  <span>🤖 {h.model}</span>
                  <span>💰 up to {fmt(fullRev)}/s</span>
                </div>
                <button className="buy" disabled={!afford || locked} onClick={() => buyHardware(h.id)}>
                  {locked ? '🔒 Buy previous tier first' : `Buy — ${fmt(cost)} CC`}
                </button>
              </div>
            );
          })}

        {tab === 'models' &&
          MODELS.map((m) => {
            const owned = !!models[m.id];
            const isActive = d.activeModel.id === m.id;
            const locked = d.bestTier < m.minTier;
            const afford = credits >= m.cost;
            return (
              <div key={m.id} className={`card ${owned ? 'owned' : ''} ${isActive ? 'model-active' : ''}`}>
                <div className="card-head">
                  <span className="card-emoji">{m.emoji}</span>
                  <span className="card-name">{m.name}</span>
                  {isActive && <span className="active-badge">ACTIVE</span>}
                </div>
                <p className="card-flavor">{m.params} parameters</p>
                <div className="card-specs">
                  <span>💾 {fmtBytes(m.diskGB)} disk</span>
                  <span>🧠 {fmtBytes(m.ramGB)} RAM/srv</span>
                  <span>🎛️ {m.vramGB > 0 ? fmtBytes(m.vramGB) + ' VRAM/srv' : 'CPU-only'}</span>
                  <span>⚡ ×{m.speed} speed</span>
                  <span>💰 ×{m.revMult} revenue</span>
                  <span>👥 {fmt(m.demandPerUser)} tok/s per user</span>
                </div>
                <button className="buy" disabled={owned || !afford || locked} onClick={() => buyModel(m.id)}>
                  {owned
                    ? (isActive ? 'Serving ✓' : 'Owned')
                    : locked
                      ? `🔒 Requires ${HARDWARE[m.minTier].name}`
                      : `License — ${fmt(m.cost)} CC`}
                </button>
              </div>
            );
          })}

        {tab === 'power' &&
          POWER.map((p) => {
            const count = power[p.id] ?? 0;
            const cost = Math.round(p.cost * Math.pow(POWER_COST_GROWTH, count) * d.newsCostMult);
            const afford = credits >= cost;
            const freeDone = p.cost === 0 && count > 0;
            return (
              <div key={p.id} className="card">
                <div className="card-head">
                  <span className="card-emoji">{p.emoji}</span>
                  <span className="card-name">{p.name}</span>
                  <span className="card-count">×{count}</span>
                </div>
                <p className="card-flavor">{p.flavor}</p>
                <div className="card-specs">
                  <span>⚡ {fmtKW(p.kW)}</span>
                  {d.powerDemandKW > d.powerSupplyKW && (
                    <span className="bad">fleet needs {fmtKW(d.powerDemandKW)}</span>
                  )}
                </div>
                <button className="buy" disabled={!afford || freeDone} onClick={() => buyPower(p.id)}>
                  {freeDone ? 'Installed ✓' : `Install — ${fmt(cost)} CC`}
                </button>
              </div>
            );
          })}

        {tab === 'click' &&
          CLICK_UPGRADES.map((u) => {
            const owned = !!upgrades[u.id];
            const afford = credits >= u.cost;
            return (
              <div key={u.id} className={`card ${owned ? 'owned' : ''}`}>
                <div className="card-head">
                  <span className="card-emoji">{u.emoji}</span>
                  <span className="card-name">{u.name}</span>
                </div>
                <p className="card-flavor">{u.flavor}</p>
                <div className="card-specs">
                  <span>👆 +{fmt(u.power)} per click</span>
                </div>
                <button className="buy" disabled={owned || !afford} onClick={() => buyUpgrade(u.id)}>
                  {owned ? 'Owned ✓' : `Buy — ${fmt(u.cost)} CC`}
                </button>
              </div>
            );
          })}

        {tab === 'market' &&
          MARKETING.map((m) => {
            const owned = !!marketing[m.id];
            const afford = credits >= m.cost;
            return (
              <div key={m.id} className={`card ${owned ? 'owned' : ''}`}>
                <div className="card-head">
                  <span className="card-emoji">{m.emoji}</span>
                  <span className="card-name">{m.name}</span>
                </div>
                <p className="card-flavor">{m.flavor}</p>
                <div className="card-specs">
                  <span>👥 +{fmt(m.users)} users</span>
                  <span>📈 +{(m.growth * 100).toFixed(2)}%/s growth</span>
                </div>
                <button className="buy" disabled={owned || !afford} onClick={() => buyMarketing(m.id)}>
                  {owned ? 'Launched ✓' : `Launch — ${fmt(m.cost)} CC`}
                </button>
              </div>
            );
          })}
      </div>
    </section>
  );
}
