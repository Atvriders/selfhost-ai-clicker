import { useEffect, useMemo } from 'react';
import { useGameStore, getDerived } from './store/gameStore';
import { setSoundMuted } from './utils/sound';
import Header from './components/Header';
import ClickPanel from './components/ClickPanel';
import UsersPanel from './components/UsersPanel';
import ShopPanel from './components/ShopPanel';
import { fmt } from './utils/format';

export default function App() {
  const state = useGameStore();
  const tick = useGameStore((s) => s.tick);
  const applyOffline = useGameStore((s) => s.applyOffline);
  const offlineGain = useGameStore((s) => s.offlineGain);
  const clearOfflineGain = useGameStore((s) => s.clearOfflineGain);
  const soundOn = useGameStore((s) => s.soundOn);
  const d = useMemo(() => getDerived(state), [state]);

  useEffect(() => {
    setSoundMuted(!soundOn);
  }, [soundOn]);

  useEffect(() => {
    applyOffline();
    const id = window.setInterval(() => tick(0.25), 250);
    return () => window.clearInterval(id);
  }, [applyOffline, tick]);

  useEffect(() => {
    if (offlineGain > 0) {
      const t = window.setTimeout(clearOfflineGain, 8000);
      return () => window.clearTimeout(t);
    }
  }, [offlineGain, clearOfflineGain]);

  return (
    <div className="app">
      <Header d={d} />
      <main className="main">
        <ClickPanel d={d} />
        <UsersPanel d={d} />
        <ShopPanel d={d} />
      </main>
      {offlineGain > 0 && (
        <div className="offline-toast">
          🌙 While you were away: <b>+{fmt(offlineGain)} credits</b> and your users kept growing.
        </div>
      )}
    </div>
  );
}
