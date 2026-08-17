import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { HARDWARE, HARDWARE_COST_GROWTH, HardwareDef } from '../data/hardware';
import { CLICK_UPGRADES, BASE_CLICK_POWER } from '../data/clickUpgrades';
import { MARKETING } from '../data/marketing';
import { MODELS, ModelDef } from '../data/models';
import { NEWS_EVENTS, NewsEvent } from '../data/news';
import { POWER, POWER_COST_GROWTH } from '../data/power';
import { sfx } from '../utils/sound';

// ---------- Economy constants (tuning guide in BALANCE.md) ----------
export const BASE_RATE = 0.05;          // credits per token/s served, scaled by model revMult
export const ELECTRICITY_COST = 0.001;  // credits per watt per second (fuel/electricity)
export const BASE_GROWTH = 0.005;       // user growth coefficient per second
export const SIGNUP_TRICKLE = 0.05;     // absolute signups/s so users never hit 0
export const CHURN_COEF = 0.015;        // churn per second per 1x overload
export const CHURN_CAP = 0.03;          // max churn fraction per second
export const OFFLINE_CAP_S = 3600;      // offline simulation cap (1 hour)

export interface Milestone {
  id: string;
  text: string;
  at: number;
}

export interface Perks {
  venture: number; // 💰 +10% earnings each
  growth: number;  // 📈 +0.15%/s user growth each
  partner: number; // 🛠️ -1.5% hardware cost growth each (floor 5%)
}

export const PERK_DEFS: { id: keyof Perks; name: string; emoji: string; desc: string }[] = [
  { id: 'venture', name: 'Venture Money', emoji: '💰', desc: '+10% to all earnings, forever' },
  { id: 'growth', name: 'Growth Hacker', emoji: '📈', desc: '+0.15%/s user growth, forever' },
  { id: 'partner', name: 'Hardware Partner', emoji: '🛠️', desc: '-1.5% cost scaling per hardware copy (floor 5%)' },
];

export interface Derived {
  best: HardwareDef;
  bestTier: number;      // index of the highest hardware tier owned
  activeModel: ModelDef; // model users are currently hitting
  capacity: number;      // tokens/s total (× active model speed)
  demand: number;        // tokens/s requested by users
  load: number;          // demand / capacity (may exceed 1)
  servedTps: number;     // tokens/s actually served
  revenue: number;       // credits/s gross
  watts: number;
  ramGB: number;         // total system RAM across all hardware
  vramGB: number;        // total VRAM across all hardware
  diskGB: number;        // total model files on disk (== disk used)
  ramUseGB: number;      // RAM actually used
  vramUseGB: number;     // VRAM actually used
  diskTotalGB: number;   // total storage capacity
  electricity: number;   // credits/s
  net: number;           // credits/s after electricity
  clickPower: number;
  prestigeMult: number;  // 1 + 0.25 × IPOs + 0.10 × venture perks
  costGrowth: number;    // hardware cost multiplier per owned copy
  latencyMs: number;     // p50 latency, rises with load
  reqPerSec: number;     // requests per second
  netMBps: number;       // network throughput (flavor)
  newsCostMult: number;  // hardware price modifier from active news
  powerSupplyKW: number; // total generation capacity
  powerDemandKW: number; // total fleet draw
  powerFactor: number;   // 0.1–1.0 throttle applied when under-powered
  powerOk: boolean;
  growthPerSec: number;  // signed users/s
  growthPct: number;     // % per second
  queueTps: number;      // unserved demand
  bestModel: string;
  bestRevMult: number;
}

