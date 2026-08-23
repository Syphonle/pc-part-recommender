import { CategoryPickerClient } from "@/components/CategoryPickerClient";
import { CATEGORY_ORDER } from "@/lib/data/categoryMeta";
import type { Category } from "@/lib/types";

export function generateStaticParams() {
  return CATEGORY_ORDER.map((category) => ({ category }));
}

export default async function CategoryPickerPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  return <CategoryPickerClient category={category as Category} />;
}
