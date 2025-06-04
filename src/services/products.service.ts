import { Product } from "@/types/product.type";
import { getCategories } from "./categories.service";

export async function getProducts(): Promise<Product[]> {
  const categories = await getCategories();
  const gamingCategory = categories.find(c => c.title === "GAMING") || null;

  return [
    { id: 1, title: "PUBG", image: "/pubg-image.png", price: 0, category: gamingCategory, categoryId: "1", hasContent: true },
    { id: 2, title: "FREE FIRE", image: "/freefire-image.png", price: 0, category: gamingCategory, categoryId: "1", hasContent: false },
    { id: 3, title: "JAWAKER", image: "/jawaker-image.png", price: 0, category: gamingCategory, categoryId: "1", hasContent: false },
    { id: 4, title: "CLASH OF CLANS", image: "/clashofclans-image.png", price: 0, category: gamingCategory, categoryId: "1", hasContent: false },
    { id: 5, title: "CLASH ROYAL", image: "/clashroyal-image.png", price: 0, category: gamingCategory, categoryId: "1", hasContent: false },
    { id: 6, title: "HAY DAY", image: "/hayday-image.png", price: 0, category: gamingCategory, categoryId: "1", hasContent: false },
    { id: 7, title: "BRAWL STARS", image: "/brawlstars-image.png", price: 0, category: gamingCategory, categoryId: "1", hasContent: false },
    { id: 8, title: "MOBILE LEGENDS", image: "/mobilelegends-image.png", price: 0, category: gamingCategory, categoryId: "1", hasContent: false },
    { id: 9, title: "ROBLOX", image: "/roblox-image.png", price: 0, category: gamingCategory, categoryId: "1", hasContent: false },
    { id: 10, title: "FORTNITE", image: "/fortnite-image.png", price: 0, category: gamingCategory, categoryId: "1", hasContent: false },
  ];
} 