export interface GameState {
  credits: number;
  hardware: Record<string, number>;
  upgrades: Record<string, boolean>;
  marketing: Record<string, boolean>;
  models: Record<string, boolean>; // licensed models (your library on disk)
  modelsGrantedV2: boolean;        // one-time grant of legacy default models
  power: Record<string, number>;   // owned power sources
  news: NewsEvent | null;          // active high-activity news event
  users: number;
  totalClicks: number;
  totalTokens: number;
  totalEarned: number;
  lifetimeEarned: number; // never reset — gates IPOs
  ipos: number;           // prestige count: +25% earnings each
  perks: Perks;           // IPO perk picks
  pendingPerk: boolean;   // waiting for player to pick an IPO perk
  soundOn: boolean;
  milestones: Milestone[];
  createdAt: number;
  lastSavedAt: number;
  offlineGain: number;
  click: () => void;
  buyHardware: (id: string) => void;
  buyUpgrade: (id: string) => void;
  buyMarketing: (id: string) => void;
  buyModel: (id: string) => void;
  buyPower: (id: string) => void;
  ipo: () => void;
  choosePerk: (id: keyof Perks) => void;
  toggleSound: () => void;
  tick: (dt: number) => void;
  applyOffline: () => void;
  clearOfflineGain: () => void;
  reset: () => void;
}

const marketingGrowthSum = (m: Record<string, boolean>) =>
  MARKETING.reduce((a, def) => a + (m[def.id] ? def.growth : 0), 0);

export function getDerived(s: GameState): Derived {
  const owned = HARDWARE.filter((h) => (s.hardware[h.id] ?? 0) > 0);
  const best = owned.length ? owned[owned.length - 1] : HARDWARE[0];
  const bestTier = owned.length ? HARDWARE.indexOf(best) : 0;
  const ownedModels = MODELS.filter((m) => s.models[m.id] && m.minTier <= bestTier);
  const activeModel = ownedModels.length ? ownedModels[ownedModels.length - 1] : MODELS[0];
  const activeNews = s.news && Date.now() < s.news.endsAt ? s.news : null;
  const watts = HARDWARE.reduce((a, h) => a + (s.hardware[h.id] ?? 0) * h.watts, 0);
  const powerSupplyKW = POWER.reduce((a, p) => a + (s.power[p.id] ?? 0) * p.kW, 0);
  const powerDemandKW = watts / 1000;
  const powerMult = activeNews?.powerMult ?? 1;
  const powerFactor =
    powerSupplyKW <= 0 ? 0.1 : Math.min(1, (powerSupplyKW * powerMult) / powerDemandKW);
  const capacity =
    HARDWARE.reduce((a, h) => a + (s.hardware[h.id] ?? 0) * h.tokensPerSec, 0) *
    activeModel.speed * powerFactor;
  const ramGB = HARDWARE.reduce((a, h) => a + (s.hardware[h.id] ?? 0) * h.ramGB, 0);
  const vramGB = HARDWARE.reduce((a, h) => a + (s.hardware[h.id] ?? 0) * h.vramGB, 0);
  const diskGB = MODELS.reduce((a, m) => a + (s.models[m.id] ? m.diskGB : 0), 0);
  const ramUseGB = HARDWARE.reduce((a, h) => {
    const count = s.hardware[h.id] ?? 0;
    const tier = HARDWARE.indexOf(h);
    return a + count * (tier >= activeModel.minTier ? activeModel.ramGB : h.ramUseGB);
  }, 0);
  const vramUseGB = HARDWARE.reduce((a, h) => {
    const count = s.hardware[h.id] ?? 0;
    const tier = HARDWARE.indexOf(h);
    return a + count * (tier >= activeModel.minTier ? activeModel.vramGB : h.vramUseGB);
  }, 0);
  const diskTotalGB = HARDWARE.reduce((a, h) => a + (s.hardware[h.id] ?? 0) * h.diskTotalGB, 0);
  const prestigeMult = 1 + 0.25 * s.ipos + 0.1 * s.perks.venture;
  const costGrowth = Math.max(1.05, HARDWARE_COST_GROWTH - 0.015 * s.perks.partner);
  const demand = s.users * activeModel.demandPerUser;
  const load = capacity > 0 ? demand / capacity : (s.users > 0 ? Infinity : 0);
  const servedTps = Math.min(capacity, demand);
  const revenue =
    servedTps * activeModel.revMult * BASE_RATE * prestigeMult * (activeNews?.revMult ?? 1);
  const electricity = watts * ELECTRICITY_COST;
  const clickPower =
    (BASE_CLICK_POWER +
      CLICK_UPGRADES.reduce((a, u) => a + (s.upgrades[u.id] ? u.power : 0), 0)) *
    prestigeMult * (activeNews?.clickMult ?? 1);
  const R = (BASE_GROWTH + marketingGrowthSum(s.marketing) + 0.0015 * s.perks.growth) * (activeNews?.growthMult ?? 1);
  const growthPerSec = load <= 1
    ? s.users * R * Math.max(0, 1 - load) + (load < 1.2 ? SIGNUP_TRICKLE : 0)
    : -s.users * Math.min(CHURN_CAP, CHURN_COEF * (load - 1));
  const latencyMs = Math.round(
    20 + 18 * Math.min(load, 3) + Math.max(0, demand - capacity) / 40 + (1 - powerFactor) * 500
  );
  const reqPerSec = demand / 150; // ~150 tokens per request
  const netMBps = servedTps / 50; // flavor network throughput
  return {
    best,
    bestTier,
    activeModel,
    capacity,
    demand,
    load,
    servedTps,
    revenue,
    watts,
    ramGB,
    vramGB,
    diskGB,
    ramUseGB,
    vramUseGB,
    diskTotalGB,
    electricity,
    net: revenue - electricity,
    clickPower,
    prestigeMult,
    costGrowth,
    growthPerSec,
    growthPct: s.users > 0 ? (growthPerSec / s.users) * 100 : 0,
    queueTps: Math.max(0, demand - capacity),
    latencyMs,
    reqPerSec,
    netMBps,
    newsCostMult: activeNews?.costMult ?? 1,
    powerSupplyKW,
    powerDemandKW,
    powerFactor,
    powerOk: powerDemandKW <= powerSupplyKW,
    bestModel: activeModel.name,
    bestRevMult: activeModel.revMult,
  };
}

