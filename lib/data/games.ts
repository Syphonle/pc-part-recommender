import type { Game } from "../types";

// The game list is intentionally limited to titles with an entry in benchmarks.ts,
// so every recommendation is backed by real lookup data rather than a free-text guess.
//
// cpuSensitivity: esports titles are light on the GPU and chase very high refresh rates,
// which is exactly the profile that makes CPU/engine throughput the real ceiling rather than
// GPU compute — see lib/recommend.ts for how this scales the CPU requirement.
export const games: Game[] = [
  { id: "valorant", name: "Valorant", cpuSensitivity: 1.5 },
  { id: "counter-strike-2", name: "Counter-Strike 2", cpuSensitivity: 1.5 },
  { id: "league-of-legends", name: "League of Legends", cpuSensitivity: 1.5 },
  { id: "fortnite", name: "Fortnite", cpuSensitivity: 1.3 },
  { id: "apex-legends", name: "Apex Legends", cpuSensitivity: 1.4 },
  { id: "overwatch-2", name: "Overwatch 2", cpuSensitivity: 1.3 },
  { id: "call-of-duty-black-ops-6", name: "Call of Duty: Black Ops 6", cpuSensitivity: 1.1 },
  { id: "marvel-rivals", name: "Marvel Rivals", cpuSensitivity: 1.0 },
  { id: "gta-v", name: "Grand Theft Auto V", cpuSensitivity: 1.1 },
  { id: "rust", name: "Rust", cpuSensitivity: 1.3 },
  { id: "helldivers-2", name: "Helldivers 2", cpuSensitivity: 1.1 },
  { id: "red-dead-redemption-2", name: "Red Dead Redemption 2", cpuSensitivity: 1.0 },
  { id: "hogwarts-legacy", name: "Hogwarts Legacy", cpuSensitivity: 1.0 },
  { id: "baldurs-gate-3", name: "Baldur's Gate 3", cpuSensitivity: 1.3 },
  { id: "elden-ring", name: "Elden Ring", cpuSensitivity: 1.0 },
  { id: "cyberpunk-2077", name: "Cyberpunk 2077", cpuSensitivity: 1.0 },
  { id: "black-myth-wukong", name: "Black Myth: Wukong", cpuSensitivity: 1.0 },
  { id: "minecraft", name: "Minecraft (shaders, high render distance)", cpuSensitivity: 1.3 },
];
