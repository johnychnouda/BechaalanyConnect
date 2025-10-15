import { type Product } from "@/types/product.type";
import React from "react";
import Card from "../ui/card";
import { ProductType } from "@/types/HomeData.type";

type Props = {
  product: ProductType;
};

export default function Product({ product }: Props) {
  const categorySlug = product?.subcategory?.category?.slug;
  const subcategorySlug = product?.subcategory?.slug;
  const productSlug = product?.slug;

  const href = categorySlug && subcategorySlug && productSlug
    ? `/categories/${categorySlug}/${subcategorySlug}/${productSlug}`
    : `/products/coming-soon?product=${encodeURIComponent(productSlug || String(product.id))}`;

  return (
    <Card
      id={String(product.id)}
      title={product.name}
      image={product.full_path.image}
      type="product"
      href={href}
    />
  );
}
