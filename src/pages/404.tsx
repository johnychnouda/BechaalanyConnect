import PageLayout from "@/components/ui/page-layout";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/primitives/Button";

export default function NotFound() {
  const router = useRouter();
  const isDevToolsRequest = router.asPath.includes("/.well-known/appspecific/");
  const isArabic = router.locale === "ar";

  useEffect(() => {
    // Silently handle Chrome DevTools requests
    if (isDevToolsRequest) {
      return;
    }
  }, [isDevToolsRequest]);

  // Return null for Chrome DevTools requests to prevent unnecessary rendering
  if (isDevToolsRequest) {
    return null;
  }

  return (
    <PageLayout className="flex flex-col min-h-screen items-center justify-center gap-6 px-12 py-6">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
          {isArabic ? "الصفحة غير موجودة" : "Page Not Found"}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {isArabic
            ? "الصفحة التي تبحث عنها غير موجودة أو تم نقلها."
            : "The page you're looking for doesn't exist or has been moved."}
        </p>
        {/* Was bg-blue-600 — the only blue button in the app; the brand red is
            #E73828 everywhere else. */}
        <Button onClick={() => router.push("/")} size="lg">
          {isArabic ? "العودة للرئيسية" : "Return Home"}
        </Button>
      </div>
    </PageLayout>
  );
}
