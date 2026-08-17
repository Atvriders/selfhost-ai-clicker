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
  ramGB: number;        // system RAM (GB)
  vramGB: number;       // GPU VRAM (GB), 0 = CPU-only inference
  diskGB: number;       // model files on disk (GB, 4-bit quantized)
  ramUseGB: number;     // RAM actually used: model weights + serving overhead
  vramUseGB: number;    // VRAM actually used by the model
  diskTotalGB: number;  // total storage on this machine
  model: string;        // best model this tier can serve
  modelId: string;      // id of that model in MODELS
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
    ramGB: 16,
    vramGB: 0,
    diskGB: 1.1,
    ramUseGB: 3,
    vramUseGB: 0,
    diskTotalGB: 128,
    model: 'TinyLlama 1.5B',
    modelId: 'tinyllama',
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
    ramGB: 8,
    vramGB: 0,
    diskGB: 2.4,
    ramUseGB: 4,
    vramUseGB: 0,
    diskTotalGB: 64,
    model: 'Llama 3.2 3B',
    modelId: 'llama32-3b',
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
    ramGB: 16,
    vramGB: 0,
    diskGB: 4.9,
    ramUseGB: 7,
    vramUseGB: 0,
    diskTotalGB: 512,
    model: 'Llama 3.1 8B',
    modelId: 'llama31-8b',
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
    ramGB: 128,
    vramGB: 96,
    diskGB: 19,
    ramUseGB: 24,
    vramUseGB: 22,
    diskTotalGB: 512,
    model: 'Qwen2.5 32B',
    modelId: 'qwen25-32b',
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
    ramGB: 128,
    vramGB: 128,
    diskGB: 40,
    ramUseGB: 12,
    vramUseGB: 46,
    diskTotalGB: 1024,
    model: 'Llama 3.3 70B',
    modelId: 'llama33-70b',
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
    ramGB: 128,
    vramGB: 128,
    diskGB: 120,
    ramUseGB: 126,
    vramUseGB: 126,
    diskTotalGB: 1024,
    model: 'DeepSeek-R1 236B MoE (4-bit)',
    modelId: 'dsr1-236b',
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
    ramGB: 2048,
    vramGB: 1128,
    diskGB: 229,
    ramUseGB: 64,
    vramUseGB: 263,
    diskTotalGB: 10000,
    model: 'Llama 4 Maverick (400B)',
    modelId: 'maverick',
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
    ramGB: 9216,
    vramGB: 13824,
    diskGB: 1150,
    ramUseGB: 128,
    vramUseGB: 1323,
    diskTotalGB: 40000,
    model: 'Llama 4 Behemoth (2T)',
    modelId: 'behemoth',
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
    ramGB: 295000,
    vramGB: 442368,
    diskGB: 36800,
    ramUseGB: 4096,
    vramUseGB: 42336,
    diskTotalGB: 500000,
    model: 'Behemoth Cluster',
    modelId: 'behemoth-cluster',
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
    ramGB: 2360000,
    vramGB: 3538944,
    diskGB: 294400,
    ramUseGB: 32768,
    vramUseGB: 338688,
    diskTotalGB: 1000000,
    model: 'Frontier MegaMoE',
    modelId: 'frontier-megamoe',
    revMult: 40,
    demandPerUser: 12,
    emoji: '🌐',
  },
];

// Cost of copy N of the same hardware = baseCost * HARDWARE_COST_GROWTH^(N-1)
export const HARDWARE_COST_GROWTH = 1.13;
