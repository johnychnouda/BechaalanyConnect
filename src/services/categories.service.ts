import { Category } from "@/types/category.type";

export async function getCategories(): Promise<Category[]> {
  return [
    { id: 1, title: "GAMING", full_path: { image: "/gaming-image.png" } },
    { id: 2, title: "STREAMING", full_path: { image: "/streaming-image.png" } },
    { id: 3, title: "TIKTOK COINS", full_path: { image: "/tiktok-image.png" } },
    { id: 4, title: "ONLINE CARD", full_path: { image: "/onlinecard-image.png" } },
    { id: 5, title: "SOCIAL MEDIA SERVICES", full_path: { image: "/socialmedia-image.png" } },
    { id: 6, title: "TELECOM", full_path: { image: "/telecom-image.png" } },
    { id: 7, title: "LIVE CHAT", full_path: { image: "/livechat-image.png" } },
    { id: 8, title: "DSL CARD", full_path: { image: "/dslcard-image.png" } }
  ];
} 