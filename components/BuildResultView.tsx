import type { BuildResult } from "@/lib/types";
import { PartRow } from "./PartRow";
import { FpsBar } from "./FpsBar";

export function BuildResultView({ result, onReset }: { result: BuildResult; onReset: () => void }) {
  const { parts, totalPrice, budget, remaining, gameResults, warnings } = result;
  const overBudget = remaining < 0;
  const spentPct = Math.min(100, (totalPrice / budget) * 100);

  return (
    <div className="flex w-full flex-col gap-7">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold tracking-tight" style={{ color: "var(--viz-text-primary)" }}>
          Recommended build
        </h2>
        <button
          onClick={onReset}
          className="rounded border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-[var(--viz-gridline)]"
          style={{ borderColor: "var(--viz-baseline)", color: "var(--viz-text-secondary)" }}
        >
          Start over
        </button>
      </div>

      <section className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between text-sm">
          <span style={{ color: "var(--viz-text-secondary)" }}>Total cost</span>
          <span className="font-mono tabular-nums font-medium" style={{ color: overBudget ? "var(--viz-critical)" : "var(--viz-text-primary)" }}>
            ${totalPrice} <span style={{ color: "var(--viz-text-muted)" }}>/ ${budget} budget</span>
          </span>
        </div>
        <div className="relative h-2.5 w-full overflow-visible rounded-sm" style={{ backgroundColor: "var(--viz-gridline)" }}>
          <div
            className="absolute inset-y-0 left-0 rounded-sm transition-[width]"
            style={{
              backgroundColor: overBudget ? "var(--viz-critical)" : "var(--viz-good)",
              width: `${spentPct}%`,
            }}
          />
        </div>
        {!overBudget && (
          <div className="font-mono text-xs" style={{ color: "var(--viz-text-muted)" }}>
            ${remaining} left under budget
          </div>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--viz-text-muted)" }}>
          Parts list
        </h3>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left text-xs" style={{ borderColor: "var(--viz-baseline)" }}>
              <th className="pb-1.5 pr-3 font-medium" style={{ color: "var(--viz-text-muted)" }}>
                Component
              </th>
              <th className="pb-1.5 pr-3 font-medium" style={{ color: "var(--viz-text-muted)" }}>
                Item
              </th>
              <th className="pb-1.5 pr-3 text-right font-medium" style={{ color: "var(--viz-text-muted)" }}>
                Price
              </th>
              <th className="pb-1.5 text-right font-medium" style={{ color: "var(--viz-text-muted)" }}>
                Buy
              </th>
            </tr>
          </thead>
          <tbody>
            {parts.map((part, i) => (
              <PartRow key={part.id} part={part} isLast={i === parts.length - 1} />
            ))}
          </tbody>
        </table>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--viz-text-muted)" }}>
          Predicted FPS by game
        </h3>
        <div className="flex flex-col gap-4">
          {gameResults.map((r) => (
            <FpsBar key={r.gameId} result={r} />
          ))}
        </div>
      </section>

      {warnings.length > 0 && (
        <section
          className="flex flex-col gap-2 rounded border-l-2 px-4 py-3 text-sm"
          style={{
            borderColor: "var(--viz-critical)",
            backgroundColor: "color-mix(in srgb, var(--viz-critical) 8%, transparent)",
            color: "var(--viz-text-primary)",
          }}
        >
          <h3 className="font-mono text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--viz-critical)" }}>
            Notes
          </h3>
          <ul className="flex flex-col gap-1 list-disc pl-4">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
