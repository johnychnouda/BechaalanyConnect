import React, { useState } from "react";
import CustomDropdown from "@/components/ui/custom-dropdown";
import GoogleButton from "@/components/ui/google-button";
import VerifyEmailModal from "@/components/ui/verify-email-modal";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { authService } from "@/services/auth.service";
import { useGlobalContext } from "@/context/GlobalContext";
import { getErrorMessage } from "@/utils/getErrorMessage";
import Link from "next/link";
import PageLayout from "@/components/ui/page-layout";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 transition-transform duration-200 hover:scale-110"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#E73828"
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
      stroke="#E73828"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const { login, loginWithGoogle, loading } = useAuth();
  const [error, setError] = useState("");
  const [showVerify, setShowVerify] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyToken, setVerifyToken] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const { generalData } = useGlobalContext();
  const countries = generalData?.countries || [];
  const userTypes = generalData?.user_types || [];
  const { locale } = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const country = watch("country") as keyof typeof countries;
  const phonePrefix = countries.find(c => c.slug === country)?.code || "";

  const validatePhone = (phone: string) => {
    const countryFormat = countries.find(c => c.slug === country);
    if (!countryFormat) return false;
    const digits = phone.replace(/\D/g, "");
    if (countryFormat.code === "+961") {
      return digits.length === 7 || digits.length === 8;
    }
    if (["+963", "+971", "+962", "+966", "+20"].includes(countryFormat.code)) {
      return digits.length >= 8 && digits.length <= 10;
    }
    return digits.length >= 7;
  };

  const validatePassword = (password: string) => {
    return /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password);
  };

  const onSubmit = async (data: any) => {
    setError("");
    setSuccess("");
    setSubmitLoading(true);
    const phone = phonePrefix + data.phone;
    try {
      const response = await authService.register({
        email: data.email,
        phone: phone,
        username: data.username,
        country: data.country,
        userType: data.userType,
        storeName: data.storeName,
        location: data.location,
        password: data.password,
        confirmPassword: data.confirmPassword,
        isBusiness: data.isBusiness || false,
        lang: router.locale || 'en'
      });
      setShowVerify(true);
      setVerifyEmail(data.email);
      setVerifyToken(response.verification_token || "");
      setRegPassword(data.password);
      reset();
    } catch (err: any) {
      setError(getErrorMessage(err, "Registration failed. Please try again."));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleVerify = async (code: string) => {
    setVerifyLoading(true);
    setVerifyError("");
    try {
      await authService.verifyEmail(code, verifyEmail, verifyToken);
      setShowVerify(false);
      setShowPending(true);
      if (regPassword) {
        try {
          await login(verifyEmail, regPassword);
          setSuccess(locale === "ar" ? "تم التحقق من البريد الإلكتروني وتم تسجيل الدخول بنجاح!" : "Account verified and logged in successfully!");
          router.push("/account-dashboard");
        } catch (loginErr: any) {
          console.error("Auto-login failed:", loginErr);
          setSuccess(locale === "ar" ? "تم التحقق من البريد الإلكتروني بنجاح! يرجى تسجيل الدخول." : "Account verified successfully! Please log in.");
          router.push("/auth/signin");
        }
      }
    } catch (err: any) {
      setVerifyLoading(false);
      setVerifyError(err.message || "Invalid verification code. Please try again.");
      return;
    }
    setVerifyLoading(false);
  };

  const handleGoogleSignup = async () => {
    setError("");
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || "Google signup failed. Please try again.");
    }
  };

  const ResendCode = async () => {
    try {
      await authService.resendVerificationCode(verifyEmail, router.locale || 'en');
      setVerifyError("");
      setSuccess(locale === "ar" ? "تم إعادة إرسال رمز التحقق بنجاح." : "Verification code resent successfully.");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      setVerifyError(err.message || "Network error. Please try again.");
      setSuccess("");
    }
  };

  const isBusiness = watch("isBusiness");

  return (
    <>
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#E73828] mb-1 tracking-tight">
                {generalData?.logging_page_settings.sign_up_title}
              </h2>
              <p className="text-black text-sm sm:text-base mb-4 sm:mb-6">
                {generalData?.logging_page_settings.sign_up_subtitle}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              {error && (
                <div className="w-full mb-4 text-center text-red-600 text-xs sm:text-sm font-semibold">
                  {error}
                </div>
              )}
              {success && (
                <div className="w-full mb-4 text-center text-green-600 text-xs sm:text-sm font-semibold">
                  {success}
                </div>
              )}

              <form
                className="w-full flex flex-col gap-4"
                onSubmit={handleSubmit(onSubmit)}
                autoComplete="off"
              >
                <input
                  type="text"
                  placeholder={generalData?.logging_page_settings.username_placeholder}
                  {...register("username", { required: locale === "ar" ? "يجب أن يكون لديك اسم مستخدم" : "Username is required" })}
                  className="w-full border border-[#E73828] rounded-full px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#E73828] text-black bg-transparent placeholder:text-black rtl:text-right"
                />
                {errors.username && (
                  <span className="text-xs text-red-600">{errors.username.message as string}</span>
                )}

                <CustomDropdown
                  options={countries.map(c => c.title)}
                  value={countries.find(c => c.slug === watch("country"))?.title || ""}
                  onChange={(val) => {
                    const selected = countries.find(c => c.title === val);
                    setValue("country", selected?.slug || "", { shouldValidate: true });
                  }}
                  placeholder={generalData?.logging_page_settings.country_placeholder || "Country"}
                />
                <input
                  type="hidden"
                  {...register("country", { required: locale === "ar" ? "يجب أن يكون لديك بلد" : "Country is required" })}
                  name="country"
                />
                {errors.country && (
                  <span className="text-xs text-red-600">{errors.country.message as string}</span>
                )}

                <div className="flex rtl:flex-row-reverse items-center border border-[#E73828] rounded-full px-4 py-2 bg-transparent">
                  <div className="flex rtl:flex-row-reverse items-center mr-2 rtl:ml-2 rtl:mr-0">
                    <span className="text-[#E73828] text-base">
                      +
                    </span>
                    <span className="text-[#E73828] rtl:text-left">
                      {phonePrefix}
                    </span>
                  </div>
                  <input
                    type="tel"
                    placeholder={generalData?.logging_page_settings.phone_number_placeholder || "Phone Number"}
                    {...register("phone", {
                      required: locale === "ar" ? "يجب أن يكون لديك رقم هاتف" : "Phone number is required",
                      validate: (val: string) => validatePhone(val) || `${locale === "ar" ? "يرجى إدخال رقم هاتف صالح" : "Please enter a valid phone number"} ${country ? `for ${countries.find(c => c.slug === country)?.title}` : ''}`,
                    })}
                    className="w-full focus:outline-none text-base text-black bg-transparent placeholder:text-black rtl:text-right"
                  />
                </div>
                {errors.phone && (
                  <span className="text-xs text-red-600">{errors.phone.message as string}</span>
                )}

                <input
                  type="email"
                  placeholder={generalData?.logging_page_settings.email_placeholder || "Email"}
                  {...register("email", {
                    required: locale === "ar" ? "يجب أن يكون لديك بريد إلكتروني" : "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: locale === "ar" ? "يرجى إدخال عنوان بريد إلكتروني صالح (مثال: user@example.com)." : "Please enter a valid email address (e.g. user@example.com).",
                    },
                  })}
                  className="w-full border border-[#E73828] rounded-full px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#E73828] text-black bg-transparent placeholder:text-black rtl:text-right"
                />
                {errors.email && (
                  <span className="text-xs text-red-600">{errors.email.message as string}</span>
                )}

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={generalData?.logging_page_settings.password_placeholder || "Password"}
                    {...register("password", {
                      required: locale === "ar" ? "يجب أن يكون لديك كلمة مرور" : "Password is required",
                      validate: (val: string) => validatePassword(val) || (locale === "ar" ? "يجب أن تكون كلمة المرور على الأقل 8 أحرف, تحتوي على 1 حرف كبير, 1 رقم, و 1 حرف خاص." : "Password must be at least 8 characters, include 1 uppercase letter, 1 number, and 1 special character."),
                    })}
                    className="w-full border border-[#E73828] rounded-full px-4 py-2 pr-12 rtl:pl-12 rtl:pr-4 text-base focus:outline-none focus:ring-2 focus:ring-[#E73828] text-black bg-transparent placeholder:text-black"
                  />
                  <div
                    className="absolute right-4 rtl:left-4 rtl:right-auto top-1/2 -translate-y-1/2 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <EyeIcon open={showPassword} />
                  </div>
                </div>
                {errors.password && (
                  <span className="text-xs text-red-600">{errors.password.message as string}</span>
                )}

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={generalData?.logging_page_settings.confirm_password_placeholder || "Confirm Password"}
                    {...register("confirmPassword", {
                      required: locale === "ar" ? "يرجى التأكد من كلمة المرور" : "Please confirm your password",
                      validate: (val: string) => val === watch("password") || (locale === "ar" ? "كلمات المرور غير متطابقة." : "Passwords do not match."),
                    })}
                    className="w-full border border-[#E73828] rounded-full px-4 py-2 pr-12 rtl:pl-12 rtl:pr-4 text-base focus:outline-none focus:ring-2 focus:ring-[#E73828] text-black bg-transparent placeholder:text-black"
                  />
                  <div
                    className="absolute right-4 rtl:left-4 rtl:right-auto top-1/2 -translate-y-1/2 cursor-pointer"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <EyeIcon open={showConfirmPassword} />
                  </div>
                </div>
                {errors.confirmPassword && (
                  <span className="text-xs text-red-600">{errors.confirmPassword.message as string}</span>
                )}

                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="isBusiness"
                    {...register("isBusiness")}
                    className="w-4 h-4 accent-[#E73828]"
                  />
                  <label htmlFor="isBusiness" className="text-sm sm:text-base text-black">
                    {generalData?.logging_page_settings.register_business_user_label}
                  </label>
                </div>

                {isBusiness && (
                  <div className="flex flex-col gap-4 mt-2">
                    <CustomDropdown
                      options={userTypes.map(ut => ut.title)}
                      value={userTypes.find(ut => ut.id === watch("userType"))?.title || ""}
                      onChange={(val) => {
                        const selected = userTypes.find(ut => ut.title === val);
                        setValue("userType", selected?.id || 0, { shouldValidate: true });
                      }}
                      placeholder={generalData?.logging_page_settings.user_type_placeholder || "User Type"}
                    />
                    <input
                      type="hidden"
                      {...register("userType", { required: isBusiness ? (locale === "ar" ? "يجب أن يكون لديك نوع مستخدم" : "User type is required") : false })}
                      name="userType"
                    />
                    {errors.userType && (
                      <span className="text-xs text-red-600">{errors.userType.message as string}</span>
                    )}

                    <input
                      type="text"
                      placeholder={generalData?.logging_page_settings.store_name_placeholder || "Store Name"}
                      {...register("storeName", {
                        required: isBusiness ? (locale === "ar" ? "يجب أن يكون لديك اسم متجر" : "Store name is required") : false,
                      })}
                      className="w-full border border-[#E73828] rounded-full px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#E73828] text-black bg-transparent placeholder:text-black rtl:text-right"
                    />
                    {errors.storeName && (
                      <span className="text-xs text-red-600">{errors.storeName.message as string}</span>
                    )}

                    <input
                      type="text"
                      placeholder={generalData?.logging_page_settings.store_location_placeholder || "Store Location"}
                      {...register("location", {
                        required: isBusiness ? (locale === "ar" ? "يجب أن يكون لديك موقع متجر" : "Store location is required") : false,
                      })}
                      className="w-full border border-[#E73828] rounded-full px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#E73828] text-black bg-transparent placeholder:text-black rtl:text-right"
                    />
                    {errors.location && (
                      <span className="text-xs text-red-600">{errors.location.message as string}</span>
                    )}
                  </div>
                )}

                {submitLoading ? (
                  <div className="w-full flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E73828]"></div>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full bg-[#E73828] text-white rounded-full py-3 text-base font-bold mt-4 hover:bg-white hover:text-[#E73828] hover:border hover:border-[#E73828] transition-colors duration-200"
                  >
                    {generalData?.logging_page_settings.sign_up_button || "CREATE ACCOUNT"}
                  </button>
                )}

                <div className="relative w-full my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
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

              <GoogleButton text={generalData?.logging_page_settings.google_button || "SIGNUP WITH GOOGLE"} onClick={handleGoogleSignup} locale={locale} />

              <div className="flex items-center justify-center gap-1 mt-6">
                <div className="text-center text-black text-sm sm:text-base">
                  {
                    locale === "ar" ?
                      "لديك حساب؟"
                      :
                      "Already have an account?"
                  }
                </div>
                <Link
                  href="/auth/signin"
                  className="text-[#E73828] font-bold hover:underline"
                >
                  {
                    locale === "ar" ?
                      "تسجيل الدخول"
                      :
                      "Sign in"
                  }
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>

      <VerifyEmailModal
        isOpen={showVerify}
        onClose={() => setShowVerify(false)}
        onVerify={handleVerify}
        loading={verifyLoading}
        error={verifyError}
        success={success}
        onResend={ResendCode}
        locale={locale}
      />
    </>
  );
}
