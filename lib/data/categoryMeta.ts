import type { Category } from "../types";

/** Display order for the manual builder — roughly the order you'd actually shop in. */
export const CATEGORY_ORDER: Category[] = [
  "gpu",
  "cpu",
  "cooler",
  "motherboard",
  "ram",
  "storage",
  "psu",
  "case",
];

export const categoryLabels: Record<Category, string> = {
  gpu: "Graphics Card",
  cpu: "Processor",
  cooler: "CPU Cooler",
  motherboard: "Motherboard",
  ram: "Memory",
  storage: "Storage",
  psu: "Power Supply",
  case: "Case",
};
