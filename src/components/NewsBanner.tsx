import { useGameStore } from '../store/gameStore';

/** Floating banner for the active high-activity news event, with countdown. */
export default function NewsBanner() {
  const news = useGameStore((s) => s.news);
  if (!news || Date.now() >= news.endsAt) return null;
  const left = Math.max(0, Math.ceil((news.endsAt - Date.now()) / 1000));

  return (
    <div className="news-banner">
      <span className="news-emoji">{news.emoji}</span>
      <span className="news-title">{news.title}</span>
      <span className="news-body">{news.body}</span>
      <span className="news-timer">{left}s</span>
    </div>
  );
}
