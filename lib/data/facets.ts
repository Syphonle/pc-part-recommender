import type { Category, Cooler, Cpu, Motherboard, Part, Psu, Ram, Storage } from "../types";

export interface Facet {
  key: string;
  label: string;
  getValue: (part: Part) => string;
}

const brandFacet: Facet = { key: "brand", label: "Brand", getValue: (p) => p.brand };

/** Extra filterable dimensions per category, beyond brand — only the ones that are actually meaningful for that category (e.g. RAM kit configuration, PSU efficiency rating). */
export function facetsForCategory(category: Category): Facet[] {
  switch (category) {
    case "cpu":
      return [brandFacet, { key: "socket", label: "Socket", getValue: (p) => (p as Cpu).socket }];
    case "cooler":
      return [
        brandFacet,
        { key: "type", label: "Type", getValue: (p) => ((p as Cooler).coolerType === "aio" ? "Liquid (AIO)" : "Air") },
      ];
    case "motherboard":
      return [brandFacet, { key: "socket", label: "Socket", getValue: (p) => (p as Motherboard).socket }];
    case "ram":
      return [
        brandFacet,
        {
          key: "config",
          label: "Kit configuration",
          getValue: (p) => {
            const r = p as Ram;
            return `${r.modules}x${r.capacityGb / r.modules}GB`;
          },
        },
        { key: "speed", label: "Speed", getValue: (p) => `${(p as Ram).speedMhz} MHz` },
      ];
    case "storage":
      return [
        brandFacet,
        {
          key: "capacity",
          label: "Capacity",
          getValue: (p) => {
            const gb = (p as Storage).capacityGb;
            return gb >= 1000 ? `${gb / 1000}TB` : `${gb}GB`;
          },
        },
      ];
    case "psu":
      return [
        brandFacet,
        { key: "wattage", label: "Wattage", getValue: (p) => `${(p as Psu).wattage}W` },
        { key: "efficiency", label: "Efficiency", getValue: (p) => `80+ ${(p as Psu).efficiency}` },
      ];
    default:
      return [brandFacet];
  }
}

/** Sorts facet option values numerically by their leading number where present (so "16GB" comes before "32GB"), falling back to alphabetical. */
export function sortFacetValues(values: string[]): string[] {
  return [...values].sort((a, b) => {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    if (!Number.isNaN(numA) && !Number.isNaN(numB) && numA !== numB) return numA - numB;
    return a.localeCompare(b);
  });
}
