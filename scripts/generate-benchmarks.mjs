// One-time authoring tool: produces lib/data/benchmarks.ts as a plain static table.
// Not imported at runtime — the app only ever reads the generated file.
//
// Last regenerated: 2026-08-20, using real data gathered via web search:
//   - Per-GPU relative performance at 1440p from techfuelhq's 2026 GPU hierarchy
//     (normalized to RTX 5090 = 100), cross-checked against verdictbits' 1080p table.
//   - Per-game "gameMult" (modeled fps at perfIndex=100, i.e. roughly RTX 5090-tier, at
//     1440p) derived from at least one real published/aggregated benchmark data point per
//     game — see the comment on each entry below for the anchor used.
// This is still a MODEL, not per-cell sourced data: every other GPU's fps is interpolated
// from its relative-performance index, not individually measured in that specific game.
// Known gaps: no ray tracing / upscaling modeling, no CPU-bound behavior except where a
// game has an explicit cap below, and identically-tiered GPUs from the source table still
// scale purely off their one performance number rather than per-title architecture quirks.
import { writeFileSync } from "node:fs";

// Relative performance at 1440p, RTX 5090 = 100. Must mirror lib/data/parts.ts GPU ids.
// Source: techfuelhq.com 2026 GPU hierarchy table (fetched 2026-08-20).
const gpuPerfIndex1440p = {
  "arc-b570": 26.5,
  "rtx-3060-12g": 25.0,
  "arc-b580": 30.3,
  "rx-7600": 27.2,
  "rtx-4060": 28.4,
  "rtx-5060": 35.8,
  "rx-9060xt-8g": 37.3,
  "rx-9060xt-16g": 40.2,
  "rtx-4060ti-16g": 36.2,
  "rtx-5060ti-16g": 43.9,
  "rx-7700xt": 43.4,
  "rtx-4070": 46.5,
  "rtx-5070": 57.6,
  "rx-9070": 62.1,
  "rx-9070xt": 69.7,
  "rtx-5070ti": 69.8,
  "rtx-4080-super": 70.9,
  "rtx-5080": 76.7,
  "rtx-5090": 100.0,
};

// How far a GPU's perf gap from the RTX 5090 widens/narrows off its 1440p baseline.
// Calibrated from techfuelhq (1440p) vs verdictbits (1080p) on the 10 GPUs common to both:
// average gap ratio (1080p gap / 1440p gap) was ~0.84 — i.e. cards compress toward the
// flagship at 1080p (more CPU-bound), and by symmetry we widen them back out at 4K.
// Known limitation: this keeps the RTX 5090's own fps resolution-invariant per game (its
// perfIndex is pinned at 100 at every resolution), which understates the real fps a
// flagship gains from dropping resolution — a reasonable simplification, not a measurement.
const resolutionSpread = {
  "1080p": 0.84,
  "1440p": 1.0,
  "4k": 1.25,
};

function perfIndexAtResolution(tier1440p, resolution) {
  const gap = 100 - tier1440p;
  return 100 - gap * resolutionSpread[resolution];
}

