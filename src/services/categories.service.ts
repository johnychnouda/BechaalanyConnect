import { Category } from "@/types/category.type";

export async function getCategories(): Promise<Category[]> {
  return [
    { id: 1, title: "GAMING", image: "/gaming-image.png", category: null, showProducts: true, type: 'regular' },
    { id: 2, title: "STREAMING", image: "/streaming-image.png", category: null, showProducts: true, type: 'regular' },
    { id: 3, title: "TIKTOK COINS", image: "/tiktok-image.png", category: null, showProducts: true, type: 'regular' },
    { id: 4, title: "ONLINE CARD", image: "/onlinecard-image.png", category: null, showProducts: true, type: 'regular' },
    { id: 5, title: "SOCIAL MEDIA SERVICES", image: "/socialmedia-image.png", category: null, showProducts: true, type: 'regular' },
    { id: 6, title: "TELECOM", image: "/telecom-image.png", category: null, showProducts: true, type: 'regular' },
    { id: 7, title: "LIVE CHAT", image: "/livechat-image.png", category: null, showProducts: true, type: 'regular' },
    { id: 8, title: "DSL CARD", image: "/dslcard-image.png", category: null, showProducts: true, type: 'regular' }
  ];
} 