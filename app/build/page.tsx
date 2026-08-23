"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { GameSelector } from "@/components/GameSelector";
import { FpsBar } from "@/components/FpsBar";
import { PartRow } from "@/components/PartRow";
import { gpus, cpus, coolers, motherboards, rams, storages, psus, cases } from "@/lib/data/parts";
import { games as gameList } from "@/lib/data/games";
import { benchmarks } from "@/lib/data/benchmarks";
import { CATEGORY_ORDER, categoryLabels } from "@/lib/data/categoryMeta";
import { checkBuildCompatibility } from "@/lib/compatibility";
import { benchmarkLookup } from "@/lib/recommend";
import { useBuildDraft } from "@/lib/useBuildDraft";
import type { BuildDraft } from "@/lib/buildDraft";
import type { Category, GameTarget, Part, Resolution } from "@/lib/types";

const resolutions: { value: Resolution; label: string }[] = [
  { value: "1080p", label: "1080p" },
  { value: "1440p", label: "1440p" },
  { value: "4k", label: "4K" },
];

const gameNames = new Map(gameList.map((g) => [g.id, g.name]));
const lookupFps = benchmarkLookup(benchmarks);

const draftKeyByCategory: Record<Category, keyof BuildDraft> = {
  gpu: "gpuId",
  cpu: "cpuId",
  cooler: "coolerId",
  motherboard: "motherboardId",
  ram: "ramId",
  storage: "storageId",
  psu: "psuId",
  case: "caseId",
};

function findById<T extends { id: string }>(parts: T[], id: string | null): T | undefined {
  return id ? parts.find((p) => p.id === id) : undefined;
}

