// Buyable AI models. Owning a model stores it on your disk; the best owned
// model that your fleet can host becomes the "active model" that users hit.
//
//  - minTier: hardware tier index required to run it (see HARDWARE)
//  - diskGB: library storage per model (persists while owned)
//  - ramGB / vramGB: serving memory PER REPLICA on eligible units
//  - speed: multiplier applied to the fleet's base tokens/s capacity
//  - revMult / demandPerUser: revenue and load, as before

export interface ModelDef {
  id: string;
  name: string;
  params: string;
  emoji: string;
  cost: number;          // license cost in credits
  minTier: number;       // hardware tier index needed to host it
  diskGB: number;
  ramGB: number;
  vramGB: number;
  revMult: number;
  demandPerUser: number;
  speed: number;
}

export const MODELS: ModelDef[] = [
  { id: 'tinyllama', name: 'TinyLlama 1.5B', params: '1.5B', emoji: '🐜', cost: 0, minTier: 0, diskGB: 1.1, ramGB: 3, vramGB: 0, revMult: 1.0, demandPerUser: 2, speed: 1.0 },
  { id: 'llama32-3b', name: 'Llama 3.2 3B', params: '3B', emoji: '🐿️', cost: 200, minTier: 1, diskGB: 2.4, ramGB: 4, vramGB: 0, revMult: 1.8, demandPerUser: 3, speed: 1.0 },
  { id: 'llama31-8b', name: 'Llama 3.1 8B', params: '8B', emoji: '🐕', cost: 1500, minTier: 2, diskGB: 4.9, ramGB: 7, vramGB: 0, revMult: 3.2, demandPerUser: 5, speed: 1.0 },
  { id: 'qwen25-32b', name: 'Qwen2.5 32B', params: '32B', emoji: '🐆', cost: 12000, minTier: 3, diskGB: 19, ramGB: 24, vramGB: 22, revMult: 5.5, demandPerUser: 8, speed: 1.0 },
  { id: 'llama33-70b', name: 'Llama 3.3 70B', params: '70B', emoji: '🦁', cost: 90000, minTier: 4, diskGB: 40, ramGB: 12, vramGB: 46, revMult: 9, demandPerUser: 12, speed: 1.0 },
  { id: 'dsr1-236b', name: 'DeepSeek-R1 236B', params: '236B MoE', emoji: '🐋', cost: 700000, minTier: 5, diskGB: 120, ramGB: 126, vramGB: 126, revMult: 14, demandPerUser: 20, speed: 0.9 },
  { id: 'maverick', name: 'Llama 4 Maverick', params: '400B MoE', emoji: '🦅', cost: 5000000, minTier: 6, diskGB: 229, ramGB: 64, vramGB: 263, revMult: 22, demandPerUser: 30, speed: 0.85 },
  { id: 'behemoth', name: 'Llama 4 Behemoth', params: '2T MoE', emoji: '🦖', cost: 40000000, minTier: 7, diskGB: 1150, ramGB: 128, vramGB: 1323, revMult: 35, demandPerUser: 50, speed: 0.8 },
  { id: 'behemoth-cluster', name: 'Behemoth Cluster', params: 'multi-rack', emoji: '🐉', cost: 300000000, minTier: 8, diskGB: 36800, ramGB: 4096, vramGB: 42336, revMult: 35, demandPerUser: 60, speed: 1.0 },
  { id: 'frontier-megamoe', name: 'Frontier MegaMoE', params: 'hyperscale', emoji: '🌌', cost: 2500000000, minTier: 9, diskGB: 294400, ramGB: 32768, vramGB: 338688, revMult: 40, demandPerUser: 80, speed: 1.0 },
];
