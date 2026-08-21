export type Resolution = "1080p" | "1440p" | "4k";

export type Category =
  | "gpu"
  | "cpu"
  | "motherboard"
  | "ram"
  | "storage"
  | "psu"
  | "case";

export type Socket = "AM5" | "LGA1851";

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
  /** Relative performance tier used for CPU-bottleneck matching, 1 (entry) - 10 (flagship). */
  tier: number;
  /** The manufacturer's official recommended system PSU wattage for this card. */
  recommendedPsuWatts: number;
}

export interface Cpu extends BasePart {
  category: "cpu";
  socket: Socket;
  tdp: number;
  /** Relative performance tier on the same 1 (entry) - 10 (flagship) scale as Gpu.tier, used for bottleneck matching. */
  tier: number;
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
