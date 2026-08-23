import type { Cpu, Gpu, Motherboard, Psu, Ram, Socket } from "./types";

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
  motherboard?: Motherboard;
  ram?: Ram;
  psu?: Psu;
}): CompatibilityIssue[] {
  const { gpu, cpu, motherboard, ram, psu } = parts;
  const issues: CompatibilityIssue[] = [];

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
