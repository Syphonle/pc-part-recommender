import type { GameResult } from "@/lib/types";

export function FpsBar({ result }: { result: GameResult }) {
  const { gameName, predictedFps, targetFps, met } = result;
  const scaleMax = Math.max(predictedFps, targetFps) * 1.15;
  const fillPct = Math.min(100, (predictedFps / scaleMax) * 100);
  const targetPct = Math.min(100, (targetFps / scaleMax) * 100);
  const statusVar = met ? "var(--viz-good)" : "var(--viz-critical)";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span style={{ color: "var(--viz-text-primary)" }} className="font-medium">
          {gameName}
        </span>
        <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--viz-text-secondary)" }}>
          <span aria-hidden="true" style={{ color: statusVar }}>
            {met ? "✓" : "✕"}
          </span>
          {met ? "Meets target" : "Below target"}
        </span>
      </div>
      <div
        className="relative h-2.5 w-full overflow-visible rounded-sm"
        style={{ backgroundColor: "var(--viz-gridline)" }}
        title={`${predictedFps} fps predicted / ${targetFps} fps target`}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-sm"
          style={{ backgroundColor: statusVar, width: `${fillPct}%` }}
        />
        <div
          className="absolute top-1/2 h-4 w-[2px] -translate-y-1/2"
          style={{ left: `${targetPct}%`, backgroundColor: "var(--viz-text-primary)" }}
          aria-hidden="true"
        />
      </div>
      <div className="flex justify-between text-xs tabular-nums" style={{ color: "var(--viz-text-muted)" }}>
        <span>{predictedFps} fps predicted</span>
        <span>{targetFps} fps target</span>
      </div>
    </div>
  );
}
