import type { Cooler, Cpu, Gpu, Motherboard, Psu, Ram, Socket } from "./types";

/** AM4 boards take DDR4; AM5 and LGA1851 both take DDR5. A RAM kit only fits a matching platform. */
export const memoryTypeForSocket: Record<Socket, "DDR4" | "DDR5"> = {
  AM4: "DDR4",
  AM5: "DDR5",
  LGA1851: "DDR5",
};

/** Extra PSU wattage above GPU+CPU TDP to cover RAM/storage/fans/motherboard + safety margin, used as a floor alongside the GPU's own official recommendation. */
export const PSU_HEADROOM_WATTS = 150;

export interface CompatibilityIssue {
  severity: "error" | "warning";
  message: string;
}

/**
 * Hard compatibility checks for a manually-assembled build — the same real constraints the
 * auto-recommender enforces when picking parts itself, exposed here so the manual builder can
 * flag them as you go. Only genuine "this won't work" issues (socket, memory type, PSU
 * wattage) — not the softer tier-matching heuristics the recommender uses to pick *good*
 * pairings, which are opinions rather than hard requirements.
 */
export function checkBuildCompatibility(parts: {
  gpu?: Gpu;
  cpu?: Cpu;
  cooler?: Cooler;
  motherboard?: Motherboard;
  ram?: Ram;
  psu?: Psu;
}): CompatibilityIssue[] {
  const { gpu, cpu, cooler, motherboard, ram, psu } = parts;
  const issues: CompatibilityIssue[] = [];

  if (cpu && cooler && !cooler.sockets.includes(cpu.socket)) {
    issues.push({
      severity: "error",
      message: `${cooler.name} doesn't have a mounting bracket for ${cpu.socket}, so it won't fit ${cpu.name}.`,
    });
  }

  if (cpu && cooler && cooler.tdpRating < cpu.tdp) {
    issues.push({
      severity: "error",
      message: `${cooler.name} is rated for up to ${cooler.tdpRating}W, but ${cpu.name} has a ${cpu.tdp}W TDP — it isn't enough to cool this CPU.`,
    });
  }

  if (cpu && motherboard && cpu.socket !== motherboard.socket) {
    issues.push({
      severity: "error",
      message: `${cpu.name} is a ${cpu.socket} CPU, but ${motherboard.name} is a ${motherboard.socket} board — they won't physically fit together.`,
    });
  }

  if (cpu && ram) {
    const requiredType = memoryTypeForSocket[cpu.socket];
    if (ram.memoryType !== requiredType) {
      issues.push({
        severity: "error",
        message: `${cpu.name} (${cpu.socket}) needs ${requiredType} memory, but ${ram.name} is ${ram.memoryType}.`,
      });
    }
  }

  if (gpu && cpu && psu) {
    const requiredWattage = Math.max(gpu.recommendedPsuWatts, gpu.tdp + cpu.tdp + PSU_HEADROOM_WATTS);
    if (psu.wattage < requiredWattage) {
      issues.push({
        severity: "error",
        message: `${psu.name} (${psu.wattage}W) isn't enough for ${gpu.name} + ${cpu.name} — at least ${requiredWattage}W recommended.`,
      });
    }
  } else if (gpu && psu && psu.wattage < gpu.recommendedPsuWatts) {
    issues.push({
      severity: "warning",
      message: `${psu.name} (${psu.wattage}W) is below ${gpu.name}'s official recommended ${gpu.recommendedPsuWatts}W.`,
    });
  }

  return issues;
}

/**
 * Proactive filtering for the manual builder's per-category picker pages: given whichever
 * *other* parts are already picked, narrow a category's catalog down to only the options that
 * could actually work — rather than letting an incompatible pick happen and only flagging it
 * afterward via checkBuildCompatibility. Each function only looks at the other categories, so
 * picking any part in any order lands on the same set of choices for everything else.
 */
export function compatibleCpus(cpus: Cpu[], other: { motherboard?: Motherboard; ram?: Ram }): Cpu[] {
  return cpus.filter((c) => {
    if (other.motherboard && c.socket !== other.motherboard.socket) return false;
    if (other.ram && memoryTypeForSocket[c.socket] !== other.ram.memoryType) return false;
    return true;
  });
}

export function compatibleCoolers(coolers: Cooler[], other: { cpu?: Cpu }): Cooler[] {
  return coolers.filter((c) => {
    if (other.cpu && !c.sockets.includes(other.cpu.socket)) return false;
    if (other.cpu && c.tdpRating < other.cpu.tdp) return false;
    return true;
  });
}

export function compatibleMotherboards(motherboards: Motherboard[], other: { cpu?: Cpu; ram?: Ram }): Motherboard[] {
  return motherboards.filter((m) => {
    if (other.cpu && m.socket !== other.cpu.socket) return false;
    if (other.ram && memoryTypeForSocket[m.socket] !== other.ram.memoryType) return false;
    return true;
  });
}

export function compatibleRams(rams: Ram[], other: { cpu?: Cpu; motherboard?: Motherboard }): Ram[] {
  return rams.filter((r) => {
    if (other.cpu && r.memoryType !== memoryTypeForSocket[other.cpu.socket]) return false;
    if (other.motherboard && r.memoryType !== memoryTypeForSocket[other.motherboard.socket]) return false;
    return true;
  });
}

export function compatiblePsus(psus: Psu[], other: { gpu?: Gpu; cpu?: Cpu }): Psu[] {
  return psus.filter((p) => {
    if (other.gpu && other.cpu) {
      const required = Math.max(other.gpu.recommendedPsuWatts, other.gpu.tdp + other.cpu.tdp + PSU_HEADROOM_WATTS);
      return p.wattage >= required;
    }
    if (other.gpu) return p.wattage >= other.gpu.recommendedPsuWatts;
    return true;
  });
}