// gameMult = modeled fps at perfIndex 100 (RTX 5090-tier) at 1440p, back-solved from a real
// anchor data point: anchorFps / (anchorGpuPerfIndex1440p / 100). cap = an explicit fps
// ceiling where real-world behavior is capped by something other than raw GPU throughput
// (CPU-bound engine, or the game's own frame cap) — sourced per game below.
const gameProfiles = {
  // Anchor: RTX 4060 ~435fps (avg of conflicting 383-680fps range across sources) — Valorant
  // is heavily CPU-bound, so the raw gameMult is not meaningful on its own; the cap does
  // the real work here (~300-400fps is the commonly cited practical ceiling).
  valorant: { gameMult: 1531, cap: 400 },
  // Anchor: RTX 5090 ~529fps at 1440p high (Tom's Hardware-style tracker) — a direct,
  // high-confidence anchor at perfIndex 100, so no additional cap needed.
  "counter-strike-2": { gameMult: 529 },
  // No clean anchor found; kept in the same "very light, CPU-bound, capped" family as
  // Valorant/CS2 per general knowledge of the LoL engine.
  "league-of-legends": { gameMult: 1200, cap: 300 },
  // Anchor: RTX 4060 90-130fps (~110) at 1440p Epic settings, no upscaling.
  fortnite: { gameMult: 387 },
  // Anchor: RTX 4060 ~120fps at 1440p high settings; search explicitly notes the modified
  // Source engine caps at 300fps regardless of GPU.
  "apex-legends": { gameMult: 422, cap: 300 },
  // Anchor: RTX 4070 ~221fps and RTX 4060 ~132fps at 1440p optimized settings — two
  // independent data points that agreed closely (~470-475) once normalized.
  "overwatch-2": { gameMult: 470 },
  // Anchor: mixed/contradictory (72fps "1440p average" vs a 4K RTX 4090 data point);
  // settled on a moderate mid-shooter estimate rather than over-trusting noisy data.
  "call-of-duty-black-ops-6": { gameMult: 200 },
  // Anchor: RTX 5080 ~180fps at 1440p ultra with DLSS3 Quality (not native — the cleanest
  // number available, so this runs slightly high versus native rendering).
  "marvel-rivals": { gameMult: 235 },
  // Anchor: RTX 4060 ~74fps at 1440p high settings.
  "gta-v": { gameMult: 261 },
  // Anchor: ~100fps at 1440p on RTX 4070-class hardware (search: "RTX 4070 or RX 7800 XT
  // sustain 100+fps at 1440p").
  rust: { gameMult: 215 },
  // Anchor: RTX 4070 ~96.5fps and RTX 4060 Ti ~81fps at 1440p, averaged after normalizing
  // (a third data point, RX 9070 XT, was discarded as inconsistent/likely CPU-bound noise).
  "helldivers-2": { gameMult: 216 },
  // Anchor: RTX 5060 >65fps (~68) at 1440p.
  "red-dead-redemption-2": { gameMult: 190 },
  // Anchor: RTX 5060 ~92.5fps at 1440p high, no ray tracing (TechSpot tested 53 GPUs in
  // this title — ray-traced numbers are much lower and not modeled here).
  "hogwarts-legacy": { gameMult: 258 },
  // Anchor: RTX 3060 Ti ~80fps at 1440p ultra. Cap: search explicitly found even a Core
  // i9-13900K was CPU-limited to ~150fps in busy areas — a well-sourced, aggressively low
  // cap for a heavily CPU-bound RPG.
  "baldurs-gate-3": { gameMult: 320, cap: 150 },
  // No clean numeric anchor found. Cap reflects Elden Ring's well-documented ~60fps engine
  // cap in the unmodded game (physics tied to framerate) — high confidence independent of
  // the inconclusive search results.
  "elden-ring": { gameMult: 413, cap: 60 },
  // Anchor: RTX 5070 Ti ~125fps at 1440p ultra, no ray tracing.
  "cyberpunk-2077": { gameMult: 179 },
  // Anchor: averaged three inconsistent data points (RX 9070 ~80fps, RTX 4080 Super
  // ~56fps, RX 7600 ~42fps at 1440p Cinematic) — one of the most demanding titles tested,
  // consistent with its reputation.
  "black-myth-wukong": { gameMult: 121 },
  // No clean numeric anchor found; kept as a rough estimate (Minecraft with shaders is
  // more render-distance/CPU bound than a typical GPU benchmark captures).
  minecraft: { gameMult: 464 },
};

const rows = [];
for (const [gameId, profile] of Object.entries(gameProfiles)) {
  for (const [gpuId, tier1440p] of Object.entries(gpuPerfIndex1440p)) {
    for (const resolution of Object.keys(resolutionSpread)) {
      const perfIndex = perfIndexAtResolution(tier1440p, resolution);
      let fps = Math.round(profile.gameMult * (perfIndex / 100));
      fps = Math.max(4, fps);
      if (profile.cap) fps = Math.min(fps, profile.cap);
      rows.push({ gameId, gpuId, resolution, fps });
    }
  }
}

const header = `import type { Benchmark } from "../types";

// Generated by scripts/generate-benchmarks.mjs — see that file for the modeling approach,
// the GPU relative-performance source, and the per-game anchor/cap used. Still a MODEL
// (interpolated from one real anchor point per game), not individually sourced per cell.
// This file itself is a plain static array: edit any row directly to substitute a real
// measured benchmark without needing to rerun the generator.
export const benchmarks: Benchmark[] = [
`;
const footer = `];
`;

const body = rows
  .map(
    (r) =>
      `  { gameId: "${r.gameId}", gpuId: "${r.gpuId}", resolution: "${r.resolution}", fps: ${r.fps} },`
  )
  .join("\n");

writeFileSync(new URL("../lib/data/benchmarks.ts", import.meta.url), header + body + "\n" + footer);
console.log(`Wrote ${rows.length} benchmark rows.`);
