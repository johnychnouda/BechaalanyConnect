import { Product } from "@/types/product.type";
import { getCategories } from "./categories.service";

export async function getProducts(): Promise<Product[]> {
  return [
    // Latest products
    { id: 1, title: "Alfa Special Number", image: "/alfa-image.png", category: null, categoryId: "", hasContent: true, type: "latest" },
    { id: 2, title: "Steam Gift Card", image: "/steam-image.png", category: null, categoryId: "", hasContent: true, type: "latest" },
    { id: 3, title: "Mtc Special Number", image: "/touch-image.png", category: null, categoryId: "", hasContent: true, type: "latest" },
    { id: 4, title: "1800 UC", image: "/uc-image.png", category: null, categoryId: "", hasContent: true, type: "latest" },
    // Featured products
    { id: 5, title: "Haki Chat", image: "/haki-image.png", category: null, categoryId: "", hasContent: true, type: "featured" },
    { id: 6, title: "Ligo Live", image: "/ligo-image.png", category: null, categoryId: "", hasContent: true, type: "featured" },
    { id: 7, title: "LaMi Chat", image: "/lami-image.png", category: null, categoryId: "", hasContent: true, type: "featured" },
    { id: 8, title: "Yoyo Chat", image: "/yoyo-image.png", category: null, categoryId: "", hasContent: true, type: "featured" }
  ];
} 