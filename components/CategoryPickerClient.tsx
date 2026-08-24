"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { partDetail } from "@/components/PartRow";
import { amazonLinkFor, retailerSearchUrl } from "@/lib/retailerLinks";
import { categoryLabels } from "@/lib/data/categoryMeta";
import { facetsForCategory, sortFacetValues } from "@/lib/data/facets";
import { gpus, cpus, coolers, motherboards, rams, storages, psus, cases } from "@/lib/data/parts";
import {
  compatibleCoolers,
  compatibleCpus,
  compatibleMotherboards,
  compatiblePsus,
  compatibleRams,
} from "@/lib/compatibility";
import { useBuildDraft } from "@/lib/useBuildDraft";
import type { BuildDraft } from "@/lib/buildDraft";
import type { Category, Part } from "@/lib/types";

const partsByCategory: Record<Category, Part[]> = {
  gpu: gpus,
  cpu: cpus,
  cooler: coolers,
  motherboard: motherboards,
  ram: rams,
  storage: storages,
  psu: psus,
  case: cases,
};

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

export function CategoryPickerClient({ category }: { category: Category }) {
  const router = useRouter();
  const { draft, setDraft } = useBuildDraft();
  const [facetSelections, setFacetSelections] = useState<Record<string, Set<string>>>({});
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const gpu = findById(gpus, draft.gpuId);
  const cpu = findById(cpus, draft.cpuId);
  const motherboard = findById(motherboards, draft.motherboardId);
  const ram = findById(rams, draft.ramId);

  const allInCategory = partsByCategory[category];

  // Same proactive filtering as the auto-recommender's compatibility rules — only the parts
  // that could actually work with what's already picked, so an incompatible pick is never
  // even offered rather than being flagged after the fact.
  const compatiblePool = useMemo(() => {
    switch (category) {
      case "cpu":
        return compatibleCpus(cpus, { motherboard, ram });
      case "cooler":
        return compatibleCoolers(coolers, { cpu });
      case "motherboard":
        return compatibleMotherboards(motherboards, { cpu, ram });
      case "ram":
        return compatibleRams(rams, { cpu, motherboard });
      case "psu":
        return compatiblePsus(psus, { gpu, cpu });
      default:
        return allInCategory;
    }
  }, [category, cpu, motherboard, ram, gpu, allInCategory]);

  const facets = facetsForCategory(category);
  const facetOptions = useMemo(
    () =>
      facets
        .map((f) => ({
          facet: f,
          values: sortFacetValues([...new Set(compatiblePool.map((p) => f.getValue(p)))]),
        }))
        .filter((fo) => fo.values.length > 1),
    [facets, compatiblePool]
  );

  const filtered = [...compatiblePool]
    .filter((p) => facets.every((f) => !facetSelections[f.key]?.size || facetSelections[f.key].has(f.getValue(p))))
    .sort((a, b) => (sortOrder === "asc" ? a.price - b.price : b.price - a.price));

  const draftKey = draftKeyByCategory[category];
  const selectedId = draft[draftKey] as string | null;

  function toggleFacetValue(facetKey: string, value: string) {
    setFacetSelections((prev) => {
      const next = new Set(prev[facetKey] ?? []);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return { ...prev, [facetKey]: next };
    });
  }

  function selectPart(id: string) {
    setDraft((d) => ({ ...d, [draftKey]: id }));
    router.push("/build/");
  }

  return (
    <div className="flex flex-1 justify-center px-4 py-16" style={{ backgroundColor: "var(--background)" }}>
      <main className="flex w-full max-w-2xl flex-col">
        <div className="flex flex-col gap-2 border-b pb-6" style={{ borderColor: "var(--surface-border)" }}>
          <Link href="/build/" className="font-mono text-xs font-medium hover:underline" style={{ color: "var(--viz-text-muted)" }}>
            ← Back to build
          </Link>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: "var(--viz-text-primary)" }}>
            Choose a {categoryLabels[category].toLowerCase()}
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "var(--viz-text-secondary)" }}>
            {compatiblePool.length < allInCategory.length
              ? `Narrowed to ${compatiblePool.length} of ${allInCategory.length} options that fit what you've already picked.`
              : `${allInCategory.length} options available.`}
          </p>
        </div>

        {facetOptions.length > 0 && (
          <div
            className="mt-6 flex flex-wrap gap-x-8 gap-y-4 rounded-lg border p-4"
            style={{ backgroundColor: "var(--viz-surface)", borderColor: "var(--surface-border)" }}
          >
            {facetOptions.map(({ facet, values }) => (
              <div key={facet.key} className="flex flex-col gap-1.5">
                <span className="font-mono text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--viz-text-muted)" }}>
                  {facet.label}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {values.map((value) => {
                    const active = facetSelections[facet.key]?.has(value) ?? false;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => toggleFacetValue(facet.key, value)}
                        className="rounded-full border px-2.5 py-1 font-mono text-xs font-medium transition-colors"
                        style={{
                          borderColor: active ? "var(--accent)" : "var(--viz-baseline)",
                          backgroundColor: active ? "var(--accent)" : "transparent",
                          color: active ? "var(--accent-contrast)" : "var(--viz-text-secondary)",
                        }}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <span className="font-mono text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--viz-text-muted)" }}>
            Sort by price
          </span>
          <div className="inline-flex overflow-hidden rounded border" style={{ borderColor: "var(--viz-baseline)" }}>
            {(
              [
                { value: "asc" as const, label: "Low to high" },
                { value: "desc" as const, label: "High to low" },
              ]
            ).map((option, i) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSortOrder(option.value)}
                aria-pressed={sortOrder === option.value}
                className={`px-3 py-1.5 font-mono text-xs font-medium transition-colors ${
                  i > 0 ? "border-l" : ""
                } ${sortOrder === option.value ? "hover:bg-[var(--accent-hover)]" : "hover:bg-[var(--viz-gridline)]"}`}
                style={{
                  borderColor: "var(--viz-baseline)",
                  backgroundColor: sortOrder === option.value ? "var(--accent)" : "transparent",
                  color: sortOrder === option.value ? "var(--accent-contrast)" : "var(--viz-text-primary)",
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div
          className="mt-3 flex flex-col rounded-lg border"
          style={{ backgroundColor: "var(--viz-surface)", borderColor: "var(--surface-border)" }}
        >
          {filtered.length === 0 && (
            <div className="p-6 text-sm" style={{ color: "var(--viz-text-muted)" }}>
              No options match these filters.
            </div>
          )}
          {filtered.map((part, i) => {
            const detail = partDetail(part);
            const isSelected = part.id === selectedId;
            return (
              <div
                key={part.id}
                className={`flex items-center justify-between gap-4 p-4 ${i === 0 ? "" : "border-t"}`}
                style={{
                  borderColor: "var(--surface-border)",
                  backgroundColor: isSelected ? "color-mix(in srgb, var(--accent) 8%, transparent)" : "transparent",
                }}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium" style={{ color: "var(--viz-text-primary)" }}>
                    {part.name}
                  </span>
                  {detail && (
                    <span className="font-mono text-xs" style={{ color: "var(--viz-text-secondary)" }}>
                      {detail}
                    </span>
                  )}
                  <div className="flex gap-3 text-xs font-medium">
                    <a
                      href={amazonLinkFor(part)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                      style={{ color: "var(--accent)" }}
                    >
                      Amazon
                    </a>
                    <a
                      href={retailerSearchUrl("newegg", part)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                      style={{ color: "var(--viz-text-muted)" }}
                    >
                      Search Newegg
                    </a>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-mono font-medium tabular-nums" style={{ color: "var(--viz-text-primary)" }}>
                    ${part.price}
                  </span>
                  <button
                    type="button"
                    onClick={() => selectPart(part.id)}
                    className="hud-button rounded px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors hover:bg-[var(--accent-hover)]"
                    style={{
                      backgroundColor: isSelected ? "var(--viz-good)" : "var(--accent)",
                      color: "var(--accent-contrast)",
                    }}
                  >
                    {isSelected ? "Selected" : "Select"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
