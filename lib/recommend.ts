import type {
  Benchmark,
  BuildRequest,
  BuildResult,
  Cooler,
  Cpu,
  GameResult,
  GameTarget,
  Gpu,
  Motherboard,
  Part,
  Psu,
  Ram,
  Resolution,
} from "./types";
import { localPartsProvider, type PartsProvider } from "./data/provider";
import { memoryTypeForSocket, PSU_HEADROOM_WATTS } from "./compatibility";

/**
 * "da rulez" — explicit build-philosophy rules layered on top of the value-driven logic below,
 * agreed with the user and meant to persist/be extended over time. Each one below documents
 * where it's actually enforced so future changes don't accidentally drop it.
 *
 * 1. Budget-tier GPUs (tier <= RULE_BUDGET_GPU_TIER_MAX) must be Intel — Arc cards are the
 *    value leaders at the entry level, so non-Intel options in that tier band are excluded
 *    from the whole GPU pool up front (see the `gpus` filter in recommendBuild). Only the
 *    auto-recommender is restricted — the manual builder still lists every brand, since
 *    letting someone pick anything is the point of that page.
 * 2. Never settle for 16GB DDR5 when 32GB DDR4 is the alternative — 32GB genuinely beats 16GB
 *    for real-world experience even though DDR5 is nominally faster than DDR4. Enforced in
 *    `ramForMemoryType`: crossing from DDR4 to DDR5 has to land on the 32GB floor, not just
 *    whatever capacity the build already had — so an AM4→AM5 platform crossover only goes
 *    through if it can afford to keep 32GB, otherwise the build stays on AM4.
 * 3. Only recommend GPUs you can actually buy new, not used-only — enforced at the data layer,
 *    not here: see the comment above the `gpus` array in lib/data/parts.ts. The RTX 40-series
 *    (4060/4060 Ti/4070/4080 Super) was removed 2026-08-23 after confirming its production had
 *    wound down; re-check before adding any GPU that isn't obviously current-gen.
 */
const RULE_BUDGET_GPU_TIER_MAX = 3;

/**
 * How much of the GPU's own relative strength (gamingIndex, 0-100 vs the fastest GPU) the
 * CPU's gamingIndex (0-100 vs the fastest *gaming* CPU — a different, more compressed scale,
 * not directly commensurate with the GPU one) must clear to avoid bottlenecking it. CPU
 * bottlenecks bite hardest at 1080p (the GPU has less work per frame, so the CPU's own
 * ceiling matters more) and are largely masked at 4K (the GPU is almost always the limiting
 * factor there). This is a modeled simplification — not measured per-pairing data — but the
 * resolution-dependent shape reflects well-established real-world bottleneck behavior.
 */
const CPU_REQUIREMENT_FACTOR: Record<Resolution, number> = {
  "1080p": 0.62,
  "1440p": 0.48,
  "4k": 0.28,
};
/** Motherboard tier must be >= cpuTier - this, so a flagship CPU doesn't land on a bargain board (and vice versa). */
const MOBO_TIER_SLACK = 3;
/** Target motherboard spend as a fraction of the *total* budget (a common real build-guide rule of thumb), capped so a huge budget doesn't push it all the way to a flagship board on its own — that's reserved for when the CPU genuinely needs it (see the upgrade pass). */
const MOBO_BUDGET_FRACTION = 0.15;
const MOBO_SPEND_CAP = 300;
/** PSU tier must be >= gpuTier - this, so a flagship GPU doesn't land on a bargain-tier PSU. */
const PSU_TIER_SLACK = 3;
/** 16GB comfortably covers virtually all current games — the initial allocation targets this, not 32GB, so a budget CPU doesn't end up paired with RAM that costs more than it does while the GPU sits at the cheapest tier available. */
const RAM_FLOOR_GB = 16;
/** 32GB is worth having for multitasking/streaming, but doesn't raise FPS — so it's only worth paying for once the GPU and CPU/platform passes are already maxed out and there's real budget left with nothing better to spend it on. See the RAM bump right before the case pick. */
const RAM_UPGRADE_TARGET_GB = 32;
/** 1TB comfortably fits a modern game library; bigger drives are a capacity preference, not a performance need. */
const TARGET_STORAGE_GB = 1000;

