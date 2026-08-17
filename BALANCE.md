# SelfHost.AI Clicker — Balance Notes

Everything in one place: the core loop, every price, every resource number,
and why they are what they are. Tweak a value in code and update its table
here — the two must never drift apart.

## Core loop

Users send inference requests. You earn **Compute Credits (CC)** per token
served and reinvest into hardware, models, power, marketing and clicking gear.

```
demand   = users × demandPerUser(active model)                 [tok/s]
capacity = Σ units × tokensPerSec × model.speed × powerFactor  [tok/s]
served   = min(capacity, demand)                               [tok/s]
revenue  = served × revMult × 0.05 × prestigeMult × news.revMult  [CC/s]
load     = demand / capacity
```

## Economy constants (`src/store/gameStore.ts`)

| Constant | Value | Meaning |
|---|---|---|
| `BASE_RATE` | 0.05 | CC per token/s served, before model multiplier |
| `HARDWARE_COST_GROWTH` | 1.13 | cost of each extra copy of the same hardware |
| `POWER_COST_GROWTH` | 1.15 | cost of each extra copy of the same generator |
| `BASE_GROWTH` | 0.005 | user growth coefficient (0.5%/s at zero load) |
| `SIGNUP_TRICKLE` | 0.05 | absolute signups/s so the game never dead-ends |
| `CHURN_COEF` / `CHURN_CAP` | 0.015 / 0.03 | overload churn: ≤3%/s of users |
| `ELECTRICITY_COST` | 0.001 | CC per watt/s (fuel + grid bill) |
| `OFFLINE_CAP_S` | 3600 | offline earnings cap (1 hour) |
| `NEWS_INTERVAL` | ~180 s | average time between news events (dt/180) |

Starting state: **2× Raspberry Pi 5, 8 users, TinyLlama, 1.5 kW wall outlet**.
Demand (8 × 2 = 16 tok/s) vs capacity (20 tok/s) = 80% load: the "expand or
churn" loop teaches itself in the first minute.

## User growth (logistic — cannot overshoot forever)

```
growth/s = users × R × (1 − load) + trickle     when load ≤ 1
churn/s  = users × min(0.03, 0.015 × (load−1))  when load > 1
R        = (0.005 + Σ marketing + 0.0015 × growth perks) × news.growthMult
```

Marketing spikes users above capacity → they churn back down → buy hardware
to catch them. That is the core loop.

## Hardware

Cost grows ~×8 per tier (7.5–12×). Full-load payback is 29–100 s; it
intentionally compresses at the top so late game stays snappy. Payback
assumes enough users to fill the unit — users-to-saturate shrank ~4× when
per-user demand was raised.

| Tier | Cost | Tok/s | W | RAM | VRAM | RAM use | VRAM use | Disk | Rev/s @full | Payback | Users to fill |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 🟥 Raspberry Pi 5 | 50 | 10 | 12 | 16 GB | — | 3 GB | — | 128 GB | 0.5 | 100 s | 5 |
| 🟩 Jetson Orin Nano | 400 | 50 | 25 | 8 GB | — | 4 GB | — | 64 GB | 4.5 | 89 s | 17 |
| 🟦 Mini PC N100 | 3,000 | 300 | 35 | 16 GB | — | 7 GB | — | 512 GB | 48 | 62 s | 60 |
| 🔶 AMD AI Halo | 25,000 | 2,000 | 120 | 128 GB | 96 GB | 24 GB | 22 GB | 512 GB | 550 | 45 s | 250 |
| 🎮 Quad-5090 WS | 200,000 | 12,000 | 2,000 | 128 GB | 128 GB | 12 GB | 46 GB | 1 TB | 5,400 | 37 s | 1,000 |
| ⚡ DGX Spark | 1.5M | 70,000 | 170 | 128 GB | 128 GB | 126 GB | 126 GB | 1 TB | 44,100 | 34 s | 3,150 |
| 🖥️ 1U 8×H200 | 12M | 400,000 | 8,000 | 2 TB | 1,128 GB | 64 GB | 263 GB | 10 TB | 374,000 | 32 s | 11,333 |
| 🏗️ NVL72 Rack | 100M | 2.5M | 120,000 | 9 TB | 13,824 GB | 128 GB | 1,323 GB | 40 TB | 3.5M | 29 s | 40,000 |
| 🏭 Data Hall | 1B | 20M | 1M | 295 TB | 442 TB | 4 TB | 42 TB | 500 TB | 35M | 29 s | 333K |
| 🌐 Campus | 12B | 160M | 8M | 2.36 PB | 3.54 PB | 32 TB | 338 TB | 1 PB | 320M | 37 s | 2M |

