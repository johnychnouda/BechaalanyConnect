import { type Product } from "@/types/product.type";
import React from "react";
import Card from "../ui/card";
import { ProductType } from "@/types/HomeData.type";

type Props = {
  product: ProductType;
};

export default function Product({ product }: Props) {
  const href = `/products/${product.slug}`;

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
