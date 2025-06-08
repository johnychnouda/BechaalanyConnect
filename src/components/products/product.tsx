import { type Product } from "@/types/product.type";
import React from "react";
import Card from "../ui/card";

type Props = {
  product: Product;
};

export default function Product({ product }: Props) {
  const href = product.hasContent
    ? `/products/${product.id}`
    : `/products/coming-soon?title=${encodeURIComponent(product.title)}`;
  return (
    <Card
      id={String(product.id)}
      title={product.title}
      image={product.image}
      type="product"
      href={href}
      className={product.type === 'latest' || product.type === 'featured' ? 'w-[277px] h-[312px]' : ''}
    />
  );
}