RAM/VRAM "use" = the tier's default model footprint (4-bit weights + KV
cache + overhead). Disk totals are **node-local storage** (big fleets mount
shared storage separately — inference nodes don't carry exabytes each).

## Models (one-time licenses)

License payback assumes the model is served on its tier's hardware at full
load (Δ revenue / license cost).

| Model | Params | License | Min tier | Disk | RAM/srv | VRAM/srv | Speed | Rev × | Tok/s per user | License payback |
|---|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 🐜 TinyLlama | 1.5B | free | 0 | 1.1 GB | 3 GB | — | 1.0 | 1.0 | 2 | — |
| 🐿️ Llama 3.2 | 3B | 200 | 1 | 2.4 GB | 4 GB | — | 1.0 | 1.8 | 3 | 74 s |
| 🐕 Llama 3.1 | 8B | 1,500 | 2 | 4.9 GB | 7 GB | — | 1.0 | 3.2 | 5 | 71 s |
| 🐆 Qwen2.5 | 32B | 12,000 | 3 | 19 GB | 24 GB | 22 GB | 1.0 | 5.5 | 8 | 52 s |
| 🦁 Llama 3.3 | 70B | 90,000 | 4 | 40 GB | 12 GB | 46 GB | 1.0 | 9 | 12 | 43 s |
| 🐋 DeepSeek-R1 | 236B | 700,000 | 5 | 120 GB | 126 GB | 126 GB | 0.9 | 14 | 20 | 31 s |
| 🦅 Maverick | 400B | 5M | 6 | 229 GB | 64 GB | 263 GB | 0.85 | 22 | 30 | 27 s |
| 🦖 Behemoth | 2T | 40M | 7 | 1,150 GB | 128 GB | 1,323 GB | 0.8 | 35 | 50 | 25 s |
| 🐉 Cluster | multi-rack | 300M | 8 | 36.8 TB | 4 TB | 42 TB | 1.0 | 35 | 60 | —* |
| 🌌 Frontier | hyperscale | 2.5B | 9 | 294 TB | 32 TB | 338 TB | 1.0 | 40 | 80 | —* |

\* Cluster/Frontier are capacity-tier models: their license mostly gates the
endgame and pays itself back over the tier's life, not in seconds.

Owning a model stores it on disk **forever** (the Disk bar is your library).
The best owned model your fleet can host auto-activates. A bigger model
raises revenue per token AND per-user load — every upgrade is a real
capacity decision.

## Power grid

Supply must cover demand or the fleet **throttles**: capacity ×=
supply/demand (floor 10%), and latency +500 ms per missing fraction.
~×7.5 cost per tier, ~750 CC/kW early falling to ~120 CC/kW at the top
(scale economies).

| Source | kW | Cost | CC/kW | Covers |
|---|---:|---:|---:|---|
| 🔌 Garage outlet | 1.5 | free | — | 2× Pi 5 clusters |
| ☀️ Rooftop solar | 5 | 2,000 | 400 | 40× Pi 5 / 40× Halo |
| ⛽ Gas generator | 20 | 15,000 | 750 | first GPU rigs |
| 🌬️ Wind turbine | 50 | 40,000 | 800 | 6× H200 servers |
| 🛢️ Diesel bank | 150 | 120,000 | 800 | 1× NVL72 rack |
| 🌞 Solar farm | 500 | 400,000 | 800 | 4× NVL72 racks |
| 🔋 Substation | 2,000 | 1.5M | 750 | half a data hall |
| 🏭 Gas turbine | 10,000 | 6M | 600 | 10 data halls |
| ☢️ SMR | 50,000 | 30M | 600 | 50 halls / 6 campuses |
| 🏞️ Hydro dam | 200,000 | 80M | 400 | 25 campuses |
| ⚛️ Fusion | 500,000 | 200M | 400 | 60 campuses |
| 🛰️ Orbital solar | 5M | 1.5B | 300 | 600 campuses |
| 🌌 Dyson swarm | 100M | 12B | 120 | the rest of the game |

Intentional friction: the 2 kW Quad-5090 rig cannot run on the free 1.5 kW
outlet — your first workstation forces the first real power purchase
(15K CC, ~7.5% on top of the rig).

## Marketing

Instant users are sized to **2–5× the user base at the stage you can afford
them** (spiking to 20× capacity was wasted: revenue caps at capacity
anyway). Growth boosts are the permanent value.

| Campaign | Cost | +Users | +Growth/s | Buy at ~ |
|---|---:|---:|---:|---|
| 🧵 Reddit | 150 | 25 | +0.001 | 2–3 min |
| 💬 Discord | 1,200 | 120 | +0.0015 | ~8 min |
| 🎬 YouTube review | 9,000 | 500 | +0.002 | ~20 min |
| 📰 Hacker News | 70,000 | 2,000 | +0.003 | ~1 h |
| 🎤 Conference keynote | 600,000 | 6,000 | +0.004 | ~3 h |
| 📺 TV segment | 5M | 20,000 | +0.006 | ~8 h |
| 🏈 Super Bowl ad | 45M | 80,000 | +0.008 | ~1 day |

Max R = 0.005 + 0.0255 + growth perks ≈ 3.6%/s → user doubling ~19 s late
game, which keeps campuses fillable (2M users) without hours of waiting.

## Clicking

Base click 1 CC; 12 one-time upgrades total ~81,000 CC/click with a ×4–5
cost curve (50 CC → 8B CC). Clicking carries the first ~5 minutes, then
passive serving takes over — the classic clicker arc. Click power scales
with prestige and the 🐦 viral-tweet event.

## News events

One active at a time, ~every 3 minutes, 15–120 s each. All multipliers are
multiplicative with the permanent systems.

| Event | Duration | Effect |
|---|---:|---|
| 🎉 Model release frenzy | 90 s | ×2 user growth |
| ☁️ MegaCorp cloud outage | 120 s | ×1.5 revenue |
| 🐦 Viral tweet | 45 s | ×3 click power |
| 📰 Tech press feature | 60 s | +100 users, ×1.5 growth |
| ⚡ Power surge | 15 s | 0 revenue |
| 🔌 Grid blackout | 60 s | power supply ×0.4 → throttle! |
| 🧯 Security drill PR blowup | 60 s | negative growth |
| 🏷️ Supplier flash sale | 120 s | hardware −30% |
| 📡 Backhoe vs fiber | 90 s | ×0.5 revenue |

## Prestige (IPO)

- Available at **1B lifetime** earnings; each next IPO ×10 (1B, 10B, 100B…).
- Resets credits/hardware/models/power/marketing/users to the starting
  state, keeps a permanent **+25%** to all earnings, plus one perk pick:

| Perk | Effect | Roughly equal to |
|---|---|---|
| 💰 Venture Money | +10% earnings each | +10% income |
| 📈 Growth Hacker | +0.15%/s growth each | +30% base growth |
| 🛠️ Hardware Partner | −1.5% per-copy cost growth (floor 1.05) | −30% cost of a 20-copy fleet |

The three perks are within ~2× of each other at every stage; Venture scales
best late, Growth early, Partner when buying many copies of one tier.

## Milestone pacing targets

- ~20 s: third Raspberry Pi
- ~2 min: Orin Nano online
- ~6–8 min: Mini PC + first marketing
- ~15–25 min: AMD AI Halo serving 32B
- ~1 h: DGX Spark, DeepSeek-R1 236B
- ~1 day: first NVL72 racks and data halls

(Exact times depend on click rate, marketing timing, and news events.)

## Flavor stats (display-only)

- **Network**: `netMBps = servedTps / 50`.
- **Latency**: `20 + 18×load + queue/40 + 500×(1−powerFactor)` ms.
- **Power draw breathes with load**: idle servers draw 30% of nameplate,
  so `demand = watts × (0.3 + 0.7×load)` — the power bar moves with traffic.
- **Electricity** = `watts × 0.001` (fuel for what you draw) **+ `supply × 0.01`**
  (upkeep on generator capacity). The capacity term makes overbuying power
  — like a 5 GW orbital array for a 70 MW fleet — cost real money, which
  rewards right-sizing your grid.
- **Usage bars** measure the AI serving pool, not the whole machine:
  `pool = Σ min(2× tier default footprint, physical memory)` per unit, so
  RAM/VRAM bars sit at a meaningful 50–100% with the default model loaded,
  move when you switch models, and can overflow if you cram a big model
  onto a small fleet. Disk = model library + one replica copy of the active
  model per eligible unit, against node-local storage totals.

