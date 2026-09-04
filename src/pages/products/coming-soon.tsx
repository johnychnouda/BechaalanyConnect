import React from "react";
import { useRouter } from "next/router";
import ComingSoon from "@/components/ui/coming-soon";
import BackButton from "@/components/ui/back-button";

export default function ProductComingSoon() {
  const router = useRouter();
  // Every caller (SearchModal, products/product.tsx, search.tsx) links here
  // with `?product=`, not `?title=` — this always read the wrong query key,
  // so ComingSoon fell back to its own generic title regardless of which
  // product was clicked.
  const { product } = router.query;

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton href="/categories" className="mb-4" />
      <ComingSoon title={product as string} />
    </div>
  );
} 