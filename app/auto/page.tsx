"use client";

import { useState } from "react";
import { GameSelector } from "@/components/GameSelector";
import { BuildResultView } from "@/components/BuildResultView";
import { NumberField } from "@/components/NumberField";
import { SiteHeader } from "@/components/SiteHeader";
import { recommendBuild } from "@/lib/recommend";
import type { BuildResult, GameTarget, Resolution } from "@/lib/types";

const resolutions: { value: Resolution; label: string }[] = [
  { value: "1080p", label: "1080p" },
  { value: "1440p", label: "1440p" },
  { value: "4k", label: "4K" },
];

export default function AutoRecommend() {
  const [budget, setBudget] = useState(1200);
  const [resolution, setResolution] = useState<Resolution>("1440p");
  const [games, setGames] = useState<GameTarget[]>([]);
  const [result, setResult] = useState<BuildResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (games.length === 0) {
      setError("Pick at least one game.");
      return;
    }
    if (budget <= 0) {
      setError("Budget must be greater than $0.");
      return;
    }

    // Runs entirely in the browser — no server involved, so this works on a static host.
    setResult(recommendBuild({ budget, resolution, games }));
  }

  return (
    <div className="flex flex-1 justify-center px-4 py-16" style={{ backgroundColor: "var(--background)" }}>
      <main className="relative z-10 flex w-full max-w-3xl flex-col">
        <SiteHeader
          title="Get a recommendation"
          description="Set a budget, pick the games you play, and set a target FPS for each — we'll put together a compatible build to match."
        />

        <div
          className="flex flex-col rounded-lg border"
          style={{
            backgroundColor: "var(--viz-surface)",
            borderColor: "var(--surface-border)",
            marginTop: "1.5rem",
          }}
        >
          {result ? (
            <div className="p-6">
              <BuildResultView result={result} onReset={() => setResult(null)} />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="flex flex-wrap gap-8 p-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="budget" className="font-mono text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--viz-text-muted)" }}>
                    Budget
                  </label>
                  <div className="relative w-32">
                    <span
                      className="pointer-events-none absolute inset-y-0 left-3 flex items-center font-mono text-sm"
                      style={{ color: "var(--viz-text-muted)" }}
                    >
                      $
                    </span>
                    <NumberField
                      id="budget"
                      min={0}
                      step={10}
                      value={budget}
                      onChange={setBudget}
                      className="w-full rounded border py-1.5 pr-3 pl-6 font-mono text-sm tabular-nums"
                      style={{
                        borderColor: "var(--viz-baseline)",
                        color: "var(--viz-text-primary)",
                        backgroundColor: "var(--background)",
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--viz-text-muted)" }}>
                    Resolution
                  </span>
                  <div
                    className="inline-flex w-fit overflow-hidden rounded border"
                    style={{ borderColor: "var(--viz-baseline)" }}
                  >
                    {resolutions.map((r, i) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setResolution(r.value)}
                        aria-pressed={resolution === r.value}
                        className={`px-4 py-1.5 font-mono text-sm font-medium transition-colors ${
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
              </div>

              <div className="flex flex-col gap-2 border-t p-6" style={{ borderColor: "var(--surface-border)" }}>
                <span className="font-mono text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--viz-text-muted)" }}>
                  Games
                </span>
                <GameSelector selected={games} onChange={setGames} />
              </div>

              {error && (
                <div className="px-6 text-sm" style={{ color: "var(--viz-critical)" }}>
                  {error}
                </div>
              )}

              <div className="flex justify-end border-t p-4" style={{ borderColor: "var(--surface-border)" }}>
                <button
                  type="submit"
                  className="hud-button font-display inline-flex items-center gap-2 rounded px-5 py-2 text-sm font-bold transition-colors hover:bg-[var(--accent-hover)]"
                  style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
                >
                  Recommend a build
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
