import PageLayout from "@/components/ui/page-layout";
import React from "react";

export default function NotFound() {
  return (
    <PageLayout className="flex flex-col min-h-screen items-center justify-center gap-6 px-12 py-6">
      <h1>404</h1>
      <p>Page not found</p>
    </PageLayout>
  );
}
