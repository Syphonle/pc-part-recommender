import Link from "next/link";

export function SiteHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-1 border-b pb-4" style={{ borderColor: "var(--surface-border)" }}>
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="text-xs font-medium hover:underline"
          style={{ color: "var(--viz-text-muted)" }}
        >
          ← Home
        </Link>
      </div>
      <h1 className="text-lg font-semibold tracking-tight" style={{ color: "var(--viz-text-primary)" }}>
        {title}
      </h1>
      <p className="text-sm leading-relaxed" style={{ color: "var(--viz-text-secondary)" }}>
        {description}
      </p>
    </div>
  );
}
