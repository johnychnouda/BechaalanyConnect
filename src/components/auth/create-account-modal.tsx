import React, { useState } from "react";
import CustomDropdown from "@/components/ui/custom-dropdown";
import GoogleButton from "@/components/ui/google-button";
import Modal from "@/components/ui/modal";
import VerifyEmailModal from "@/components/ui/verify-email-modal";
import PendingApprovalModal from "@/components/ui/pending-approval-modal";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { useForm, FieldErrors } from "react-hook-form";
import { authService } from "@/services/auth.service";

const COUNTRIES = [
  "LEBANON",
  "SYRIA",
  "UAE",
  "JORDAN",
  "SAUDI ARABIA",
  "EGYPT",
];

const COUNTRY_PHONE_FORMATS = {
  LEBANON: { code: "+961", regex: /^\+961\d{7,8}$/ },
  SYRIA: { code: "+963", regex: /^\+963\d{9}$/ },
  UAE: { code: "+971", regex: /^\+971\d{9}$/ },
  JORDAN: { code: "+962", regex: /^\+962\d{8,9}$/ },
  "SAUDI ARABIA": { code: "+966", regex: /^\+966\d{8,9}$/ },
  EGYPT: { code: "+20", regex: /^\+20\d{9,10}$/ },
};

const USER_TYPES = ["Reseller", "Wholesale", "Wholesale API"];

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

