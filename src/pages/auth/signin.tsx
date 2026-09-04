import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import GoogleButton from "@/components/ui/google-button";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useRouter } from "next/router";
import { getSession } from "next-auth/react";
import PageLayout from "@/components/ui/page-layout";
import { useGlobalContext } from "@/context/GlobalContext";
import { Button } from "@/components/ui/primitives/Button";
import { FormField } from "@/components/ui/primitives/FormField";
import { Input } from "@/components/ui/primitives/Input";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 transition-transform duration-200 hover:scale-110"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 transition-transform duration-200 hover:scale-110"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function SigninPage() {
  const { login, loginWithGoogle, loading } = useAuth();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { generalData } = useGlobalContext();
  const { locale } = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  /**
   * Sign-in checks only that a password was entered.
   *
   * This used to enforce full password STRENGTH here — lowercase, uppercase, digit,
   * symbol, 8+ characters — on the *login* form. That is the wrong place for it:
   * any account whose password predates the current policy (or was created through
   * Google, or set before the rule tightened) could not even submit the form, and
   * the user was shown a validation error implying they had typed it wrongly.
   *
   * Worse, the rule here required a lowercase letter while the signup rule did not,
   * so the two disagreed and a password accepted at registration could be rejected
   * at login. Strength belongs on signup and reset only — see src/utils/password.ts.
   */
  const validatePassword = (value: string) => value.trim().length > 0;

  const onSubmit = async (data: any) => {
    setError("");
    setSuccess(false);
    try {
      await login(data.email, data.password, locale);
      setSuccess(true);

      // Users who haven't submitted (or were rejected on) their identity
      // documents must complete verification before using the platform
      const session = await getSession();
      const verificationStatus = session?.user?.verification_status;
      if (verificationStatus === "unsubmitted" || verificationStatus === "rejected") {
        router.push("/account-verification");
        return;
      }

      // Redirect back to the originally requested page, otherwise the homepage
      const callbackUrl = router.query.callbackUrl as string | undefined;
      if (callbackUrl && callbackUrl.startsWith("/")) {
        router.push(callbackUrl);
      } else {
        router.push("/");
      }
    } catch (err: Error | unknown) {
      setError(getErrorMessage(err, locale === "ar" ? "فشل تسجيل الدخول. يرجى المحاولة مرة أخرى." : "Login failed. Please try again."));
    }
  };

  const handleLoginWithGoogle = async () => {
    setError("");
    try {
      await loginWithGoogle();
    } catch (err: Error | unknown) {
      setError(getErrorMessage(err, locale === "ar" ? "فشل تسجيل الدخول بواسطة الإنترنت. يرجى المحاولة مرة أخرى." : "Google login failed. Please try again."));
    }
  };

  const PasswordValidationErrorMessage = locale === "ar" ?
    "يجب أن يكون كلمة المرور على الأقل 8 أحرف, تشمل حروف كبيرة وصغيرة ورقم ورمز خاص."
    :
    "Password must be at least 8 characters, include uppercase, lowercase, a number, and a special character.";

  return (
    <PageLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background-dark py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-app-red mb-1 tracking-tight">
              {generalData?.logging_page_settings.sign_in_title}
            </h2>
            <p className="text-app-black dark:text-white text-sm sm:text-base mb-4 sm:mb-6">
              {generalData?.logging_page_settings.sign_in_subtitle}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            {error && (
              <div className="w-full mb-4 text-center text-red-600 text-xs sm:text-sm font-semibold" role="alert">
                {error}
              </div>
            )}
            {success && (
              <div className="w-full mb-4 text-center text-green-600 text-xs sm:text-sm font-semibold" role="status">
                {
                  locale === "ar" ?
                    "تم تسجيل الدخول بنجاح!"
                    :
                    "Signed in successfully!"
                }
              </div>
            )}

            <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
              <FormField error={errors.email?.message as string}>
                <Input
                  type="email"
                  {...register("email", {
                    required: "Email is required.",
                    validate: value =>
                      validateEmail(value) || "Please enter a valid email.",
                  })}
                  placeholder={generalData?.logging_page_settings.email_placeholder}
                  required
                  className="rtl:text-right"
                  autoComplete="username"
                />
              </FormField>

              <FormField error={errors.password?.message as string}>
                <div className="relative w-full">
                  <Input
                    type={showPassword ? "text" : "password"}
                    {...register("password", {
                      required: "Password is required.",
                      validate: value =>
                        validatePassword(value) || PasswordValidationErrorMessage
                    })}
                    placeholder={generalData?.logging_page_settings.password_placeholder}
                    required
                    invalid={Boolean(errors.password)}
                    className="pr-12 rtl:pl-12 rtl:pr-4"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-4 rtl:left-4 rtl:right-auto top-1/2 -translate-y-1/2 p-1 rounded-full text-app-red hover:bg-app-red/10 transition-colors duration-200"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </FormField>

              <div className="w-full flex justify-end">
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-app-red hover:underline font-semibold"
                >
                  {generalData?.logging_page_settings.forget_password_label}
                </Link>
              </div>

              <Button type="submit" loading={loading} size="lg" fullWidth>
                {generalData?.logging_page_settings.login_button}
              </Button>

              <div className="relative w-full my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    {
                      locale === "ar" ?
                        "او استمرار ب"
                        :
                        "Or continue with"
                    }
                  </span>
                </div>
              </div>
            </form>

            <GoogleButton
              onClick={handleLoginWithGoogle}
              locale={locale}
              text={generalData?.logging_page_settings.google_button}
            />

            <div className="flex items-center justify-center gap-1 mt-6">
              <div className="text-center text-app-black dark:text-white text-sm sm:text-base">
                {
                  locale === "ar" ?
                    "ليس لديك حساب؟"
                    :
                    "Don't have an account?"
                }
              </div>
              <Link
                href="/auth/signup"
                className="text-app-red font-bold hover:underline"
              >
                {
                  locale === "ar" ?
                    "انشئ حساب"
                    :
                    "Sign up"
                }
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
