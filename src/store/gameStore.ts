import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { HARDWARE, HARDWARE_COST_GROWTH, HardwareDef } from '../data/hardware';
import { CLICK_UPGRADES, BASE_CLICK_POWER } from '../data/clickUpgrades';
import { MARKETING } from '../data/marketing';

// ---------- Economy constants (tuning guide in BALANCE.md) ----------
export const BASE_RATE = 0.05;          // credits per token/s served, scaled by model revMult
export const ELECTRICITY_COST = 0.0002; // credits per watt per second (flavor cost)
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

export interface Derived {
  best: HardwareDef;
  capacity: number;      // tokens/s total
  demand: number;        // tokens/s requested by users
  load: number;          // demand / capacity (may exceed 1)
  servedTps: number;     // tokens/s actually served
  revenue: number;       // credits/s gross
  watts: number;
  electricity: number;   // credits/s
  net: number;           // credits/s after electricity
  clickPower: number;
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
  users: number;
  totalClicks: number;
  totalTokens: number;
  totalEarned: number;
  milestones: Milestone[];
  createdAt: number;
  lastSavedAt: number;
  offlineGain: number;
  click: () => void;
  buyHardware: (id: string) => void;
  buyUpgrade: (id: string) => void;
  buyMarketing: (id: string) => void;
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
  const capacity = HARDWARE.reduce((a, h) => a + (s.hardware[h.id] ?? 0) * h.tokensPerSec, 0);
  const watts = HARDWARE.reduce((a, h) => a + (s.hardware[h.id] ?? 0) * h.watts, 0);
  const demand = s.users * best.demandPerUser;
  const load = capacity > 0 ? demand / capacity : (s.users > 0 ? Infinity : 0);
  const servedTps = Math.min(capacity, demand);
  const revenue = servedTps * best.revMult * BASE_RATE;
  const electricity = watts * ELECTRICITY_COST;
  const clickPower =
    BASE_CLICK_POWER +
    CLICK_UPGRADES.reduce((a, u) => a + (s.upgrades[u.id] ? u.power : 0), 0);
  const R = BASE_GROWTH + marketingGrowthSum(s.marketing);
  const growthPerSec = load <= 1
    ? s.users * R * Math.max(0, 1 - load) + (load < 1.2 ? SIGNUP_TRICKLE : 0)
    : -s.users * Math.min(CHURN_CAP, CHURN_COEF * (load - 1));
  return {
    best,
    capacity,
    demand,
    load,
    servedTps,
    revenue,
    watts,
    electricity,
    net: revenue - electricity,
    clickPower,
    growthPerSec,
    growthPct: s.users > 0 ? (growthPerSec / s.users) * 100 : 0,
    queueTps: Math.max(0, demand - capacity),
    bestModel: best.model,
    bestRevMult: best.revMult,
  };
}

export function hardwareCost(id: string, ownedCount: number): number {
  const def = HARDWARE.find((h) => h.id === id)!;
  return Math.round(def.cost * Math.pow(HARDWARE_COST_GROWTH, ownedCount));
}

const freshState = () => ({
  credits: 0,
  hardware: { rpi5: 1 } as Record<string, number>,
  upgrades: {} as Record<string, boolean>,
  marketing: {} as Record<string, boolean>,
  users: 10,
  totalClicks: 0,
  totalTokens: 0,
  totalEarned: 0,
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
          return {
            credits: s.credits + p,
            totalClicks: s.totalClicks + 1,
            totalEarned: s.totalEarned + p,
          };
        }),

      buyHardware: (id) =>
        set((s) => {
          const count = s.hardware[id] ?? 0;
          const cost = hardwareCost(id, count);
          if (s.credits < cost) return {};
          const def = HARDWARE.find((h) => h.id === id)!;
          const milestones = count === 0
            ? [...s.milestones.slice(-7), {
                id: `${id}-${Date.now()}`,
                text: `${def.emoji} ${def.name} online — now hosting ${def.model}`,
                at: Date.now(),
              }]
            : s.milestones;
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
          return { credits: s.credits - def.cost, upgrades: { ...s.upgrades, [id]: true } };
        }),

      buyMarketing: (id) =>
        set((s) => {
          if (s.marketing[id]) return {};
          const def = MARKETING.find((m) => m.id === id)!;
          if (s.credits < def.cost) return {};
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

      tick: (dt) =>
        set((s) => {
          if (dt <= 0 || dt > 2) return {};
          const d = getDerived(s);
          let users = s.users;
          if (d.load <= 1) {
            users += d.growthPerSec * dt;
          } else {
            users -= s.users * Math.min(CHURN_CAP, CHURN_COEF * (d.load - 1)) * dt;
          }
          if (users < 0) users = 0;
          const gained = Math.max(0, d.net) * dt;
          return {
            credits: Math.max(0, s.credits + gained),
            users,
            totalTokens: s.totalTokens + d.servedTps * dt,
            totalEarned: s.totalEarned + gained,
            lastSavedAt: Date.now(),
          };
        }),

      applyOffline: () =>
        set((s) => {
          const now = Date.now();
          const elapsed = Math.min(Math.floor((now - s.lastSavedAt) / 1000), OFFLINE_CAP_S);
          if (elapsed < 60) return { lastSavedAt: now };
          const base = getDerived(s);
          const R = BASE_GROWTH + marketingGrowthSum(s.marketing);
          let users = s.users;
          let credits = s.credits;
          let tokens = s.totalTokens;
          for (let i = 0; i < elapsed; i++) {
            const demand = users * base.best.demandPerUser;
            const load = base.capacity > 0 ? demand / base.capacity : 0;
            const served = Math.min(base.capacity, demand);
            credits = Math.max(0, credits + (served * base.best.revMult * BASE_RATE - base.electricity));
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
            lastSavedAt: now,
            offlineGain: Math.round(credits - s.credits),
          };
        }),

      clearOfflineGain: () => set({ offlineGain: 0 }),

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
        users: s.users,
        totalClicks: s.totalClicks,
        totalTokens: s.totalTokens,
        totalEarned: s.totalEarned,
        milestones: s.milestones,
        createdAt: s.createdAt,
        lastSavedAt: s.lastSavedAt,
      }),
    }
  )
);