export type CreateAccountModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export default function CreateAccountModal({
  isOpen,
  setIsOpen,
}: CreateAccountModalProps) {
  const router = useRouter();
  const { login, loginWithGoogle, loading } = useAuth();
  const [error, setError] = useState("");
  const [showVerify, setShowVerify] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyToken, setVerifyToken] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState("");
  const [regPassword, setRegPassword] = useState(""); // Store password for auto-login

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const country = watch("country") as keyof typeof COUNTRY_PHONE_FORMATS;
  const phonePrefix = country ? COUNTRY_PHONE_FORMATS[country]?.code : "+";

  const validatePhone = (phone: string) => {
    const countryFormat = COUNTRY_PHONE_FORMATS[country];
    const fullPhoneNumber = `${countryFormat?.code}${phone}`;
    if (!countryFormat) return false;
    return countryFormat.regex.test(fullPhoneNumber);
  };

  const validatePassword = (password: string) => {
    return /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password);
  };

  const onSubmit = async (data: any) => {
    setError("");
    setSuccess("");
    try {
      // Use auth service for registration
      const response = await authService.register({
        email: data.email,
        phone: data.phone,
        username: data.username,
        country: data.country,
        userType: data.userType || 'Reseller',
        storeName: data.storeName,
        location: data.location,
        password: data.password,
        confirmPassword: data.confirmPassword,
        isBusiness: data.isBusiness || false,
      });
      setIsOpen(false);
      setShowVerify(true);
      setVerifyEmail(data.email);
      setVerifyToken(response.verification_token || "");
      setRegPassword(data.password); // Store password for auto-login
      reset();
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  const handleVerify = async (code: string) => {
    setVerifyLoading(true);
    setVerifyError("");
    try {
      await authService.verifyEmail(code, verifyEmail, verifyToken);
      setShowVerify(false);
      setShowPending(true);
      // Auto-login after successful verification
      if (regPassword) {
        try {
          await login(verifyEmail, regPassword);
          setSuccess("Account verified and logged in successfully!");
        } catch (loginErr: any) {
          console.error("Auto-login failed:", loginErr);
          // Don't show error to user since verification was successful
          setSuccess("Account verified successfully! Please log in.");
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
      await authService.resendVerificationCode(verifyEmail);
      setVerifyError("");
      setSuccess("Verification code resent successfully.");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      setVerifyError(err.message || "Network error. Please try again.");
      setSuccess("");
    }
  };

  const isBusiness = watch("isBusiness");

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
      >
        <div className="w-full max-w-[400px]">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#E73828] text-center mb-1 tracking-tight">
            CREATE ACCOUNT
          </h2>
          <p className="text-center text-black text-sm sm:text-base mb-4 sm:mb-6">
            Sign up to continue
          </p>
          {error && (
            <div className="w-full mb-2 text-center text-red-600 text-xs sm:text-sm font-semibold">
              {error}
            </div>
          )}
          {success &&
            <div className="w-full mb-2 text-center text-green-600 text-xs sm:text-sm font-semibold">
              {success}
            </div>
          }
          <form
            className="w-full flex flex-col gap-3 sm:gap-4"
            onSubmit={handleSubmit(onSubmit)}
            autoComplete="off"
          >
            <input
              type="text"
              placeholder="Username"
              {...register("username", { required: "Username is required" })}
              className="w-full border border-[#E73828] rounded-full px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#E73828] text-black bg-transparent placeholder:text-black"
            />
            {errors.username && (
              <span className="text-xs text-red-600">{errors.username.message as string}</span>
            )}
            <CustomDropdown
              options={COUNTRIES}
              value={country}
              onChange={(val) => setValue("country", val, { shouldValidate: true })}
              placeholder="Country"
            />
            <input
              type="hidden"
              {...register("country", { required: "Country is required" })}
              name="country"
            />
            {errors.country && (
              <span className="text-xs text-red-600">{errors.country.message as string}</span>
            )}
            <div className="flex items-center border border-[#E73828] rounded-full px-4 py-2 bg-transparent">
              <span className="text-[#E73828] mr-2 min-w-[48px] text-base">
                {phonePrefix}
              </span>
              <input
                type="tel"
                placeholder="Phone Number"
                {...register("phone", {
                  required: "Phone number is required",
                  validate: (val: string) => validatePhone(val) || `Please enter a valid phone number ${country ? `for ${country}` : ''} .`,
                })}
                className="w-full focus:outline-none text-base text-black bg-transparent placeholder:text-black"
              />
            </div>
            {errors.phone && (
              <span className="text-xs text-red-600">{errors.phone.message as string}</span>
            )}
            <input
              type="email"
              placeholder="Email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address (e.g. user@example.com).",
                },
              })}
              className="w-full border border-[#E73828] rounded-full px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#E73828] text-black bg-transparent placeholder:text-black"
            />
            {errors.email && (
              <span className="text-xs text-red-600">{errors.email.message as string}</span>
            )}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                {...register("password", {
                  required: "Password is required",
                  validate: (val: string) => validatePassword(val) || "Password must be at least 8 characters, include 1 uppercase letter, 1 number, and 1 special character.",
                })}
                className="w-full border border-[#E73828] rounded-full px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#E73828] text-black bg-transparent placeholder:text-black"
              />
              <div
                className="absolute right-4 top-1/2 -translate-y-1/2"
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
                placeholder="Confirm Password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (val: string) => val === watch("password") || "Passwords do not match.",
                })}
                className="w-full border border-[#E73828] rounded-full px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#E73828] text-black bg-transparent placeholder:text-black"
              />
              <div
                className="absolute right-4 top-1/2 -translate-y-1/2"
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
                Register as a Business User
              </label>
            </div>
            {isBusiness && (
              <div className="flex flex-col gap-3 sm:gap-4 mt-2">
                <CustomDropdown
                  options={USER_TYPES}
                  value={watch("userType")}
                  onChange={(val) => setValue("userType", val, { shouldValidate: true })}
                  placeholder="User Type"
                />
                {errors.userType && (
                  <span className="text-xs text-red-600">User type is required</span>
                )}
                <input
                  type="text"
                  placeholder="Store Name"
                  {...register("storeName", {
                    required: isBusiness ? "Store name is required" : false,
                  })}
                  className="w-full border border-[#E73828] rounded-full px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#E73828] text-black bg-transparent placeholder:text-black"
                />
                {errors.storeName && (
                  <span className="text-xs text-red-600">{errors.storeName.message as string}</span>
                )}
                <input
                  type="text"
                  placeholder="Store Location"
                  {...register("location", {
                    required: isBusiness ? "Store location is required" : false,
                  })}
                  className="w-full border border-[#E73828] rounded-full px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#E73828] text-black bg-transparent placeholder:text-black"
                />
                {errors.location && (
                  <span className="text-xs text-red-600">{errors.location.message as string}</span>
                )}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-[#E73828] text-white rounded-full py-2 sm:py-3 text-base font-bold mt-4 hover:bg-white hover:text-[#E73828] hover:border hover:border-[#E73828] transition-colors duration-200 no-wrap-account-btn"
            >
              CREATE ACCOUNT
            </button>
            <div className="relative w-full my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
          </form>
          <GoogleButton onClick={handleGoogleSignup} />
        </div>
      </Modal>
      <VerifyEmailModal
        isOpen={showVerify}
        onClose={() => setShowVerify(false)}
        onVerify={handleVerify}
        loading={verifyLoading}
        error={verifyError}
        success={success}
        onResend={ResendCode}
      />
      {/* <PendingApprovalModal
        isOpen={showPending}
        onClose={() => {
          setShowPending(false);
          router.push("/");
        }}
      /> */}
    </>
  );
}