export function hardwareCost(id: string, ownedCount: number, growth: number = HARDWARE_COST_GROWTH): number {
  const def = HARDWARE.find((h) => h.id === id)!;
  return Math.round(def.cost * Math.pow(growth, ownedCount));
}

/** Lifetime earnings required for IPO number N: 1B, 10B, 100B, ... */
export function ipoRequirement(ipos: number): number {
  return 1e9 * Math.pow(10, ipos);
}

const freshState = () => ({
  credits: 0,
  hardware: { rpi5: 2 } as Record<string, number>,
  upgrades: {} as Record<string, boolean>,
  marketing: {} as Record<string, boolean>,
  models: { tinyllama: true } as Record<string, boolean>,
  modelsGrantedV2: false,
  power: { outlet: 1 } as Record<string, number>,
  news: null as NewsEvent | null,
  users: 8,
  totalClicks: 0,
  totalTokens: 0,
  totalEarned: 0,
  lifetimeEarned: 0,
  ipos: 0,
  perks: { venture: 0, growth: 0, partner: 0 } as Perks,
  pendingPerk: false,
  soundOn: true,
  milestones: [] as Milestone[],
  createdAt: Date.now(),
  lastSavedAt: Date.now(),
  offlineGain: 0,
});

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...freshState(),

      click: () =>
        set((s) => {
          const p = getDerived(s).clickPower;
          if (s.soundOn) sfx.click();
          return {
            credits: s.credits + p,
            totalClicks: s.totalClicks + 1,
            totalEarned: s.totalEarned + p,
            lifetimeEarned: s.lifetimeEarned + p,
          };
        }),

      buyHardware: (id) =>
        set((s) => {
          const count = s.hardware[id] ?? 0;
          const d = getDerived(s);
          const cost = Math.round(hardwareCost(id, count, d.costGrowth) * d.newsCostMult);
          if (s.credits < cost) return {};
          const def = HARDWARE.find((h) => h.id === id)!;
          const milestones = count === 0
            ? [...s.milestones.slice(-7), {
                id: `${id}-${Date.now()}`,
                text: `${def.emoji} ${def.name} online — now hosting ${def.model}`,
                at: Date.now(),
              }]
            : s.milestones;
          if (s.soundOn) sfx.buy();
          return {
            credits: s.credits - cost,
            hardware: { ...s.hardware, [id]: count + 1 },
            milestones,
          };
        }),

      buyUpgrade: (id) =>
        set((s) => {
          if (s.upgrades[id]) return {};
          const def = CLICK_UPGRADES.find((u) => u.id === id)!;
          if (s.credits < def.cost) return {};
          if (s.soundOn) sfx.buy();
          return { credits: s.credits - def.cost, upgrades: { ...s.upgrades, [id]: true } };
        }),

      buyMarketing: (id) =>
        set((s) => {
          if (s.marketing[id]) return {};
          const def = MARKETING.find((m) => m.id === id)!;
          if (s.credits < def.cost) return {};
          if (s.soundOn) sfx.buy();
          return {
            credits: s.credits - def.cost,
            marketing: { ...s.marketing, [id]: true },
            users: s.users + def.users,
            milestones: [...s.milestones.slice(-7), {
              id: `${id}-${Date.now()}`,
              text: `${def.emoji} ${def.name} — +${def.users.toLocaleString('en-US')} users!`,
              at: Date.now(),
            }],
          };
        }),

      buyModel: (id) =>
        set((s) => {
          if (s.models[id]) return {};
          const m = MODELS.find((x) => x.id === id)!;
          const bestTier = HARDWARE.filter((h) => (s.hardware[h.id] ?? 0) > 0)
            .reduce((a, h) => Math.max(a, HARDWARE.indexOf(h)), 0);
          if (s.credits < m.cost || bestTier < m.minTier) return {};
          if (s.soundOn) sfx.buy();
          return {
            credits: s.credits - m.cost,
            models: { ...s.models, [id]: true },
            milestones: [...s.milestones.slice(-7), {
              id: `model-${Date.now()}`,
              text: `${m.emoji} ${m.name} (${m.params}) added to your model library`,
              at: Date.now(),
            }],
          };
        }),

      buyPower: (id) =>
        set((s) => {
          const count = s.power[id] ?? 0;
          const def = POWER.find((p) => p.id === id)!;
          if (def.cost === 0 && count > 0) return {}; // the free outlet is one-time
          const d = getDerived(s);
          const cost = Math.round(def.cost * Math.pow(POWER_COST_GROWTH, count) * d.newsCostMult);
          if (s.credits < cost) return {};
          if (s.soundOn) sfx.buy();
          const milestones = count === 0
            ? [...s.milestones.slice(-7), {
                id: `power-${Date.now()}`,
                text: `${def.emoji} ${def.name} online — +${def.kW} kW to the grid`,
                at: Date.now(),
              }]
            : s.milestones;
          return {
            credits: s.credits - cost,
            power: { ...s.power, [id]: count + 1 },
            milestones,
          };
        }),

      tick: (dt) =>
        set((s) => {
          if (dt <= 0 || dt > 2) return {};
          const d = getDerived(s);
          let users = s.users;
          let news = s.news;
          let models = s.models;
          let modelsGrantedV2 = s.modelsGrantedV2;
          // Lazy one-time migration: legacy saves get their hardware tiers'
          // default models granted (runs in every session with new code).
          if (!modelsGrantedV2) {
            const granted: Record<string, boolean> = { ...models };
            for (const h of HARDWARE) {
              if ((s.hardware[h.id] ?? 0) > 0 && h.modelId) granted[h.modelId] = true;
            }
            models = granted;
            modelsGrantedV2 = true;
          }
          if (news && Date.now() >= news.endsAt) {
            news = null;
          } else if (!news && Math.random() < dt / 180) {
            const n = NEWS_EVENTS[Math.floor(Math.random() * NEWS_EVENTS.length)];
            news = { ...n, id: `${n.id}-${Date.now()}`, endsAt: Date.now() + n.duration * 1000 };
            users += n.instantUsers;
          }
          const spawnedNews = news !== s.news;
          if (d.load <= 1) {
            users += d.growthPerSec * dt;
          } else {
            users -= s.users * Math.min(CHURN_CAP, CHURN_COEF * (d.load - 1)) * dt;
          }
          if (users < 0) users = 0;
          const gained = Math.max(0, d.net) * dt;
          const milestones = spawnedNews && news
            ? [...s.milestones.slice(-7), {
                id: news.id,
                text: `${news.emoji} ${news.title}`,
                at: Date.now(),
              }]
            : s.milestones;
          return {
            credits: Math.max(0, s.credits + gained),
            users,
            news,
            models,
            modelsGrantedV2,
            milestones,
            totalTokens: s.totalTokens + d.servedTps * dt,
            totalEarned: s.totalEarned + gained,
            lifetimeEarned: s.lifetimeEarned + gained,
            lastSavedAt: Date.now(),
          };
        }),

      applyOffline: () =>
        set((s) => {
          const now = Date.now();
          const elapsed = Math.min(Math.floor((now - s.lastSavedAt) / 1000), OFFLINE_CAP_S);
          if (elapsed < 60) return { lastSavedAt: now };
          const base = getDerived(s);
          const R = BASE_GROWTH + marketingGrowthSum(s.marketing) + 0.0015 * s.perks.growth;
          const mult = 1 + 0.25 * s.ipos + 0.1 * s.perks.venture;
          let users = s.users;
          let credits = s.credits;
          let tokens = s.totalTokens;
          for (let i = 0; i < elapsed; i++) {
            const demand = users * base.activeModel.demandPerUser;
            const load = base.capacity > 0 ? demand / base.capacity : 0;
            const served = Math.min(base.capacity, demand);
            credits = Math.max(0, credits + (served * base.activeModel.revMult * BASE_RATE * mult - base.electricity));
            tokens += served;
            if (load <= 1) {
              users += users * R * Math.max(0, 1 - load) + (load < 1.2 ? SIGNUP_TRICKLE : 0);
            } else {
              users -= users * Math.min(CHURN_CAP, CHURN_COEF * (load - 1));
            }
            if (users < 0) users = 0;
          }
          return {
            credits,
            users,
            totalTokens: tokens,
            totalEarned: s.totalEarned + (credits - s.credits),
            lifetimeEarned: s.lifetimeEarned + (credits - s.credits),
            lastSavedAt: now,
            offlineGain: Math.round(credits - s.credits),
          };
        }),

      clearOfflineGain: () => set({ offlineGain: 0 }),

      ipo: () =>
        set((s) => {
          const req = ipoRequirement(s.ipos);
          if (s.lifetimeEarned < req || s.pendingPerk) return {};
          if (s.soundOn) sfx.prestige();
          return {
            credits: 0,
            hardware: { rpi5: 2 },
            upgrades: {},
            marketing: {},
            models: { tinyllama: true },
            power: { outlet: 1 },
            news: null,
            users: 8,
            totalClicks: 0,
            totalTokens: 0,
            totalEarned: 0,
            ipos: s.ipos + 1,
            pendingPerk: true,
            milestones: [...s.milestones.slice(-6), {
              id: `ipo-${Date.now()}`,
              text: `🏦 IPO #${s.ipos + 1}! +25% earnings — pick your investor perk`,
              at: Date.now(),
            }],
            lastSavedAt: Date.now(),
            offlineGain: 0,
          };
        }),

      choosePerk: (id) =>
        set((s) => {
          if (!s.pendingPerk) return {};
          if (s.soundOn) sfx.buy();
          const def = PERK_DEFS.find((p) => p.id === id)!;
          return {
            pendingPerk: false,
            perks: { ...s.perks, [id]: s.perks[id] + 1 },
            milestones: [...s.milestones.slice(-6), {
              id: `perk-${Date.now()}`,
              text: `${def.emoji} ${def.name} joined the cap table — ${def.desc}`,
              at: Date.now(),
            }],
          };
        }),

      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),

      reset: () => set({ ...freshState(), lastSavedAt: Date.now() }),
    }),
    {
      name: 'selfhost-ai-clicker-save-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        credits: s.credits,
        hardware: s.hardware,
        upgrades: s.upgrades,
        marketing: s.marketing,
        models: s.models,
        modelsGrantedV2: s.modelsGrantedV2,
        power: s.power,
        news: s.news,
        users: s.users,
        totalClicks: s.totalClicks,
        totalTokens: s.totalTokens,
        totalEarned: s.totalEarned,
        lifetimeEarned: s.lifetimeEarned,
        ipos: s.ipos,
        perks: s.perks,
        pendingPerk: s.pendingPerk,
        soundOn: s.soundOn,
        milestones: s.milestones,
        createdAt: s.createdAt,
        lastSavedAt: s.lastSavedAt,
      }),
    }
  )
);
