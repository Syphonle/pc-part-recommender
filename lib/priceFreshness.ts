import { priceHistory } from "./data/priceHistory";

/** The most recent date (YYYY-MM-DD) this part's price was checked, or undefined if it isn't in the rolling 30-day history at all. */
export function lastCheckedAt(partId: string): string | undefined {
  let latest: string | undefined;
  for (const check of priceHistory) {
    if (check.partId === partId && (!latest || check.checkedAt > latest)) {
      latest = check.checkedAt;
    }
  }
  return latest;
}

export function formatCheckedDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
