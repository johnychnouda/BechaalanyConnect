import PageLayout from "@/components/ui/page-layout";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

/**
 * NextAuth error page.
 *
 * `pages.error` in [...nextauth].ts has always pointed here, but the route did not
 * exist — so every failed sign-in (a cancelled Google consent screen, an expired
 * OAuth state, a rejected ID token) landed the user on a 404 with no explanation
 * and no way back.
 *
 * NextAuth passes the reason as ?error=. The messages below deliberately stay
 * non-specific about *why* an account could not be signed in, so this page cannot
 * be used to probe which accounts exist.
 */
export default function AuthError() {
  const router = useRouter();
  const isArabic = router.locale === "ar";
  const error = typeof router.query.error === "string" ? router.query.error : "";

  const messages: Record<string, { en: string; ar: string }> = {
    GoogleSignInFailed: {
      en: "We couldn't verify your Google sign-in. Please try again, or sign in with your email and password.",
      ar: "تعذر التحقق من تسجيل الدخول عبر Google. يرجى المحاولة مرة أخرى أو تسجيل الدخول بالبريد الإلكتروني وكلمة المرور.",
    },
    OAuthAccountNotLinked: {
      en: "An account with this email already exists. Sign in with your email and password instead.",
      ar: "يوجد حساب بهذا البريد الإلكتروني بالفعل. يرجى تسجيل الدخول بالبريد الإلكتروني وكلمة المرور.",
    },
    AccessDenied: {
      en: "Sign-in was cancelled or access was denied.",
      ar: "تم إلغاء تسجيل الدخول أو تم رفض الوصول.",
    },
    Configuration: {
      en: "Sign-in is temporarily unavailable. Please try again shortly.",
      ar: "تسجيل الدخول غير متاح مؤقتاً. يرجى المحاولة بعد قليل.",
    },
  };

  const fallback = {
    en: "Something went wrong while signing you in. Please try again.",
    ar: "حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.",
  };

  const message = (messages[error] ?? fallback)[isArabic ? "ar" : "en"];

  return (
    <PageLayout className="flex flex-col min-h-[60vh] items-center justify-center gap-6 px-6 py-12">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
          {isArabic ? "تعذر تسجيل الدخول" : "Sign-in failed"}
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-8">{message}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth/signin"
            className="px-6 py-3 rounded-lg bg-app-red text-white font-medium hover:opacity-90 transition-opacity"
          >
            {isArabic ? "العودة إلى تسجيل الدخول" : "Back to sign in"}
          </Link>

          <Link
            href="/"
            className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {isArabic ? "الصفحة الرئيسية" : "Go home"}
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
