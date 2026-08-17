# SelfHost.AI Clicker — Balance Notes

## Core loop

You self-host AI models. Users send inference requests; you earn **Compute
Credits (CC)** for every token you serve, then reinvest CC into hardware,
clicking gear, and marketing. Buy too little hardware and your servers
overload — users queue up and eventually leave.

```
demand  = users × demandPerUser(best model)      [tokens/s]
served  = min(capacity, demand)                  [tokens/s]
revenue = served × revMult(best model) × 0.05    [CC/s]
load    = demand / capacity                      [the number on the bar]
```

## Economy constants (`src/store/gameStore.ts`)

| Constant | Value | Meaning |
|---|---|---|
| `BASE_RATE` | 0.05 | CC per token/s served, before model multiplier |
| `HARDWARE_COST_GROWTH` | 1.13 | cost of each extra copy of the same hardware |
| `BASE_GROWTH` | 0.005 | user growth coefficient (0.5%/s at zero load) |
| `SIGNUP_TRICKLE` | 0.05 | absolute signups/s so the game never dead-ends |
| `CHURN_COEF` / `CHURN_CAP` | 0.015 / 0.03 | overload churn: ≤3%/s of users |
| `ELECTRICITY_COST` | 0.0002 | CC per watt/s (deliberately small flavor cost) |
| `OFFLINE_CAP_S` | 3600 | offline earnings cap |

## Hardware curve

Cost grows ~×8 per tier, so each tier is a meaningful wall, but full-load
payback time stays in the 20–100 s range once you have the users to fill it.

| Tier | Cost | Capacity | Rev/s @full | Users to saturate |
|---|---|---|---|---|
| Raspberry Pi 5 | 50 | 10 tok/s | 0.5 | 20 |
| Jetson Orin Nano | 400 | 50 tok/s | 4.5 | 63 |
| Mini PC N100 | 3,000 | 300 tok/s | 48 | 250 |
| AMD AI Halo Mini PC | 25,000 | 2,000 tok/s | 550 | 1,000 |
| Quad-RTX 5090 WS | 200,000 | 12,000 tok/s | 5,400 | 4,000 |
| DGX Spark | 1.5M | 70,000 tok/s | 49,000 | 14,000 |
| 1U 8×H200 | 12M | 400,000 tok/s | 440,000 | 50,000 |
| NVL72 Rack | 100M | 2.5M tok/s | 4.4M | 208,000 |
| Data Hall | 1B | 20M tok/s | 35M | 1.7M |
| Hyperscale Campus | 12B | 160M tok/s | 320M | 13.3M |

Because bigger models earn a higher `revMult` **and** demand more per user,
upgrading hardware raises both your ceiling and the load pressure — the
"expand or churn" tension drives the whole game.

## User growth (logistic, so it can't overshoot forever)

```
growth/s = users × R × (1 − load) + trickle      when load ≤ 1
churn/s  = users × min(0.03, 0.015 × (load − 1)) when load > 1
R        = 0.005 + Σ marketing boosts (up to +0.0255)
```

- At 50% load, ~0.25–1.5%/s growth depending on marketing.
- Users asymptotically fill your capacity — the load bar will sit high and
  nag you to expand.
- Marketing adds users instantly and raises R permanently, so the best
  strategy is: buy hardware → buy marketing → buy more hardware to catch
  the spike.

## Clicking

Base click is 1 CC; 12 one-time upgrades add up to ~81,000 CC/click with a
×4–5 cost curve. Clicking carries the early game (~first 5 minutes), then
passive serving takes over — the classic clicker arc.

## Milestone pacing targets

- ~30 s: second Raspberry Pi
- ~2–3 min: Orin Nano online
- ~8–10 min: Mini PC, first marketing blitz
- ~20–30 min: AMD AI Halo serving 32B models
- ~1–2 h: DGX Spark, DeepSeek-R1 236B
- ~1 day: first rack-mount servers and NVL72 racks

(Exact times depend on click rate and marketing timing.)

## Prestige (IPO)

- IPO available when **lifetime** earnings (never reset) hit 1B CC; each
  subsequent IPO needs ×10 more lifetime earnings (1B, 10B, 100B…).
- Going public resets credits, hardware, upgrades, marketing and users, but
  gives a **permanent +25%** multiplier on all earnings (click + passive).
- Each IPO also awards **one investor perk** (player's choice):

| Perk | Effect | Stacking |
|---|---|---|
| 💰 Venture Money | +10% earnings | additive, uncapped |
| 📈 Growth Hacker | +0.15%/s user growth | additive into R |
| 🛠️ Hardware Partner | -1.5% hardware cost growth | growth floor at 5% (1.05) |

- Venture Money stacks with the base +25% into `prestigeMult`:
  `1 + 0.25×ipos + 0.10×venture`.
- Hardware Partner shrinks the per-copy cost multiplier (1.13 → 1.05 at 5
  perks), which matters most in the late game where you buy many copies of
  one tier. Requirement growth (×10) vs bonus growth keeps IPO #2+ landing
  at roughly the same point in each run.

## Hardware specs (flavor stats)

Each unit carries `ramGB` / `vramGB` / `diskGB` (model size) and
`ramUseGB` / `vramUseGB` / `diskTotalGB` so the ops panel can show real
resource bars: RAM, VRAM and disk used-vs-total. These are display-only —
the economy is unchanged — but the used numbers are sized so CPU-only tiers
live in RAM, GPU tiers fill VRAM, and model files stay proportional to real
4-bit quantized weights.
