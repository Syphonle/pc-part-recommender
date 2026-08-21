import type { Part } from "./types";

/**
 * Fallback for parts without a verified direct product-page URL (see Part.amazonUrl for the
 * preferred path). Guessing ASIN/SKU style URLs risks linking to the wrong (or a dead)
 * listing, so a retailer search results page for the part's brand + name is the honest
 * fallback destination instead.
 */
export function retailerSearchUrl(retailer: "amazon" | "newegg", part: Part): string {
  const query = encodeURIComponent(`${part.brand} ${part.name}`);
  if (retailer === "amazon") return `https://www.amazon.com/s?k=${query}`;
  return `https://www.newegg.com/p/pl?d=${query}`;
}

/** The best available Amazon link for a part: a specific verified listing if we have one, else a search. */
export function amazonLinkFor(part: Part): string {
  return part.amazonUrl ?? retailerSearchUrl("amazon", part);
}