export function benchmarkLookup(benchmarks: Benchmark[]) {
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

/** da rulez #2 — see the block above. Same memory type just preserves whatever capacity the build already has; crossing into DDR5 has to clear the 32GB floor. */
function ramForMemoryType(currentRam: Ram, requiredMemoryType: "DDR4" | "DDR5", rams: Ram[]): Ram {
  if (currentRam.memoryType === requiredMemoryType) return currentRam;
  const minCapacityGb = requiredMemoryType === "DDR5" ? RAM_UPGRADE_TARGET_GB : currentRam.capacityGb;
  return cheapestMeeting(
    rams.filter((r) => r.memoryType === requiredMemoryType),
    (r) => r.capacityGb >= minCapacityGb
  );
}

/**
 * Spend real leftover budget upgrading the CPU instead of just reporting it as unused
 * headroom — e.g. a Ryzen 5 5500 build with $50+ to spare should bump to a 5600 rather than
 * sitting idle. This crosses sockets/platforms when that's where the value is (AM4 is cheaper
 * at almost every performance point below the X3D range, so it very often wins the *initial*
 * minimum-requirement pick — without cross-socket upgrades, that permanently locks the whole
 * build out of AM5 regardless of budget, which is exactly the bug this fixes). Swapping
 * socket means the motherboard and RAM (DDR4 vs DDR5) both have to move with it, and the PSU
 * gets re-validated for the new CPU's TDP — so each candidate's true cost is the CPU +
 * motherboard + RAM + PSU delta together, and a step is only taken if that full delta still
 * fits the remaining budget.
 */
function upgradeBuildWithLeftoverBudget(
  startCpu: Cpu,
  startCooler: Cooler,
  startMotherboard: Motherboard,
  startPsu: Psu,
  startRam: Ram,
  gpu: Gpu,
  cpus: Cpu[],
  coolers: Cooler[],
  motherboards: Motherboard[],
  psus: Psu[],
  rams: Ram[],
  startRemaining: number
): { cpu: Cpu; cooler: Cooler; motherboard: Motherboard; psu: Psu; ram: Ram; remaining: number } {
  let cpu = startCpu;
  let cooler = startCooler;
  let motherboard = startMotherboard;
  let psu = startPsu;
  let ram = startRam;
  let remaining = startRemaining;

  while (true) {
    let best: { cpu: Cpu; cooler: Cooler; motherboard: Motherboard; psu: Psu; ram: Ram; delta: number } | null = null;

    for (const candidate of cpus) {
      if (candidate.gamingIndex <= cpu.gamingIndex) continue;

      const candidateCooler =
        cooler.sockets.includes(candidate.socket) && cooler.tdpRating >= candidate.tdp
          ? cooler
          : cheapestMeeting(
              coolers.filter((c) => c.sockets.includes(candidate.socket)),
              (c) => c.tdpRating >= candidate.tdp
            );
      if (candidateCooler.tdpRating < candidate.tdp) continue; // catalog has no cooler strong enough

      const requiredMoboTier = candidate.tier - MOBO_TIER_SLACK;
      const candidateMobo =
        motherboard.socket === candidate.socket && motherboard.tier >= requiredMoboTier
          ? motherboard
          : cheapestMeeting(
              motherboards.filter((m) => m.socket === candidate.socket),
              (m) => m.tier >= requiredMoboTier
            );
      if (candidateMobo.tier < requiredMoboTier) continue; // catalog has no board strong enough

      const requiredWattage = Math.max(gpu.recommendedPsuWatts, gpu.tdp + candidate.tdp + PSU_HEADROOM_WATTS);
      const requiredPsuTier = gpu.tier - PSU_TIER_SLACK;
      const candidatePsu =
        psu.wattage >= requiredWattage && psu.tier >= requiredPsuTier
          ? psu
          : cheapestMeeting(
              psus.filter((p) => p.wattage >= requiredWattage),
              (p) => p.tier >= requiredPsuTier
            );
      if (candidatePsu.wattage < requiredWattage) continue; // catalog has no PSU strong enough

      const candidateRam = ramForMemoryType(ram, memoryTypeForSocket[candidate.socket], rams);

      const delta =
        candidate.price -
        cpu.price +
        (candidateCooler.price - cooler.price) +
        (candidateMobo.price - motherboard.price) +
        (candidatePsu.price - psu.price) +
        (candidateRam.price - ram.price);
      if (delta > remaining) continue;

      if (!best || candidate.gamingIndex > best.cpu.gamingIndex || (candidate.gamingIndex === best.cpu.gamingIndex && delta < best.delta)) {
        best = { cpu: candidate, cooler: candidateCooler, motherboard: candidateMobo, psu: candidatePsu, ram: candidateRam, delta };
      }
    }

    if (!best) break;
    remaining -= best.delta;
    cpu = best.cpu;
    cooler = best.cooler;
    motherboard = best.motherboard;
    psu = best.psu;
    ram = best.ram;
  }

  return { cpu, cooler, motherboard, psu, ram, remaining };
}

/**
 * Spend leftover budget on a better GPU before anything else gets a claim on it — the GPU is
 * the primary lever for both predicted FPS and real headroom, and it's the thing that was
 * previously getting starved: once an FPS target was met cheaply, all remaining budget flowed
 * into CPU/motherboard/RAM (an upgrade that doesn't even show up in the FPS numbers) instead
 * of into the GPU (which does). If a stronger GPU would introduce a new CPU bottleneck, the
 * cheapest CPU (and, if needed, motherboard/RAM) that avoids it is bundled into the same
 * step's cost as a requirement, not an option — this never takes a step that leaves the build
 * internally inconsistent.
 *
 * "Moves the FPS numbers" is taken literally: a candidate only counts as an upgrade if it
 * predicts a strictly higher fps than the current GPU in at least one of the user's actual
 * target games. Several esports titles (League, Valorant, CS2, Apex, Fortnite) have a hard
 * engine/practical fps cap baked into the benchmark table — once the current GPU is already
 * at that cap, every stronger GPU predicts the exact same number for that game, so spending
 * more on GPU tier buys literally nothing there. Without this check, a League-of-Legends-only
 * build at a modest fps target would still burn its entire budget maxing out the GPU (e.g. an
 * RTX 4070 predicting 300fps against a 60fps target) instead of leaving room for a stronger
 * CPU or more RAM, which is what actually happened before this check existed.
 */
function upgradeGpuWithLeftoverBudget(
  startGpu: Gpu,
  startCpu: Cpu,
  startCooler: Cooler,
  startMotherboard: Motherboard,
  startPsu: Psu,
  startRam: Ram,
  resolution: Resolution,
  cpuSensitivityMultiplier: number,
  targets: GameTarget[],
  lookupFps: (gpuId: string, gameId: string, resolution: Resolution) => number | undefined,
  gpus: Gpu[],
  cpus: Cpu[],
  coolers: Cooler[],
  motherboards: Motherboard[],
  psus: Psu[],
  rams: Ram[],
  startRemaining: number
): { gpu: Gpu; cpu: Cpu; cooler: Cooler; motherboard: Motherboard; psu: Psu; ram: Ram; remaining: number } {
  let gpu = startGpu;
  let cpu = startCpu;
  let cooler = startCooler;
  let motherboard = startMotherboard;
  let psu = startPsu;
  let ram = startRam;
  let remaining = startRemaining;

  while (true) {
    let best: {
      gpu: Gpu;
      cpu: Cpu;
      cooler: Cooler;
      motherboard: Motherboard;
      psu: Psu;
      ram: Ram;
      delta: number;
    } | null = null;

    for (const candidate of gpus) {
      if (candidate.gamingIndex <= gpu.gamingIndex) continue;

      // Skip candidates that can't actually do better in any game the user asked about — a
      // higher gamingIndex alone isn't enough if it's a capped/plateaued title where the
      // current GPU already predicts the max possible number.
      const improvesAnyTarget = targets.some(
        (t) => (lookupFps(candidate.id, t.gameId, resolution) ?? 0) > (lookupFps(gpu.id, t.gameId, resolution) ?? 0)
      );
      if (!improvesAnyTarget) continue;

      // A stronger GPU raises the bar for what counts as "not bottlenecking" — if the current
      // CPU no longer clears it, swapping to the cheapest one that does is mandatory here,
      // same as the original bottleneck check, not a nice-to-have.
      const requiredCpuIndex = candidate.gamingIndex * CPU_REQUIREMENT_FACTOR[resolution] * cpuSensitivityMultiplier;
      const candidateCpu =
        cpu.gamingIndex >= requiredCpuIndex ? cpu : cheapestMeeting(cpus, (c) => c.gamingIndex >= requiredCpuIndex);

      const candidateCooler =
        cooler.sockets.includes(candidateCpu.socket) && cooler.tdpRating >= candidateCpu.tdp
          ? cooler
          : cheapestMeeting(
              coolers.filter((c) => c.sockets.includes(candidateCpu.socket)),
              (c) => c.tdpRating >= candidateCpu.tdp
            );
      if (candidateCooler.tdpRating < candidateCpu.tdp) continue; // catalog has no cooler strong enough

      const requiredMoboTier = candidateCpu.tier - MOBO_TIER_SLACK;
      const candidateMobo =
        motherboard.socket === candidateCpu.socket && motherboard.tier >= requiredMoboTier
          ? motherboard
          : cheapestMeeting(
              motherboards.filter((m) => m.socket === candidateCpu.socket),
              (m) => m.tier >= requiredMoboTier
            );
      if (candidateMobo.tier < requiredMoboTier) continue; // catalog has no board strong enough

      const requiredWattage = Math.max(
        candidate.recommendedPsuWatts,
        candidate.tdp + candidateCpu.tdp + PSU_HEADROOM_WATTS
      );
      const requiredPsuTier = candidate.tier - PSU_TIER_SLACK;
      const candidatePsu =
        psu.wattage >= requiredWattage && psu.tier >= requiredPsuTier
          ? psu
          : cheapestMeeting(
              psus.filter((p) => p.wattage >= requiredWattage),
              (p) => p.tier >= requiredPsuTier
            );
      if (candidatePsu.wattage < requiredWattage) continue; // catalog has no PSU strong enough

      const candidateRam = ramForMemoryType(ram, memoryTypeForSocket[candidateCpu.socket], rams);

      const delta =
        candidate.price -
        gpu.price +
        (candidateCpu.price - cpu.price) +
        (candidateCooler.price - cooler.price) +
        (candidateMobo.price - motherboard.price) +
        (candidatePsu.price - psu.price) +
        (candidateRam.price - ram.price);
      if (delta > remaining) continue;

      if (
        !best ||
        candidate.gamingIndex > best.gpu.gamingIndex ||
        (candidate.gamingIndex === best.gpu.gamingIndex && delta < best.delta)
      ) {
        best = { gpu: candidate, cpu: candidateCpu, cooler: candidateCooler, motherboard: candidateMobo, psu: candidatePsu, ram: candidateRam, delta };
      }
    }

    if (!best) break;
    remaining -= best.delta;
    gpu = best.gpu;
    cpu = best.cpu;
    cooler = best.cooler;
    motherboard = best.motherboard;
    psu = best.psu;
    ram = best.ram;
  }

  return { gpu, cpu, cooler, motherboard, psu, ram, remaining };
}

export function recommendBuild(
  request: BuildRequest,
  provider: PartsProvider = localPartsProvider
): BuildResult {
  const { budget, resolution, games: targets } = request;
  // da rulez #1 — see the block above. Non-Intel cards are excluded from the budget tier band
  // entirely, so every downstream pick (initial, and the leftover-budget upgrade pass) only
  // ever sees Intel there; tiers above the cutoff are unaffected.
  const gpus = provider.getGpus().filter((g) => g.tier > RULE_BUDGET_GPU_TIER_MAX || g.brand === "Intel");
  const cpus = provider.getCpus();
  const coolers = provider.getCoolers();
  const motherboards = provider.getMotherboards();
  const rams = provider.getRams();
  const storages = provider.getStorages();
  const psus = provider.getPsus();
  const cases = provider.getCases();
  const games = provider.getGames();
  const gameNames = new Map(games.map((g) => [g.id, g.name]));
  const lookupFps = benchmarkLookup(provider.getBenchmarks());

  const warnings: string[] = [];

  const meetsAllTargets = (gpu: Gpu) =>
    targets.every((t) => (lookupFps(gpu.id, t.gameId, resolution) ?? 0) >= t.targetFps);

  // If any selected game is especially CPU-sensitive (esports titles, chasing high refresh
  // on a light-on-the-GPU engine), the whole build's CPU requirement scales up to match —
  // a CPU that's merely adequate for a GPU-bound AAA title isn't necessarily adequate for
  // Fortnite or League at the same GPU strength.
  const gameSensitivity = new Map(games.map((g) => [g.id, g.cpuSensitivity]));
  const cpuSensitivityMultiplier = Math.max(1, ...targets.map((t) => gameSensitivity.get(t.gameId) ?? 1));

  // Rough floor across both memory types — the real, platform-matched pick happens below
  // once the CPU (and therefore its socket/memory type) is known.
  const genericRamFloor = cheapestMeeting(rams, (r) => r.capacityGb >= RAM_FLOOR_GB);
  const storageTarget = cheapestMeeting(storages, (s) => s.capacityGb >= TARGET_STORAGE_GB);

  // Floor estimate of everything besides the GPU, so the GPU pick doesn't eat the whole budget.
  // Uses the sensible RAM/storage targets (not the cheapest possible) so this floor matches what
  // actually gets built below.
  const minRestFloor =
    cheapest(cpus).price +
    cheapest(coolers).price +
    cheapest(motherboards).price +
    genericRamFloor.price +
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
  let gpu: Gpu =
    qualifying.length > 0
      ? qualifying[0]
      : [...affordableGpus].sort((a, b) => b.tier - a.tier)[0];

  // Resolution-aware bottleneck check: how strong the CPU needs to be scales with how
  // demanding the GPU is, how much the resolution lets the CPU matter (CPU_REQUIREMENT_FACTOR
  // above), and how CPU-sensitive the selected games are (cpuSensitivityMultiplier above).
  const requiredCpuIndex = gpu.gamingIndex * CPU_REQUIREMENT_FACTOR[resolution] * cpuSensitivityMultiplier;
  const cpuCandidates = cpus
    .filter((c) => c.gamingIndex >= requiredCpuIndex)
    .sort((a, b) => a.price - b.price);
  let cpu =
    cpuCandidates.length > 0
      ? cpuCandidates[0]
      : [...cpus].sort((a, b) => b.gamingIndex - a.gamingIndex)[0];

  // Cheapest cooler that's actually rated for this CPU's TDP — an insufficient cooler means
  // real thermal throttling, not just a nice-to-have upgrade, so this is a hard requirement
  // resolved right alongside the CPU pick, the same way the motherboard/PSU are below.
  let cooler = cheapestMeeting(
    coolers.filter((c) => c.sockets.includes(cpu.socket)),
    (c) => c.tdpRating >= cpu.tdp
  );

  // Meeting the CPU's floor requirement is a minimum, not a target — a bare A620M/A520M is
  // technically "adequate" for almost any CPU under the tier check, but real builds scale
  // the board with the overall budget (B550/B650/B850-class, not the rock-bottom chipset)
  // once there's room for it. Spend up to a capped slice of the total budget on the best
  // board available, never dropping below the floor.
  const motherboardFloorCandidates = motherboards.filter(
    (m) => m.socket === cpu.socket && m.tier >= cpu.tier - MOBO_TIER_SLACK
  );
  const motherboardPool =
    motherboardFloorCandidates.length > 0
      ? motherboardFloorCandidates
      : motherboards.filter((m) => m.socket === cpu.socket);
  const moboSpendCeiling = Math.min(budget * MOBO_BUDGET_FRACTION, MOBO_SPEND_CAP);
  let motherboard = bestAffordable(motherboardPool, moboSpendCeiling);

  // The higher of the GPU's own official recommended PSU wattage and a TDP-based floor — the
  // official figure already accounts for real-world transient power spikes, not just steady TDP.
  const requiredWattage = Math.max(gpu.recommendedPsuWatts, gpu.tdp + cpu.tdp + PSU_HEADROOM_WATTS);
  const psuCandidates = psus
    .filter((p) => p.wattage >= requiredWattage && p.tier >= gpu.tier - PSU_TIER_SLACK)
    .sort((a, b) => a.price - b.price);
  let psu =
    psuCandidates.length > 0
      ? psuCandidates[0]
      : [...psus.filter((p) => p.wattage >= requiredWattage)].sort((a, b) => a.price - b.price)[0] ??
        [...psus].sort((a, b) => b.wattage - a.wattage)[0];

  let remaining = budget - gpu.price - cpu.price - cooler.price - motherboard.price - psu.price;

  // RAM must match the platform's memory type (DDR4 for AM4, DDR5 for AM5/LGA1851). Targets
  // the 16GB floor here, not 32GB — going bigger doesn't improve gaming FPS, so it shouldn't
  // compete with the GPU/CPU passes for budget (a 32GB kit outright costing more than a
  // budget CPU, while the GPU sits at the cheapest tier available, is exactly backwards). A
  // 32GB bump happens later, after those passes, only with genuine leftover budget.
  const compatibleRams = rams.filter((r) => r.memoryType === memoryTypeForSocket[cpu.socket]);
  const ramTarget = cheapestMeeting(compatibleRams, (r) => r.capacityGb >= RAM_FLOOR_GB);
  let ram = ramTarget.price <= remaining ? ramTarget : cheapest(compatibleRams);
  remaining -= ram.price;
  const storage = storageTarget.price <= remaining ? storageTarget : cheapest(storages);
  remaining -= storage.price;

  // GPU gets first claim on leftover budget — it's what actually moves the FPS numbers and
  // gives real headroom, unlike a CPU/platform upgrade the game may not even need. Any CPU
  // bottleneck a stronger GPU would introduce is fixed as part of the same step.
  ({ gpu, cpu, cooler, motherboard, psu, ram, remaining } = upgradeGpuWithLeftoverBudget(
    gpu,
    cpu,
    cooler,
    motherboard,
    psu,
    ram,
    resolution,
    cpuSensitivityMultiplier,
    targets,
    lookupFps,
    gpus,
    cpus,
    coolers,
    motherboards,
    psus,
    rams,
    remaining
  ));

  // Only after the GPU is maxed out does leftover go toward a further CPU/platform upgrade —
  // more genuine value than a nicer case, and the whole reason this step exists is to not
  // leave money on the table when e.g. a 5500 build could stretch to a 5600, or stretch all
  // the way to an AM5 X3D chip on a board that can drive it, even starting out on AM4.
  ({ cpu, cooler, motherboard, psu, ram, remaining } = upgradeBuildWithLeftoverBudget(
    cpu,
    cooler,
    motherboard,
    psu,
    ram,
    gpu,
    cpus,
    coolers,
    motherboards,
    psus,
    rams,
    remaining
  ));

  // Only now — after the GPU and CPU/platform are both maxed out — is a RAM capacity bump
  // considered: 32GB has real value (multitasking, streaming, background load), just none of
  // it shows up in the FPS numbers, so it never competed with parts that do for budget.
  const ramUpgrade = cheapestMeeting(
    rams.filter((r) => r.memoryType === ram.memoryType),
    (r) => r.capacityGb >= RAM_UPGRADE_TARGET_GB
  );
  if (ramUpgrade.capacityGb > ram.capacityGb && ramUpgrade.price - ram.price <= remaining) {
    remaining -= ramUpgrade.price - ram.price;
    ram = ramUpgrade;
  }

  // The case is the one place spending any budget still left has a real (if minor) upside —
  // cooling, build quality, aesthetics — and it's capped low, so it won't run away with it.
  const pcCase = bestAffordable(cases, remaining);
  remaining -= pcCase.price;

  const parts: Part[] = [gpu, cpu, cooler, motherboard, ram, storage, psu, pcCase];
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
