import Link from "next/link";

const modes = [
  {
    href: "/auto/",
    title: "Get a recommendation",
    description:
      "Set a budget, pick the games you play, and set a target FPS for each — we'll put together a compatible build to match.",
  },
  {
    href: "/build/",
    title: "Build your own",
    description:
      "Pick each part yourself from the catalog. Get live compatibility warnings, buy links, and an FPS preview as you go.",
  },
  {
    href: "/guides/",
    title: "How to build",
    description:
      "Step-by-step video guides for physically assembling your PC, from seating the CPU to first boot.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 justify-center px-4 py-12" style={{ backgroundColor: "var(--background)" }}>
      <main className="flex w-full max-w-2xl flex-col gap-1">
        <h1 className="text-lg font-semibold tracking-tight" style={{ color: "var(--viz-text-primary)" }}>
          PC Part Recommender
        </h1>
        <p className="pb-6 text-sm leading-relaxed" style={{ color: "var(--viz-text-secondary)" }}>
          Choose how you want to put a build together.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          {modes.map((mode) => (
            <Link
              key={mode.href}
              href={mode.href}
              className="flex flex-1 flex-col gap-2 rounded-md border p-6 transition-colors hover:bg-[var(--viz-gridline)]"
              style={{
                backgroundColor: "var(--viz-surface)",
                borderColor: "var(--surface-border)",
                boxShadow: "var(--card-shadow)",
              }}
            >
              <span className="text-base font-semibold" style={{ color: "var(--viz-text-primary)" }}>
                {mode.title}
              </span>
              <span className="text-sm leading-relaxed" style={{ color: "var(--viz-text-secondary)" }}>
                {mode.description}
              </span>
              <span className="mt-2 text-sm font-medium" style={{ color: "var(--accent)" }}>
                Go →
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
