import React, { useState } from "react";
import PageLayout from "@/components/ui/page-layout";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/router";
import { useGlobalContext } from "@/context/GlobalContext";
import api from "@/utils/api";
import { getErrorMessage } from "@/utils/getErrorMessage";

type ForgotForm = {
  email: string;
};

export default function ForgotPasswordPage() {
  const { handleSubmit, register, formState: { errors } } = useForm<ForgotForm>();
  const { locale } = useRouter();
  const { generalData } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const onSubmit = async (data: ForgotForm) => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      // Try locale-aware endpoint first, fallback to non-locale if backend differs
      const lang = locale || 'en';
      try {
        await api.post(`/${lang}/forgot-password`, { email: data.email, lang });
      } catch (e) {
        // fallback if API does not use locale prefix
        await api.post(`/forgot-password`, { email: data.email, lang });
      }

      setSuccess(
        locale === "ar"
          ? "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني ."
          : "A reset link has been sent to your email."
      );
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          locale === "ar"
            ? "فشل الطلب. يرجى المحاولة مرة أخرى."
            : "Request failed. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#E73828] mb-1 tracking-tight">
              {generalData?.logging_page_settings?.forgot_password_title || (locale === 'ar' ? 'نسيت كلمة المرور' : 'Forgot password')}
            </h2>
            <p className="text-black text-sm sm:text-base mb-4 sm:mb-6">
              {generalData?.logging_page_settings?.forgot_password_subtitle || (locale === 'ar' ? 'أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين.' : 'Enter your email to receive a reset link.')}
            </p>
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
                {...register("email", {
                  required: locale === 'ar' ? "البريد الإلكتروني مطلوب" : "Email is required.",
                  validate: value => validateEmail(value) || (locale === 'ar' ? 'يرجى إدخال بريد إلكتروني صالح.' : 'Please enter a valid email.'),
                })}
                placeholder={generalData?.logging_page_settings?.email_placeholder || (locale === 'ar' ? 'البريد الإلكتروني' : 'Email')}
                autoComplete="username"
                className="w-full border border-[#E73828] rounded-full px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#E73828] text-black bg-transparent placeholder:text-black rtl:text-right"
              />
              {errors.email && (
                <div className="w-full mb-2 text-center text-red-600 text-xs sm:text-sm font-semibold">{errors.email.message}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#E73828] text-white font-bold py-3 rounded-full mt-2 hover:bg-white hover:text-[#E73828] border border-[#E73828] transition-colors duration-200 text-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? (locale === 'ar' ? 'جاري الإرسال...' : 'Sending...')
                  : (generalData?.logging_page_settings?.send_reset_link_button || (locale === 'ar' ? 'إرسال رابط إعادة التعيين' : 'Send reset link'))}
              </button>
            </form>

            <div className="flex items-center justify-center gap-1 mt-6">
              <div className="text-center text-black text-sm sm:text-base">
                {locale === 'ar' ? 'تذكرت كلمة المرور؟' : "Remembered your password?"}
              </div>
              <Link href="/auth/signin" className="text-[#E73828] font-bold hover:underline">
                {generalData?.logging_page_settings?.login_button || (locale === 'ar' ? 'تسجيل الدخول' : 'Sign in')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}


