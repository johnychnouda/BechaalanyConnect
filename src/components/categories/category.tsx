import { type Category } from "@/types/category.type";
import React from "react";
import Card from "../ui/card";

type Props = {
  category: Category;
};

export default function Category({ category }: Props) {
  // Slugify the category title for the URL
  const slug = category.slug;
  return (
    <Card
      id={String(category.id)}
      title={category.title}
      image={category.full_path.image}
      type="category"
      href={`/categories/${slug}`}
    />
  );
}