export default function BuildYourOwn() {
  const { draft, setDraft } = useBuildDraft();

  const gpu = findById(gpus, draft.gpuId);
  const cpu = findById(cpus, draft.cpuId);
  const cooler = findById(coolers, draft.coolerId);
  const motherboard = findById(motherboards, draft.motherboardId);
  const ram = findById(rams, draft.ramId);
  const storage = findById(storages, draft.storageId);
  const psu = findById(psus, draft.psuId);
  const pcCase = findById(cases, draft.caseId);

  const partByCategory: Record<Category, Part | undefined> = {
    gpu,
    cpu,
    cooler,
    motherboard,
    ram,
    storage,
    psu,
    case: pcCase,
  };

  const selectedParts: Part[] = [gpu, cpu, cooler, motherboard, ram, storage, psu, pcCase].filter(
    (p): p is Part => p !== undefined
  );
  const totalPrice = selectedParts.reduce((sum, p) => sum + p.price, 0);
  const issues = checkBuildCompatibility({ gpu, cpu, cooler, motherboard, ram, psu });

  function clearPart(category: Category) {
    setDraft((d) => ({ ...d, [draftKeyByCategory[category]]: null }));
  }

  function setResolution(resolution: Resolution) {
    setDraft((d) => ({ ...d, resolution }));
  }

  function setGames(games: GameTarget[]) {
    setDraft((d) => ({ ...d, games }));
  }

  return (
    <div className="flex flex-1 justify-center px-4 py-12" style={{ backgroundColor: "var(--background)" }}>
      <main className="flex w-full max-w-2xl flex-col">
        <SiteHeader
          title="Build your own"
          description="Tap a category to browse and filter its options. Compatibility gets checked as you go, and an FPS preview shows up once you've picked a GPU and some games."
        />

        <div
          className="flex flex-col rounded-md border"
          style={{
            backgroundColor: "var(--viz-surface)",
            borderColor: "var(--surface-border)",
            boxShadow: "var(--card-shadow)",
            marginTop: "1.5rem",
          }}
        >
          <div className="flex items-center justify-between p-6">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--viz-text-muted)" }}>
              Total
            </span>
            <span className="text-lg font-semibold tabular-nums" style={{ color: "var(--viz-text-primary)" }}>
              ${totalPrice}
            </span>
          </div>

          <div className="flex flex-col border-t" style={{ borderColor: "var(--surface-border)" }}>
            {CATEGORY_ORDER.map((category, i) => {
              const part = partByCategory[category];
              return (
                <div
                  key={category}
                  className={`flex items-center justify-between gap-3 p-4 ${i === 0 ? "" : "border-t"}`}
                  style={{ borderColor: "var(--surface-border)" }}
                >
                  <Link href={`/build/${category}/`} className="flex flex-1 flex-col gap-0.5 group">
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--viz-text-muted)" }}>
                      {categoryLabels[category]}
                    </span>
                    {part ? (
                      <span className="text-sm font-medium group-hover:underline" style={{ color: "var(--viz-text-primary)" }}>
                        {part.name} — ${part.price}
                      </span>
                    ) : (
                      <span className="text-sm group-hover:underline" style={{ color: "var(--accent)" }}>
                        Not selected — tap to choose
                      </span>
                    )}
                  </Link>
                  {part && (
                    <button
                      type="button"
                      onClick={() => clearPart(category)}
                      className="rounded border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-[var(--viz-gridline)]"
                      style={{ borderColor: "var(--viz-baseline)", color: "var(--viz-text-secondary)" }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {issues.length > 0 && (
            <section className="flex flex-col gap-2 border-t p-6" style={{ borderColor: "var(--surface-border)" }}>
              <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--viz-critical)" }}>
                Compatibility
              </h3>
              <ul className="flex flex-col gap-1.5 text-sm">
                {issues.map((issue) => (
                  <li
                    key={issue.message}
                    className="flex items-start gap-2"
                    style={{ color: issue.severity === "error" ? "var(--viz-critical)" : "var(--viz-text-secondary)" }}
                  >
                    <span aria-hidden="true">{issue.severity === "error" ? "✕" : "!"}</span>
                    <span>{issue.message}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {selectedParts.length > 0 && (
            <section className="flex flex-col gap-2 border-t p-6" style={{ borderColor: "var(--surface-border)" }}>
              <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--viz-text-muted)" }}>
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
                  {selectedParts.map((part, i) => (
                    <PartRow key={part.id} part={part} isLast={i === selectedParts.length - 1} />
                  ))}
                </tbody>
              </table>
            </section>
          )}

          <div className="flex flex-col gap-2 border-t p-6" style={{ borderColor: "var(--surface-border)" }}>
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--viz-text-muted)" }}>
              Resolution
            </span>
            <div className="inline-flex w-fit overflow-hidden rounded border" style={{ borderColor: "var(--viz-baseline)" }}>
              {resolutions.map((r, i) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setResolution(r.value)}
                  aria-pressed={draft.resolution === r.value}
                  className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                    i > 0 ? "border-l" : ""
                  } ${draft.resolution === r.value ? "hover:bg-[var(--accent-hover)]" : "hover:bg-[var(--viz-gridline)]"}`}
                  style={{
                    borderColor: "var(--viz-baseline)",
                    backgroundColor: draft.resolution === r.value ? "var(--accent)" : "transparent",
                    color: draft.resolution === r.value ? "var(--accent-contrast)" : "var(--viz-text-primary)",
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t p-6" style={{ borderColor: "var(--surface-border)" }}>
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--viz-text-muted)" }}>
              Games (optional — for the FPS preview)
            </span>
            <GameSelector selected={draft.games} onChange={setGames} />
          </div>

          {gpu && draft.games.length > 0 && (
            <section className="flex flex-col gap-4 border-t p-6" style={{ borderColor: "var(--surface-border)" }}>
              <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--viz-text-muted)" }}>
                Predicted FPS with {gpu.name}
              </h3>
              <div className="flex flex-col gap-4">
                {draft.games.map((t) => {
                  const predictedFps = lookupFps(gpu.id, t.gameId, draft.resolution) ?? 0;
                  return (
                    <FpsBar
                      key={t.gameId}
                      result={{
                        gameId: t.gameId,
                        gameName: gameNames.get(t.gameId) ?? t.gameId,
                        targetFps: t.targetFps,
                        predictedFps,
                        met: predictedFps >= t.targetFps,
                      }}
                    />
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
