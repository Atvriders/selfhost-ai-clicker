// Hardware tiers for SelfHost.AI Clicker
//
// Balance design (see BALANCE.md):
//  - Cost grows ~x8 between tiers, payback time ~30-100 s at full load
//  - tokensPerSec is the inference capacity of ONE unit
//  - revMult = revenue multiplier for the best model the tier can host
//  - demandPerUser = tokens/s each concurrent user requests (bigger model = more demand)
//  - watts drive the flavor electricity cost (kept small on purpose)
//  - Each extra copy of the same hardware costs HARDWARE_COST_GROWTH more

export interface HardwareDef {
  id: string;
  name: string;
  flavor: string;
  cost: number;         // base cost in compute credits
  tokensPerSec: number; // inference capacity (tokens/s)
  watts: number;        // power draw
  model: string;        // best model this tier can serve
  revMult: number;      // revenue multiplier of that model
  demandPerUser: number;// tokens/s demanded per concurrent user
  emoji: string;
}

export const HARDWARE: HardwareDef[] = [
  {
    id: 'rpi5',
    name: 'Raspberry Pi 5',
    flavor: '16 GB SBC humming on your desk',
    cost: 50,
    tokensPerSec: 10,
    watts: 12,
    model: 'TinyLlama 1.5B',
    revMult: 1.0,
    demandPerUser: 0.5,
    emoji: '🟥',
  },
  {
    id: 'orin',
    name: 'Jetson Orin Nano',
    flavor: 'Edge AI kit, sips power',
    cost: 400,
    tokensPerSec: 50,
    watts: 25,
    model: 'Llama 3.2 3B',
    revMult: 1.8,
    demandPerUser: 0.8,
    emoji: '🟩',
  },
  {
    id: 'n100',
    name: 'Mini PC (Intel N100)',
    flavor: 'Homelab workhorse in a tiny box',
    cost: 3000,
    tokensPerSec: 300,
    watts: 35,
    model: 'Llama 3.1 8B',
    revMult: 3.2,
    demandPerUser: 1.2,
    emoji: '🟦',
  },
  {
    id: 'halo',
    name: 'AMD AI Halo Mini PC',
    flavor: 'Ryzen AI Max+ 395 · 128 GB unified memory',
    cost: 25000,
    tokensPerSec: 2000,
    watts: 120,
    model: 'Qwen2.5 32B',
    revMult: 5.5,
    demandPerUser: 2,
    emoji: '🔶',
  },
  {
    id: 'rtx4',
    name: 'Quad-RTX 5090 Workstation',
    flavor: '4× 32 GB VRAM, liquid-cooled tower',
    cost: 200000,
    tokensPerSec: 12000,
    watts: 2000,
    model: 'Llama 3.3 70B',
    revMult: 9,
    demandPerUser: 3,
    emoji: '🎮',
  },
  {
    id: 'spark',
    name: 'NVIDIA DGX Spark',
    flavor: 'GB10 Grace Blackwell desktop superchip',
    cost: 1500000,
    tokensPerSec: 70000,
    watts: 170,
    model: 'DeepSeek V3 (671B MoE)',
    revMult: 14,
    demandPerUser: 5,
    emoji: '⚡',
  },
  {
    id: 'h200',
    name: '1U Inference Server',
    flavor: '8× H200 141 GB — first rack-mount box',
    cost: 12000000,
    tokensPerSec: 400000,
    watts: 8000,
    model: 'Llama 4 Maverick (400B)',
    revMult: 22,
    demandPerUser: 8,
    emoji: '🖥️',
  },
  {
    id: 'nvl72',
    name: 'GB200 NVL72 Rack',
    flavor: '72 Blackwell GPUs, liquid-cooled colo rack',
    cost: 100000000,
    tokensPerSec: 2500000,
    watts: 120000,
    model: 'Llama 4 Behemoth (2T)',
    revMult: 35,
    demandPerUser: 12,
    emoji: '🏗️',
  },
  {
    id: 'hall',
    name: 'Data Center Hall',
    flavor: '32 racks of pure inference',
    cost: 1000000000,
    tokensPerSec: 20000000,
    watts: 1000000,
    model: 'Behemoth Cluster',
    revMult: 35,
    demandPerUser: 12,
    emoji: '🏭',
  },
  {
    id: 'campus',
    name: 'Hyperscale Campus',
    flavor: 'A city block of self-hosted frontier AI',
    cost: 12000000000,
    tokensPerSec: 160000000,
    watts: 8000000,
    model: 'Frontier MegaMoE',
    revMult: 40,
    demandPerUser: 12,
    emoji: '🌐',
  },
];

// Cost of copy N of the same hardware = baseCost * HARDWARE_COST_GROWTH^(N-1)
export const HARDWARE_COST_GROWTH = 1.13;
