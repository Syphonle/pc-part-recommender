"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { GameSelector } from "@/components/GameSelector";
import { FpsBar } from "@/components/FpsBar";
import { PartRow } from "@/components/PartRow";
import { gpus, cpus, motherboards, rams, storages, psus, cases } from "@/lib/data/parts";
import { games as gameList } from "@/lib/data/games";
import { benchmarks } from "@/lib/data/benchmarks";
import { checkBuildCompatibility } from "@/lib/compatibility";
import { benchmarkLookup } from "@/lib/recommend";
import type { GameTarget, Part, Resolution } from "@/lib/types";

const resolutions: { value: Resolution; label: string }[] = [
  { value: "1080p", label: "1080p" },
  { value: "1440p", label: "1440p" },
  { value: "4k", label: "4K" },
];

const gameNames = new Map(gameList.map((g) => [g.id, g.name]));
const lookupFps = benchmarkLookup(benchmarks);

function CategoryPicker<T extends { id: string; name: string; price: number }>({
  label,
  parts,
  selectedId,
  onChange,
}: {
  label: string;
  parts: T[];
  selectedId: string | null;
  onChange: (id: string | null) => void;
}) {
  const sorted = [...parts].sort((a, b) => a.price - b.price);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--viz-text-muted)" }}>
        {label}
      </label>
      <select
        value={selectedId ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="rounded border px-3 py-2 text-sm"
        style={{
          borderColor: "var(--viz-baseline)",
          color: "var(--viz-text-primary)",
          backgroundColor: "var(--background)",
        }}
      >
        <option value="">— Not selected —</option>
        {sorted.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} — ${p.price}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function BuildYourOwn() {
  const [gpuId, setGpuId] = useState<string | null>(null);
  const [cpuId, setCpuId] = useState<string | null>(null);
  const [motherboardId, setMotherboardId] = useState<string | null>(null);
  const [ramId, setRamId] = useState<string | null>(null);
  const [storageId, setStorageId] = useState<string | null>(null);
  const [psuId, setPsuId] = useState<string | null>(null);
  const [caseId, setCaseId] = useState<string | null>(null);
  const [resolution, setResolution] = useState<Resolution>("1440p");
  const [games, setGames] = useState<GameTarget[]>([]);

  const gpu = gpus.find((g) => g.id === gpuId);
  const cpu = cpus.find((c) => c.id === cpuId);
  const motherboard = motherboards.find((m) => m.id === motherboardId);
  const ram = rams.find((r) => r.id === ramId);
  const storage = storages.find((s) => s.id === storageId);
  const psu = psus.find((p) => p.id === psuId);
  const pcCase = cases.find((c) => c.id === caseId);

  const selectedParts: Part[] = [gpu, cpu, motherboard, ram, storage, psu, pcCase].filter(
    (p): p is Part => p !== undefined
  );
  const totalPrice = selectedParts.reduce((sum, p) => sum + p.price, 0);
  const issues = checkBuildCompatibility({ gpu, cpu, motherboard, ram, psu });

  return (
    <div className="flex flex-1 justify-center px-4 py-12" style={{ backgroundColor: "var(--background)" }}>
      <main className="flex w-full max-w-2xl flex-col">
        <SiteHeader
          title="Build your own"
          description="Pick each part yourself. Compatibility gets checked as you go, and an FPS preview shows up once you've picked a GPU and some games."
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

          <div className="grid grid-cols-1 gap-4 border-t p-6 sm:grid-cols-2" style={{ borderColor: "var(--surface-border)" }}>
            <CategoryPicker label="Graphics Card" parts={gpus} selectedId={gpuId} onChange={setGpuId} />
            <CategoryPicker label="Processor" parts={cpus} selectedId={cpuId} onChange={setCpuId} />
            <CategoryPicker label="Motherboard" parts={motherboards} selectedId={motherboardId} onChange={setMotherboardId} />
            <CategoryPicker label="Memory" parts={rams} selectedId={ramId} onChange={setRamId} />
            <CategoryPicker label="Storage" parts={storages} selectedId={storageId} onChange={setStorageId} />
            <CategoryPicker label="Power Supply" parts={psus} selectedId={psuId} onChange={setPsuId} />
            <CategoryPicker label="Case" parts={cases} selectedId={caseId} onChange={setCaseId} />
          </div>

          {issues.length > 0 && (
            <section
              className="flex flex-col gap-2 border-t p-6"
              style={{ borderColor: "var(--surface-border)" }}
            >
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
                  aria-pressed={resolution === r.value}
                  className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                    i > 0 ? "border-l" : ""
                  } ${resolution === r.value ? "hover:bg-[var(--accent-hover)]" : "hover:bg-[var(--viz-gridline)]"}`}
                  style={{
                    borderColor: "var(--viz-baseline)",
                    backgroundColor: resolution === r.value ? "var(--accent)" : "transparent",
                    color: resolution === r.value ? "var(--accent-contrast)" : "var(--viz-text-primary)",
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
            <GameSelector selected={games} onChange={setGames} />
          </div>

          {gpu && games.length > 0 && (
            <section className="flex flex-col gap-4 border-t p-6" style={{ borderColor: "var(--surface-border)" }}>
              <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--viz-text-muted)" }}>
                Predicted FPS with {gpu.name}
              </h3>
              <div className="flex flex-col gap-4">
                {games.map((t) => {
                  const predictedFps = lookupFps(gpu.id, t.gameId, resolution) ?? 0;
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
