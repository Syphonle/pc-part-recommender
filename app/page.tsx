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
    <div className="flex flex-1 justify-center px-4 py-16 sm:py-24" style={{ backgroundColor: "var(--background)" }}>
      <main className="relative z-10 flex w-full max-w-5xl flex-col">
        <div className="flex flex-col gap-5">
          <span
            className="font-mono text-xs font-medium tracking-widest uppercase"
            style={{ color: "var(--accent)" }}
          >
            {"// choose your path"}
          </span>
          <h1
            className="font-display max-w-2xl text-4xl leading-[1.05] font-bold tracking-tight sm:text-6xl"
            style={{ color: "var(--viz-text-primary)" }}
          >
            Build a PC that actually hits your target FPS.
          </h1>
          <p className="max-w-xl text-base leading-relaxed sm:text-lg" style={{ color: "var(--viz-text-secondary)" }}>
            Real market prices, real benchmark data, full compatibility checking. Not guesses.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {modes.map((mode, i) => (
            <Link
              key={mode.href}
              href={mode.href}
              className="hud-card group flex flex-col gap-3 rounded-lg border p-6"
              style={{
                backgroundColor: "var(--viz-surface)",
                borderColor: "var(--surface-border)",
              }}
            >
              <span className="font-mono text-xs font-medium" style={{ color: "var(--viz-text-muted)" }}>
                0{i + 1}
              </span>
              <span className="font-display text-lg font-bold" style={{ color: "var(--viz-text-primary)" }}>
                {mode.title}
              </span>
              <span className="text-sm leading-relaxed" style={{ color: "var(--viz-text-secondary)" }}>
                {mode.description}
              </span>
              <span
                className="mt-2 flex items-center gap-1 font-mono text-xs font-medium transition-transform group-hover:translate-x-1"
                style={{ color: "var(--accent)" }}
              >
                Go →
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
