// Manual-click upgrades: each bought once, power adds to click value.
// Cost curve is roughly x4-x5 per tier so clicking stays relevant
// through the mid game but passive income dominates late.

export interface ClickUpgradeDef {
  id: string;
  name: string;
  flavor: string;
  power: number; // +credits per click
  cost: number;
  emoji: string;
}

export const CLICK_UPGRADES: ClickUpgradeDef[] = [
  { id: 'ergo',     name: 'Ergonomic Keyboard',     flavor: 'Your wrists thank you',        power: 1,     cost: 50,         emoji: '⌨️' },
  { id: 'monitor2', name: 'Second Monitor',         flavor: 'Double the dashboards',        power: 2,     cost: 250,        emoji: '🖥️' },
  { id: 'mech',     name: 'Mechanical Keyboard',    flavor: 'Tactile switches = +tokens',  power: 5,     cost: 1200,       emoji: '🔑' },
  { id: 'course',   name: 'Prompt Eng. Masterclass',flavor: 'Sharper prompts, faster answers', power: 12, cost: 6000,      emoji: '🎓' },
  { id: 'ultrawide',name: 'Ultrawide Monitor',      flavor: 'See all the context windows',  power: 30,    cost: 30000,      emoji: '📺' },
  { id: 'copilot',  name: 'AI Copilot Rig',         flavor: 'AI that helps you serve AI',   power: 80,    cost: 150000,     emoji: '🤖' },
  { id: 'desk',     name: 'Standing Desk Empire',   flavor: 'Never skip leg day',          power: 200,   cost: 800000,     emoji: '🪑' },
  { id: 'neural',   name: 'Neural Headset',         flavor: 'Think the requests into being', power: 500, cost: 4000000,    emoji: '🧠' },
  { id: 'robohands',name: 'Robot Hands',            flavor: 'Type with all ten… and then some', power: 1200, cost: 25000000, emoji: '🦾' },
  { id: 'quantum',  name: 'Quantum Keyboard',       flavor: 'Every keystroke is a superposition', power: 4000, cost: 150000000, emoji: '⚛️' },
  { id: 'telepathy',name: 'Telepathy Link',         flavor: 'Serve requests without moving', power: 15000, cost: 1000000000, emoji: '📡' },
  { id: 'singularity', name: 'Click Singularity',   flavor: 'One click, infinite tokens',  power: 60000, cost: 8000000000, emoji: '🕳️' },
];

export const BASE_CLICK_POWER = 1;
