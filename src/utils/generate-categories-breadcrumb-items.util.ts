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

  if (category) {
    res.push(category);
  }

  return res.reverse();
}
