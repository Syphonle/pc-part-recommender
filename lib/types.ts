export type Resolution = "1080p" | "1440p" | "4k";

export type Category =
  | "gpu"
  | "cpu"
  | "motherboard"
  | "ram"
  | "storage"
  | "psu"
  | "case";

export type Socket = "AM4" | "AM5" | "LGA1851";

interface BasePart {
  id: string;
  name: string;
  brand: string;
  price: number;
  /** Direct link to a specific, real listing for this part (a trusted board partner / manufacturer-official listing where available). */
  amazonUrl?: string;
}

export interface Gpu extends BasePart {
  category: "gpu";
  tdp: number;
  /** Coarse build-quality tier, 1 (entry) - 10 (flagship) — used for PSU-tier matching, not the CPU bottleneck check. */
  tier: number;
  /** Real relative gaming performance at 1440p, sourced from a GPU benchmark hierarchy, RTX 5090 = 100. */
  gamingIndex: number;
  /** The manufacturer's official recommended system PSU wattage for this card. */
  recommendedPsuWatts: number;
}

export interface Cpu extends BasePart {
  category: "cpu";
  socket: Socket;
  tdp: number;
  /** Coarse build-quality tier, 1 (entry) - 10 (flagship), derived from gamingIndex — used for motherboard-tier matching. */
  tier: number;
  /** Real relative *gaming* performance at 1080p (where CPU differences show up most), sourced from a CPU benchmark hierarchy — not general/productivity benchmarks, which overstate high-core-count CPUs for gaming purposes. Scale is CPU-population-relative, not directly comparable to Gpu.gamingIndex's number line. */
  gamingIndex: number;
}

export interface Motherboard extends BasePart {
  category: "motherboard";
  socket: Socket;
  /** Build-quality tier on the same rough 1 (entry) - 10 (flagship) scale as Cpu.tier/Gpu.tier (VRM quality, chipset class), used so the board doesn't undersell the rest of the build. */
  tier: number;
}

export interface Ram extends BasePart {
  category: "ram";
  capacityGb: number;
  /** AM4 boards take DDR4, AM5/LGA1851 take DDR5 — a kit can only pair with a matching platform. */
  memoryType: "DDR4" | "DDR5";
}

export interface Storage extends BasePart {
  category: "storage";
  capacityGb: number;
}

export interface Psu extends BasePart {
  category: "psu";
  wattage: number;
  /** Build-quality tier on the same rough 1 (entry) - 10 (flagship) scale as Gpu.tier (efficiency rating, brand, headroom), used so the PSU doesn't undersell the rest of the build. */
  tier: number;
}

export interface Case extends BasePart {
  category: "case";
}

export type Part = Gpu | Cpu | Motherboard | Ram | Storage | Psu | Case;

export interface Game {
  id: string;
  name: string;
  /**
   * How much more CPU headroom this game needs relative to what a "typical" GPU-bound AAA
   * title needs at the same GPU strength/resolution, 1.0 = typical. Esports titles (light on
   * the GPU, chasing very high refresh rates) are the classic CPU-bound genre — 1.0 alone
   * would let a CPU that's merely "adequate for Cyberpunk" pair with a fast GPU in Fortnite or
   * League, when in practice the CPU is the real ceiling for those specific games.
   */
  cpuSensitivity: number;
}

export interface Benchmark {
  gameId: string;
  gpuId: string;
  resolution: Resolution;
  fps: number;
}

export interface GameTarget {
  gameId: string;
  targetFps: number;
}

export interface BuildRequest {
  budget: number;
  resolution: Resolution;
  games: GameTarget[];
}

export interface GameResult {
  gameId: string;
  gameName: string;
  targetFps: number;
  predictedFps: number;
  met: boolean;
}

export interface BuildResult {
  parts: Part[];
  totalPrice: number;
  budget: number;
  remaining: number;
  gameResults: GameResult[];
  warnings: string[];
}
