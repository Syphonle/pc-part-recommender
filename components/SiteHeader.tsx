export function SiteHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-3 border-b pb-6" style={{ borderColor: "var(--surface-border)" }}>
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: "var(--viz-text-primary)" }}>
        {title}
      </h1>
      <p className="max-w-xl text-sm leading-relaxed" style={{ color: "var(--viz-text-secondary)" }}>
        {description}
      </p>
    </div>
  );
}
