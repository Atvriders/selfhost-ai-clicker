// Marketing campaigns: instant user spike + permanent user-growth boost.
// Growth boost raises the per-second user growth coefficient R
// (see the store: R = BASE_GROWTH + sum of owned marketing boosts).

export interface MarketingDef {
  id: string;
  name: string;
  flavor: string;
  users: number;   // instant users added
  growth: number;  // permanent +growth coefficient per second
  cost: number;
  emoji: string;
}

export const MARKETING: MarketingDef[] = [
  { id: 'reddit',    name: 'Reddit Launch Thread',  flavor: '“I self-host my own ChatGPT”',          users: 25,     growth: 0.001,  cost: 150,      emoji: '🧵' },
  { id: 'discord',   name: 'Discord Community',     flavor: 'Nightly fine-tune sessions',             users: 120,    growth: 0.0015, cost: 1200,     emoji: '💬' },
  { id: 'yt',        name: 'YouTube Tech Review',   flavor: '“I replaced the cloud with THIS”',        users: 600,    growth: 0.002,  cost: 9000,     emoji: '🎬' },
  { id: 'hn',        name: 'Hacker News Front Page',flavor: 'Show HN: self-hosted frontier AI',        users: 3000,   growth: 0.003,  cost: 70000,    emoji: '📰' },
  { id: 'conf',      name: 'Conference Keynote',    flavor: 'Live demo in front of 5,000 nerds',       users: 15000,  growth: 0.004,  cost: 600000,   emoji: '🎤' },
  { id: 'tv',        name: 'National TV Segment',   flavor: 'Evening news: “The man with a data center in his garage”', users: 80000, growth: 0.006, cost: 5000000, emoji: '📺' },
  { id: 'superbowl', name: 'Super Bowl Ad',         flavor: '30 seconds of GPUs and explosions',       users: 400000, growth: 0.008,  cost: 45000000, emoji: '🏈' },
];
