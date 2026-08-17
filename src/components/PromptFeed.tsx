import { useEffect, useRef, useState } from 'react';
import { PROMPT_POOL, USER_POOL } from '../data/prompts';

interface Entry {
  id: number;
  user: string;
  prompt: string;
  queued: boolean;
}

/** Small live feed of fake user requests. Slows down and shows queueing when overloaded. */
export default function PromptFeed({ load }: { load: number }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const stateRef = useRef(load);
  stateRef.current = load;
  let seq = 0;

  useEffect(() => {
    let alive = true;
    let timer: number;
    const loop = () => {
      if (!alive) return;
      const overloaded = stateRef.current > 1;
      setEntries((prev) => {
        const user = USER_POOL[Math.floor(Math.random() * USER_POOL.length)];
        const prompt = PROMPT_POOL[Math.floor(Math.random() * PROMPT_POOL.length)];
        return [
          { id: ++seq, user, prompt, queued: overloaded && Math.random() < 0.6 },
          ...prev,
        ].slice(0, 7);
      });
      const delay = overloaded ? 2600 : 900 + Math.random() * 1500;
      timer = window.setTimeout(loop, delay);
    };
    timer = window.setTimeout(loop, 700);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className="prompt-feed">
      <h3>Live requests</h3>
      {entries.length === 0 && <p className="feed-empty">Waiting for requests…</p>}
      <ul>
        {entries.map((e) => (
          <li key={e.id} className={e.queued ? 'queued' : ''}>
            <span className="pf-user">{e.user}:</span>
            <span className="pf-prompt">{e.prompt}</span>
            {e.queued && <span className="pf-badge">⏳ queued</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
