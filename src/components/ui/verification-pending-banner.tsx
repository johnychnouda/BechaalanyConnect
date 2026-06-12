import React from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

/**
 * Site-wide banner shown while the user's identity documents are awaiting
 * admin approval, or prompting them to submit if they haven't yet.
 */
export default function VerificationPendingBanner() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const isArabic = router.locale === "ar";

  if (!isAuthenticated || !user) return null;
  if (user.verification_status === "approved") return null;
  // Don't show on the verification page itself
  if (router.pathname === "/account-verification") return null;

  const isPending = user.verification_status === "pending";

  return (
    <div className="w-full bg-[#FFF4E5] border-b border-[#F0C36D] text-[#8A6D3B] text-sm px-4 py-2 text-center">
      {isPending ? (
        isArabic
          ? "حسابك قيد المراجعة. ستتمكن من إجراء الطلبات وإضافة الرصيد بعد موافقة الإدارة."
          : "Your account is under review. You will be able to place orders and add credits once approved by the admin."
      ) : (
        <button
          type="button"
          onClick={() => router.push("/account-verification")}
          className="underline font-semibold"
        >
          {isArabic
            ? "يرجى إكمال التحقق من هويتك لاستخدام جميع ميزات المنصة."
            : "Please complete your identity verification to use all platform features."}
        </button>
      )}
    </div>
  );
}
