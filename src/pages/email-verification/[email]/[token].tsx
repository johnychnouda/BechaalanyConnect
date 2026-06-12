import React, { useState } from "react";
import { useRouter } from "next/router";
import PageLayout from "@/components/ui/page-layout";
import { useForm } from "react-hook-form";
import { useGlobalContext } from "@/context/GlobalContext";
import { authService } from "@/services/auth.service";
import { getErrorMessage } from "@/utils/getErrorMessage";
import Link from "next/link";

type VerifyForm = {
  code: string;
};

export default function EmailVerificationPage() {
  const router = useRouter();
  const { email, token } = router.query as { email?: string; token?: string };
  const { generalData } = useGlobalContext();
  const { locale } = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<VerifyForm>({
    defaultValues: { code: "" },
  });

  const decodedEmail = decodeURIComponent(email || "");

  const onSubmit = async (data: VerifyForm) => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await authService.verifyEmail(data.code, decodedEmail, token || "");
      setSuccess(locale === "ar" ? "تم التحقق من البريد الإلكتروني بنجاح! يرجى تسجيل الدخول." : "Email verified successfully! Please sign in.");
      router.push(`/${locale || "en"}/auth/signin`);
    } catch (err) {
      setError(getErrorMessage(err, locale === "ar" ? "رمز التحقق غير صالح أو منتهي الصلاحية." : "Invalid or expired verification code."));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    try {
      await authService.resendVerificationCode(decodedEmail, locale || "en");
      setSuccess(locale === "ar" ? "تم إعادة إرسال رمز التحقق بنجاح." : "Verification code resent successfully.");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(getErrorMessage(err, locale === "ar" ? "تعذر إعادة إرسال الرمز. حاول مرة أخرى." : "Could not resend the code. Please try again."));
    }
  };

  const pageTitle = locale === "ar" ? "تحقق من بريدك الإلكتروني" : "Verify your email";
  const pageSubtitle = locale === "ar"
    ? "أدخل رمز التحقق المكون من 6 أرقام الذي أرسلناه إلى بريدك الإلكتروني."
    : "Enter the 6-digit verification code we sent to your email.";

  return (
    <PageLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#E73828] mb-1 tracking-tight">{pageTitle}</h2>
            <p className="text-black text-sm sm:text-base mb-4 sm:mb-6">{pageSubtitle}</p>
            {decodedEmail && (
              <p className="text-black text-xs sm:text-sm font-semibold break-all">{decodedEmail}</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            {error && (
              <div className="w-full mb-4 text-center text-red-600 text-xs sm:text-sm font-semibold">{error}</div>
            )}
            {success && (
              <div className="w-full mb-4 text-center text-green-600 text-xs sm:text-sm font-semibold">{success}</div>
            )}

            <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
              <input
                type="text"
                inputMode="numeric"
                {...register("code", {
                  required: locale === "ar" ? "رمز التحقق مطلوب" : "Verification code is required",
                })}
                placeholder={locale === "ar" ? "رمز التحقق" : "Verification Code"}
                className="w-full border border-[#E73828] rounded-full px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#E73828] text-black bg-transparent placeholder:text-black text-center"
              />
              {errors.code && (
                <div className="w-full mb-2 text-center text-red-600 text-xs sm:text-sm font-semibold">{errors.code.message}</div>
              )}

              <button
                type="submit"
                disabled={loading || !email || !token}
                className="w-full bg-[#E73828] text-white font-bold py-3 rounded-full mt-2 hover:bg-white hover:text-[#E73828] border border-[#E73828] transition-colors duration-200 text-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (locale === "ar" ? "جاري التحقق..." : "Verifying...") : (locale === "ar" ? "تحقق" : "Verify")}
              </button>
            </form>

            <div className="w-full text-center mt-4 text-black text-sm sm:text-base">
              {locale === "ar" ? "لم تستلم بريد إلكتروني؟ " : "Didn't receive an email? "}
              <button type="button" className="text-[#E73828] font-bold hover:underline" onClick={handleResend}>
                {locale === "ar" ? "إعادة الإرسال" : "Resend code"}
              </button>
            </div>

            <div className="flex items-center justify-center gap-1 mt-6">
              <div className="text-center text-black text-sm sm:text-base">
                {locale === "ar" ? "العودة إلى" : "Back to"}
              </div>
              <Link href="/auth/signin" className="text-[#E73828] font-bold hover:underline">
                {generalData?.logging_page_settings?.login_button || (locale === "ar" ? "تسجيل الدخول" : "Sign in")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
