// Random high-activity news events. One active at a time; they last a fixed
// duration and apply live multipliers to growth, revenue, clicks, or prices.

export interface NewsEvent {
  id: string;
  emoji: string;
  title: string;
  body: string;
  duration: number;   // seconds
  growthMult: number; // user growth coefficient multiplier
  revMult: number;    // revenue multiplier
  clickMult: number;  // click power multiplier
  costMult: number;   // hardware price multiplier
  instantUsers: number;
  endsAt: number;     // filled at spawn
}

export const NEWS_EVENTS: Omit<NewsEvent, 'endsAt'>[] = [
  { id: 'frenzy', emoji: '🎉', title: 'New model release frenzy!', body: 'The community is hyped — signups surge.', duration: 90, growthMult: 2, revMult: 1, clickMult: 1, costMult: 1, instantUsers: 0 },
  { id: 'outage', emoji: '☁️', title: 'MegaCorp cloud outage', body: 'Refugees from the big clouds arrive. Revenue up!', duration: 120, growthMult: 1, revMult: 1.5, clickMult: 1, costMult: 1, instantUsers: 0 },
  { id: 'viral', emoji: '🐦', title: 'Viral tweet', body: 'A post about your service explodes. Click power ×3!', duration: 45, growthMult: 1, revMult: 1, clickMult: 3, costMult: 1, instantUsers: 0 },
  { id: 'press', emoji: '📰', title: 'Tech press feature', body: 'Journalists flood in, and their readers follow.', duration: 60, growthMult: 1.5, revMult: 1, clickMult: 1, costMult: 1, instantUsers: 100 },
  { id: 'surge', emoji: '⚡', title: 'Power surge!', body: 'UPS is struggling — serving stalls for a bit.', duration: 15, growthMult: 1, revMult: 0, clickMult: 1, costMult: 1, instantUsers: 0 },
  { id: 'drill', emoji: '🧯', title: 'Security drill gone wrong', body: 'PR damage — users are churning faster.', duration: 60, growthMult: -1, revMult: 1, clickMult: 1, costMult: 1, instantUsers: 0 },
  { id: 'sale', emoji: '🏷️', title: 'Supplier flash sale', body: 'Hardware is 30% off for a short window!', duration: 120, growthMult: 1, revMult: 1, clickMult: 1, costMult: 0.7, instantUsers: 0 },
  { id: 'fiber', emoji: '📡', title: 'Backhoe vs fiber', body: 'A backhoe cut your uplink. Half revenue until repaired.', duration: 90, growthMult: 1, revMult: 0.5, clickMult: 1, costMult: 1, instantUsers: 0 },
];
