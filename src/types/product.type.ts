import { Category } from "./category.type";

export type Product = {
  id: number;
  title: string;
  image: string;
  price: number;
  category: Category | null;
  categoryId: string;
  hasContent?: boolean;
};
