import type { Part } from "@/lib/types";
import { amazonLinkFor, retailerSearchUrl } from "@/lib/retailerLinks";
import { categoryLabels } from "@/lib/data/categoryMeta";
import { formatCheckedDate, lastCheckedAt } from "@/lib/priceFreshness";

export function partDetail(part: Part): string | null {
  switch (part.category) {
    case "gpu":
      return `${part.tdp}W TDP`;
    case "cpu":
      return `${part.socket} socket · ${part.tdp}W TDP`;
    case "cooler":
      return `${part.coolerType === "aio" ? "Liquid (AIO)" : "Air"} · rated up to ${part.tdpRating}W`;
    case "motherboard":
      return `${part.socket} socket`;
    case "ram":
      return `${part.capacityGb}GB`;
    case "storage":
      return `${(part.capacityGb / 1000).toFixed(part.capacityGb % 1000 === 0 ? 0 : 1)}TB`;
    case "psu":
      return `${part.wattage}W`;
    default:
      return null;
  }
}

export function PartRow({ part, isLast }: { part: Part; isLast: boolean }) {
  const detail = partDetail(part);
  const checkedAt = lastCheckedAt(part.id);
  return (
    <tr className={isLast ? "" : "border-b"} style={{ borderColor: "var(--surface-border)" }}>
      <td className="py-2.5 pr-3 align-top font-mono text-xs whitespace-nowrap" style={{ color: "var(--viz-text-muted)" }}>
        {categoryLabels[part.category]}
      </td>
      <td className="py-2.5 pr-3 align-top">
        <div className="font-medium" style={{ color: "var(--viz-text-primary)" }}>
          {part.name}
        </div>
        {detail && (
          <div className="font-mono text-xs" style={{ color: "var(--viz-text-secondary)" }}>
            {detail}
          </div>
        )}
      </td>
      <td className="py-2.5 pr-3 text-right align-top font-mono font-medium tabular-nums whitespace-nowrap" style={{ color: "var(--viz-text-primary)" }}>
        ${part.price}
        {checkedAt && (
          <div className="text-xs font-normal whitespace-nowrap" style={{ color: "var(--viz-text-muted)" }}>
            Verified {formatCheckedDate(checkedAt)}
          </div>
        )}
      </td>
      <td className="py-2.5 align-top text-right whitespace-nowrap">
        <div className="flex justify-end gap-3 text-xs font-medium">
          <a
            href={amazonLinkFor(part)}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: "var(--accent)" }}
            title={part.amazonUrl ? "Go to this specific listing on Amazon" : "Search for this part on Amazon"}
          >
            Amazon
          </a>
          <a
            href={retailerSearchUrl("newegg", part)}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: "var(--viz-text-muted)" }}
            title="Search for this part on Newegg"
          >
            Search Newegg
          </a>
        </div>
      </td>
    </tr>
  );
}
