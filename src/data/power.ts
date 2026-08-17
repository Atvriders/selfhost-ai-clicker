// Power sources. Hardware draws watts; if total demand exceeds your supply,
// the fleet throttles (served capacity ×= supply/demand).
//
// Cost grows ~×7.5 per tier; each extra copy costs POWER_COST_GROWTH more.

export interface PowerDef {
  id: string;
  name: string;
  flavor: string;
  kW: number;   // generation capacity
  cost: number;
  emoji: string;
}

export const POWER: PowerDef[] = [
  { id: 'outlet', name: 'Garage Wall Outlet', flavor: 'Free. Humble beginnings.', kW: 1.5, cost: 0, emoji: '🔌' },
  { id: 'solar', name: 'Rooftop Solar Panels', flavor: 'Clean energy (the game ignores cloudy days)', kW: 5, cost: 2000, emoji: '☀️' },
  { id: 'gasgen', name: 'Gas Generator', flavor: 'Loud, thirsty, reliable', kW: 20, cost: 15000, emoji: '⛽' },
  { id: 'wind', name: 'Wind Turbine', flavor: 'Works when the wind works', kW: 50, cost: 40000, emoji: '🌬️' },
  { id: 'diesel', name: 'Diesel Generator Bank', flavor: 'A shipping container full of rumble', kW: 150, cost: 120000, emoji: '🛢️' },
  { id: 'solarfarm', name: 'Solar Farm', flavor: 'Acres of panels, one angry HOA', kW: 500, cost: 400000, emoji: '🌞' },
  { id: 'substation', name: 'Grid Substation Feed', flavor: 'Commercial power hookup', kW: 2000, cost: 1500000, emoji: '🔋' },
  { id: 'gasturbine', name: 'Gas Turbine Plant', flavor: 'Jet engines bolted to the floor', kW: 10000, cost: 6000000, emoji: '🏭' },
  { id: 'smr', name: 'Small Modular Reactor', flavor: 'Tiny atom, big watts', kW: 50000, cost: 30000000, emoji: '☢️' },
  { id: 'fusion', name: 'Fusion Plant', flavor: 'Always 10 years away — not anymore', kW: 500000, cost: 200000000, emoji: '⚛️' },
  { id: 'orbital', name: 'Orbital Solar Array', flavor: 'Power beamed down from space', kW: 5000000, cost: 1500000000, emoji: '🛰️' },
  { id: 'dyson', name: 'Dyson Swarm', flavor: 'The sun works for you now', kW: 100000000, cost: 12000000000, emoji: '🌌' },
];

export const POWER_COST_GROWTH = 1.15;
