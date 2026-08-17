# 🖥️ SelfHost.AI Clicker

An incremental clicker about **self-hosting AI models**. Serve inference
requests, buy hardware — from a Raspberry Pi 5 to an AMD AI Halo mini PC to
an NVIDIA DGX Spark and full GB200 NVL72 racks — grow your user base, watch
the load bar, and expand before your servers melt down.

## Gameplay

- **Click** to serve requests manually and earn Compute Credits.
- **Buy hardware** to raise your token/s capacity. Each tier unlocks a
  bigger model that pays more per token but makes each user demand more.
- **Real specs** — every unit lists its throughput (tokens/s), RAM, VRAM,
  and the model's size on disk; the ops panel shows fleet-wide RAM / VRAM /
  disk usage bars, latency, requests/s and uptime.
- **Your fleet** — a live rack view with one blinking LED per unit.
- **Live request feed** — watch fake user prompts stream in (and start
  queueing when you overload).
- **Watch users** grow. Load = demand ÷ capacity. Overload queues requests
  and, past the meltdown point, users start leaving.
- **Buy marketing** for instant user spikes and permanent growth boosts.
- **Go public** — at 1B lifetime credits you can IPO: reset your empire for
  a permanent +25% earnings boost plus one investor perk (more money, faster
  growth, or cheaper hardware).
- **Sounds** — synthesized click/purchase blips with a mute toggle.
- **Expand** — the load bar will never let you forget.

Progress auto-saves to localStorage, including up to 1 hour of offline
earnings when you come back.

## Stack

React 18 + TypeScript + Vite + Zustand (persist middleware). No backend —
the whole game is client-side.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3020
```

## Production build

```bash
npm run build    # outputs to dist/
```

## Docker

```bash
docker build -t selfhost-ai-clicker .
docker run -p 3020:3020 selfhost-ai-clicker
# or:
docker compose up -d
```

## Tuning

All economy constants live at the top of `src/store/gameStore.ts` and the
full curve math is documented in [BALANCE.md](./BALANCE.md).
