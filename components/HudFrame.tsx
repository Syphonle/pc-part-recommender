/**
 * Purely decorative viewport framing — corner brackets + rotated edge telemetry text — so wide
 * screens don't just show a narrow content column floating in empty space. Fixed-position,
 * pointer-events-none, aria-hidden: it never competes with or blocks real content, and only
 * shows up at lg+ where there's actually room for it.
 */
export function HudFrame() {
  const bracketStyle = { borderColor: "color-mix(in srgb, var(--accent) 35%, transparent)" };

  return (
    <div className="pointer-events-none fixed inset-0 z-0 hidden lg:block" aria-hidden="true">
      <div className="absolute top-6 left-6 h-8 w-8 border-t-2 border-l-2" style={bracketStyle} />
      <div className="absolute top-6 right-6 h-8 w-8 border-t-2 border-r-2" style={bracketStyle} />
      <div className="absolute bottom-6 left-6 h-8 w-8 border-b-2 border-l-2" style={bracketStyle} />
      <div className="absolute right-6 bottom-6 h-8 w-8 border-r-2 border-b-2" style={bracketStyle} />

      <div
        className="absolute top-1/2 left-4 origin-left -translate-y-1/2 -rotate-90 font-mono text-[10px] tracking-[0.3em] uppercase"
        style={{ color: "var(--viz-text-muted)" }}
      >
        pc://parts — build system
      </div>
      <div
        className="absolute top-1/2 right-4 origin-right -translate-y-1/2 rotate-90 font-mono text-[10px] tracking-[0.3em] uppercase"
        style={{ color: "var(--viz-text-muted)" }}
      >
        status: online
      </div>
    </div>
  );
}
