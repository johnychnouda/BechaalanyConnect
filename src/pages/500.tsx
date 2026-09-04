import PageLayout from "@/components/ui/page-layout";
import { useRouter } from "next/router";
import React from "react";
import { Button } from "@/components/ui/primitives/Button";

/**
 * Did not exist before — an uncaught server/render error fell through to
 * Next's default unbranded, English-only error page, with no shell and no
 * way back into the site.
 */
export default function ServerError() {
  const router = useRouter();
  const isArabic = router.locale === "ar";

  return (
    <PageLayout className="flex flex-col min-h-screen items-center justify-center gap-6 px-12 py-6">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">500</h1>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
          {isArabic ? "حدث خطأ في الخادم" : "Something went wrong"}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {isArabic
            ? "نواجه مشكلة من جانبنا. يرجى المحاولة مرة أخرى بعد قليل."
            : "We're having trouble on our end. Please try again in a moment."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={() => router.reload()} variant="outline" size="lg">
            {isArabic ? "إعادة المحاولة" : "Try again"}
          </Button>
          <Button onClick={() => router.push("/")} size="lg">
            {isArabic ? "العودة للرئيسية" : "Return Home"}
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
