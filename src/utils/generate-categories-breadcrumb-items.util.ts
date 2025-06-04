import { Category } from "@/types/category.type";
import { Product } from "@/types/product.type";

export function generateCategoriesBreadcrumbItems(
  category?: Category | null,
  product?: Product | null
) {
  const res: (Category | Product)[] = [];

  if (product) {
    res.push(product);
  }

  let cur = category;

  while (cur) {
    res.push(cur);
    cur = cur.category;
  }

  return res.reverse();
}
