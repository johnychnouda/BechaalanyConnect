import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
import PageLayout from "@/components/ui/page-layout";
import { useForm } from "react-hook-form";
import { useGlobalContext } from "@/context/GlobalContext";
import api from "@/utils/api";
import { getErrorMessage } from "@/utils/getErrorMessage";
import Link from "next/link";

type ResetForm = {
  password: string;
  confirmPassword: string;
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const { email, token } = router.query as { email?: string; token?: string };
  const { generalData } = useGlobalContext();
  const { locale } = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetForm>();

  const validatePassword = (value: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]).{8,}$/.test(value);

  const passwordValidationMessage = useMemo(() => (
    locale === 'ar'
      ? "يجب أن تكون كلمة المرور 8 أحرف على الأقل وتتضمن أحرفًا كبيرة وصغيرة ورقمًا ورمزًا خاصًا."
      : "Password must be at least 8 characters, include uppercase, lowercase, a number, and a special character."
  ), [locale]);

  const onSubmit = async (data: ResetForm) => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const lang = locale || 'en';
      const payload = {
        email: decodeURIComponent(email || ""),
        token: token,
        password: data.password,
        password_confirmation: data.confirmPassword,
        lang,
      } as any;

      try {
        await api.post(`/${lang}/reset-password`, payload);
      } catch (e) {
        await api.post(`/reset-password`, payload);
      }

      setSuccess(locale === 'ar' ? 'تمت إعادة تعيين كلمة المرور بنجاح.' : 'Your password has been reset successfully.');
      router.push(`/${lang}/auth/signin`);
    } catch (err) {
      setError(getErrorMessage(err, locale === 'ar' ? 'فشل إعادة تعيين كلمة المرور.' : 'Failed to reset password.'));
    } finally {
      setLoading(false);
    }
  };

  const pageTitle = generalData?.logging_page_settings?.reset_password_title || (locale === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset password');
  const pageSubtitle = generalData?.logging_page_settings?.reset_password_subtitle || (locale === 'ar' ? 'أدخل كلمة مرور جديدة لحسابك.' : 'Enter a new password for your account.');

  return (
    <PageLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#E73828] mb-1 tracking-tight">{pageTitle}</h2>
            <p className="text-black text-sm sm:text-base mb-4 sm:mb-6">{pageSubtitle}</p>
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
                type="password"
                {...register("password", {
                  required: locale === 'ar' ? "كلمة المرور مطلوبة" : "Password is required.",
                  validate: value => validatePassword(value) || passwordValidationMessage,
                })}
                placeholder={generalData?.logging_page_settings?.password_placeholder || (locale === 'ar' ? 'كلمة المرور الجديدة' : 'New password')}
                autoComplete="new-password"
                className="w-full border border-[#E73828] rounded-full px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#E73828] text-black bg-transparent placeholder:text-black"
              />
              {errors.password && (
                <div className="w-full mb-2 text-center text-red-600 text-xs sm:text-sm font-semibold">{errors.password.message}</div>
              )}

              <input
                type="password"
                {...register("confirmPassword", {
                  required: locale === 'ar' ? "تأكيد كلمة المرور مطلوب" : "Confirm password is required.",
                  validate: value => value === watch('password') || (locale === 'ar' ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.'),
                })}
                placeholder={generalData?.logging_page_settings?.confirm_password_placeholder || (locale === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm password')}
                autoComplete="new-password"
                className="w-full border border-[#E73828] rounded-full px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#E73828] text-black bg-transparent placeholder:text-black"
              />
              {errors.confirmPassword && (
                <div className="w-full mb-2 text-center text-red-600 text-xs sm:text-sm font-semibold">{errors.confirmPassword.message}</div>
              )}

              <button
                type="submit"
                disabled={loading || !email || !token}
                className="w-full bg-[#E73828] text-white font-bold py-3 rounded-full mt-2 hover:bg-white hover:text-[#E73828] border border-[#E73828] transition-colors duration-200 text-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (locale === 'ar' ? 'جاري إعادة التعيين...' : 'Resetting...') : (generalData?.logging_page_settings?.reset_password_button || (locale === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset password'))}
              </button>
            </form>

            <div className="flex items-center justify-center gap-1 mt-6">
              <div className="text-center text-black text-sm sm:text-base">
                {locale === 'ar' ? 'العودة إلى' : 'Back to'}
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


