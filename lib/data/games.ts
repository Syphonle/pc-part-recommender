import type { Game } from "../types";

// The game list is intentionally limited to titles with an entry in benchmarks.ts,
// so every recommendation is backed by real lookup data rather than a free-text guess.
export const games: Game[] = [
  { id: "valorant", name: "Valorant" },
  { id: "counter-strike-2", name: "Counter-Strike 2" },
  { id: "league-of-legends", name: "League of Legends" },
  { id: "fortnite", name: "Fortnite" },
  { id: "apex-legends", name: "Apex Legends" },
  { id: "overwatch-2", name: "Overwatch 2" },
  { id: "call-of-duty-black-ops-6", name: "Call of Duty: Black Ops 6" },
  { id: "marvel-rivals", name: "Marvel Rivals" },
  { id: "gta-v", name: "Grand Theft Auto V" },
  { id: "rust", name: "Rust" },
  { id: "helldivers-2", name: "Helldivers 2" },
  { id: "red-dead-redemption-2", name: "Red Dead Redemption 2" },
  { id: "hogwarts-legacy", name: "Hogwarts Legacy" },
  { id: "baldurs-gate-3", name: "Baldur's Gate 3" },
  { id: "elden-ring", name: "Elden Ring" },
  { id: "cyberpunk-2077", name: "Cyberpunk 2077" },
  { id: "black-myth-wukong", name: "Black Myth: Wukong" },
  { id: "minecraft", name: "Minecraft (shaders, high render distance)" },
];
