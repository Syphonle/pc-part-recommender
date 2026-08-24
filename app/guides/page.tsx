import { SiteHeader } from "@/components/SiteHeader";
import { buildGuides } from "@/lib/data/guides";

export default function Guides() {
  return (
    <div className="flex flex-1 justify-center px-4 py-16" style={{ backgroundColor: "var(--background)" }}>
      <main className="relative z-10 flex w-full max-w-3xl flex-col">
        <SiteHeader
          title="How to build your PC"
          description="Step-by-step video guides for putting your parts together, in the order you'll actually need them. Videos are in production — this list will fill in as each one goes live."
        />

        <div
          className="mt-6 flex flex-col rounded-lg border"
          style={{
            backgroundColor: "var(--viz-surface)",
            borderColor: "var(--surface-border)",
          }}
        >
          {buildGuides.map((guide, i) => (
            <div
              key={guide.id}
              className={`flex items-start justify-between gap-4 p-6 ${i === 0 ? "" : "border-t"}`}
              style={{ borderColor: "var(--surface-border)" }}
            >
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--accent)" }}>
                  Step {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display font-bold" style={{ color: "var(--viz-text-primary)" }}>
                  {guide.title}
                </span>
                <span className="text-sm leading-relaxed" style={{ color: "var(--viz-text-secondary)" }}>
                  {guide.description}
                </span>
              </div>

              <div className="shrink-0 pt-5">
                {guide.youtubeUrl ? (
                  <a
                    href={guide.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hud-button inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--accent-hover)]"
                    style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
                  >
                    Watch
                  </a>
                ) : (
                  <span
                    className="inline-flex items-center rounded border px-3 py-1.5 text-xs font-medium whitespace-nowrap"
                    style={{ borderColor: "var(--viz-baseline)", color: "var(--viz-text-muted)" }}
                  >
                    Coming soon
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
