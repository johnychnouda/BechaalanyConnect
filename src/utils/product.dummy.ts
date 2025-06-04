import { Product } from "@/types/product.type";
import { dummyCategories } from "./category.dummy";

export const dummyProducts: Product[] = [
  {
    id: 1,
    title: "iPhone 15 Pro Max",
    image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch_GEO_EMEA?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692845702708",
    price: 1299.99,
    category: dummyCategories.find((c) => c.id === 10) || null,
  },
  // Electronics - Laptops
  {
    id: 3,
    title: "MacBook Pro M3",
    image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-select-202310?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1697311050000",
    price: 1999.99,
    category: dummyCategories.find((c) => c.id === 5) || null,
  },
 
];
