"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/auto/", label: "Recommend" },
  { href: "/build/", label: "Build" },
  { href: "/guides/", label: "Guides" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-10 border-b backdrop-blur"
      style={{ borderColor: "var(--surface-border)", backgroundColor: "color-mix(in srgb, var(--background) 88%, transparent)" }}
    >
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--accent)", boxShadow: "0 0 8px 1px var(--accent)" }} />
          <span className="font-display text-sm font-bold tracking-widest uppercase" style={{ color: "var(--viz-text-primary)" }}>
            PC<span style={{ color: "var(--accent)" }}>://</span>PARTS
          </span>
        </Link>
        <nav className="flex items-center gap-5">
          {links.map((link) => {
            const active = pathname?.startsWith(link.href.replace(/\/$/, "")) && link.href !== "/";
            return (
              <Link
                key={link.href}
                href={link.href}
                className="font-display text-xs font-medium tracking-wide uppercase transition-colors hover:text-[var(--accent)]"
                style={{ color: active ? "var(--accent)" : "var(--viz-text-secondary)" }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
