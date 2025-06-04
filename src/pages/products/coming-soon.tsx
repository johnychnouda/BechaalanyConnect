import React from "react";
import { useRouter } from "next/router";
import ComingSoon from "@/components/ui/coming-soon";
import BackButton from "@/components/ui/back-button";

export default function ProductComingSoon() {
  const router = useRouter();
  const { title } = router.query;

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton href="/categories" className="mb-4" />
      <ComingSoon title={title as string} />
    </div>
  );
} 