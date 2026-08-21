import type {
  Benchmark,
  BuildRequest,
  BuildResult,
  GameResult,
  Gpu,
  Part,
  Resolution,
} from "./types";
import { localPartsProvider, type PartsProvider } from "./data/provider";

/** CPU tier must be >= gpuTier - this, so it doesn't bottleneck the chosen GPU. */
const CPU_TIER_SLACK = 2;
/** Motherboard tier must be >= cpuTier - this, so a flagship CPU doesn't land on a bargain board (and vice versa). */
const MOBO_TIER_SLACK = 3;
/** PSU tier must be >= gpuTier - this, so a flagship GPU doesn't land on a bargain-tier PSU. */
const PSU_TIER_SLACK = 3;
/** Extra PSU wattage above GPU+CPU TDP to cover RAM/storage/fans/motherboard + safety margin, used as a floor alongside the GPU's own official recommendation. */
const PSU_HEADROOM_WATTS = 150;
/** 32GB is the practical sweet spot for gaming — more doesn't raise FPS, so we don't chase capacity with leftover budget. */
const TARGET_RAM_GB = 32;
/** 1TB comfortably fits a modern game library; bigger drives are a capacity preference, not a performance need. */
const TARGET_STORAGE_GB = 1000;

function benchmarkLookup(benchmarks: Benchmark[]) {
  const map = new Map<string, number>();
  for (const b of benchmarks) {
    map.set(`${b.gpuId}|${b.gameId}|${b.resolution}`, b.fps);
  }
  return (gpuId: string, gameId: string, resolution: Resolution) =>
    map.get(`${gpuId}|${gameId}|${resolution}`);
}

function cheapest<T extends { price: number }>(parts: T[]): T {
  return [...parts].sort((a, b) => a.price - b.price)[0];
}

/** Best (priciest) option affordable within `budget`; falls back to the cheapest option if nothing fits. */
function bestAffordable<T extends { price: number }>(parts: T[], budget: number): T {
  const affordable = parts.filter((p) => p.price <= budget);
  if (affordable.length > 0) {
    return [...affordable].sort((a, b) => b.price - a.price)[0];
  }
  return cheapest(parts);
}

/** Cheapest option meeting `predicate` (e.g. a capacity floor); falls back to the cheapest option overall. */
function cheapestMeeting<T extends { price: number }>(parts: T[], predicate: (p: T) => boolean): T {
  const meeting = parts.filter(predicate);
  return cheapest(meeting.length > 0 ? meeting : parts);
}

