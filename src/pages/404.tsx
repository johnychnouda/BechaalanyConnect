import PageLayout from "@/components/ui/page-layout";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

export default function NotFound() {
  const router = useRouter();
  const isDevToolsRequest = router.asPath.includes("/.well-known/appspecific/");

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
          Page Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Return Home
        </button>
      </div>
    </PageLayout>
  );
}