export function recommendBuild(
  request: BuildRequest,
  provider: PartsProvider = localPartsProvider
): BuildResult {
  const { budget, resolution, games: targets } = request;
  const gpus = provider.getGpus();
  const cpus = provider.getCpus();
  const motherboards = provider.getMotherboards();
  const rams = provider.getRams();
  const storages = provider.getStorages();
  const psus = provider.getPsus();
  const cases = provider.getCases();
  const gameNames = new Map(provider.getGames().map((g) => [g.id, g.name]));
  const lookupFps = benchmarkLookup(provider.getBenchmarks());

  const warnings: string[] = [];

  const meetsAllTargets = (gpu: Gpu) =>
    targets.every((t) => (lookupFps(gpu.id, t.gameId, resolution) ?? 0) >= t.targetFps);

  const ramTarget = cheapestMeeting(rams, (r) => r.capacityGb >= TARGET_RAM_GB);
  const storageTarget = cheapestMeeting(storages, (s) => s.capacityGb >= TARGET_STORAGE_GB);

  // Floor estimate of everything besides the GPU, so the GPU pick doesn't eat the whole budget.
  // Uses the sensible RAM/storage targets (not the cheapest possible) so this floor matches what
  // actually gets built below.
  const minRestFloor =
    cheapest(cpus).price +
    cheapest(motherboards).price +
    ramTarget.price +
    storageTarget.price +
    cheapest(psus).price +
    cheapest(cases).price;

  const rawGpuBudget = budget - minRestFloor;
  const gpuCeiling = Math.max(cheapest(gpus).price, rawGpuBudget);
  if (rawGpuBudget < cheapest(gpus).price) {
    warnings.push(
      `Your budget is tight for a full build — even the most affordable GPU (${cheapest(gpus).name}, $${cheapest(gpus).price}) leaves little room for the rest of the system.`
    );
  }

  const affordableGpus = gpus.filter((g) => g.price <= gpuCeiling).sort((a, b) => a.price - b.price);
  const qualifying = affordableGpus.filter(meetsAllTargets);
  const gpu: Gpu =
    qualifying.length > 0
      ? qualifying[0]
      : [...affordableGpus].sort((a, b) => b.tier - a.tier)[0];

  const cpuCandidates = cpus
    .filter((c) => c.tier >= gpu.tier - CPU_TIER_SLACK)
    .sort((a, b) => a.price - b.price);
  const cpu = cpuCandidates.length > 0 ? cpuCandidates[0] : cheapest(cpus);

  const motherboardCandidates = motherboards
    .filter((m) => m.socket === cpu.socket && m.tier >= cpu.tier - MOBO_TIER_SLACK)
    .sort((a, b) => a.price - b.price);
  const motherboard =
    motherboardCandidates.length > 0
      ? motherboardCandidates[0]
      : cheapest(motherboards.filter((m) => m.socket === cpu.socket));

  // The higher of the GPU's own official recommended PSU wattage and a TDP-based floor — the
  // official figure already accounts for real-world transient power spikes, not just steady TDP.
  const requiredWattage = Math.max(gpu.recommendedPsuWatts, gpu.tdp + cpu.tdp + PSU_HEADROOM_WATTS);
  const psuCandidates = psus
    .filter((p) => p.wattage >= requiredWattage && p.tier >= gpu.tier - PSU_TIER_SLACK)
    .sort((a, b) => a.price - b.price);
  const psu =
    psuCandidates.length > 0
      ? psuCandidates[0]
      : [...psus.filter((p) => p.wattage >= requiredWattage)].sort((a, b) => a.price - b.price)[0] ??
        [...psus].sort((a, b) => b.wattage - a.wattage)[0];

  let remaining = budget - gpu.price - cpu.price - motherboard.price - psu.price;

  // RAM/storage target a sensible capacity rather than maximizing spend — going bigger than
  // 32GB/1TB doesn't improve gaming FPS, so leftover budget shouldn't chase capacity there.
  const ram = ramTarget.price <= remaining ? ramTarget : cheapest(rams);
  remaining -= ram.price;
  const storage = storageTarget.price <= remaining ? storageTarget : cheapest(storages);
  remaining -= storage.price;
  // The case is the one place spending leftover budget has a real (if minor) upside — cooling,
  // build quality, aesthetics — and it's capped low, so it won't run away with the budget.
  const pcCase = bestAffordable(cases, remaining);
  remaining -= pcCase.price;

  const parts: Part[] = [gpu, cpu, motherboard, ram, storage, psu, pcCase];
  const totalPrice = parts.reduce((sum, p) => sum + p.price, 0);

  if (totalPrice > budget) {
    warnings.push(
      `This build totals $${totalPrice}, which is $${totalPrice - budget} over your $${budget} budget — the required components (CPU, motherboard, PSU) left no room to stay under budget.`
    );
  }

  const gameResults: GameResult[] = targets.map((t) => {
    const predictedFps = lookupFps(gpu.id, t.gameId, resolution) ?? 0;
    const met = predictedFps >= t.targetFps;
    if (!met) {
      warnings.push(
        `${gameNames.get(t.gameId) ?? t.gameId}: predicted ~${predictedFps} fps at ${resolution}, below your ${t.targetFps} fps target.`
      );
    }
    return {
      gameId: t.gameId,
      gameName: gameNames.get(t.gameId) ?? t.gameId,
      targetFps: t.targetFps,
      predictedFps,
      met,
    };
  });

  return {
    parts,
    totalPrice,
    budget,
    remaining: budget - totalPrice,
    gameResults,
    warnings,
  };
}
