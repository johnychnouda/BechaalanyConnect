import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/modal";
import VerifyEmailModal from "@/components/ui/verify-email-modal";
import PendingApprovalModal from "@/components/ui/pending-approval-modal";
import { useAuth } from "@/context/AuthContext";
import GoogleButton from "@/components/ui/google-button";
import Link from "next/link";
import { useRouter } from "next/router";
import api from "@/utils/axiosConfig";
import { useForm } from "react-hook-form";
import { signIn, useSession } from "next-auth/react";

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

export type SigninModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  setCreateAccountOpen: (isOpen: boolean) => void;
};

export default function SigninModal({ isOpen, setIsOpen, setCreateAccountOpen }: SigninModalProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { login } = useAuth();

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Handle NextAuth session changes
  useEffect(() => {
    if (session?.laravelToken && session?.laravelUser) {
      // Login with Laravel token and user data
      login(session.laravelToken, session.laravelUser);
      setIsOpen(false);
      router.push("/");
    }
  }, [session, login, setIsOpen, router]);

  const {
    register,
    handleSubmit,
    setError: setFormError,
    formState: { errors },
  } = useForm();

  const validateEmail = (value: string) => {
    // Simple email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const validatePhone = (value: string) => {
    // Simple phone regex (Lebanon +961 or other country codes)
    return /^\+?\d{7,15}$/.test(value.replace(/\s/g, ""));
  };

  const validatePassword = (value: string) => {
    // At least 8 chars, one uppercase, one lowercase, one number, one special char
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(
      value
    );
  };

  const onSubmit = async (data: any) => {
    setError("");
    setSuccess(false);
    setLoading(true);
    try {
      const response = await api.post(`/login`, {
        email: data.emailOrPhone,
        password: data.password,
      });
      const { token, user } = response.data;
      login(token, user);
      setIsOpen(false);
      router.push("/");
    } catch (err: any) {
      setLoading(false);
      if (err.response) {
        const apiError = err.response.data?.error || "Login failed. Please try again.";
        setError(apiError);
      } else {
        setError("Network error. Please try again.");
      }
      return;
    }
    setLoading(false);
  };

  const handleLoginWithGoogle = () => {
    signIn("google");
  };


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
            WELCOME BACK
          </h2>
          <p className="text-center text-black text-sm sm:text-base mb-4 sm:mb-6">
            Login to continue
          </p>
          {error && (
            <div className="w-full mb-2 text-center text-red-600 text-xs sm:text-sm font-semibold">
              {error}
            </div>
          )}
          {success && (
            <div className="w-full mb-2 text-center text-green-600 text-xs sm:text-sm font-semibold">
              Signed in successfully!
            </div>
          )}
          <form className="w-full flex flex-col gap-3 sm:gap-4" onSubmit={handleSubmit(onSubmit)}>
            <input
              type="text"
              {...register("emailOrPhone", {
                required: "Email or phone is required.",
                validate: value =>
                  validateEmail(value) || validatePhone(value) || "Please enter a valid email or phone number.",
              })}
              placeholder="Email"
              required
              className="w-full border border-[#E73828] rounded-full px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#E73828] text-black bg-transparent placeholder:text-black"
              autoComplete="username"
            />
            {errors.emailOrPhone && (
              <div className="w-full mb-2 text-center text-red-600 text-xs sm:text-sm font-semibold">
                {errors.emailOrPhone.message as string}
              </div>
            )}
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Password is required.",
                  validate: value =>
                    validatePassword(value) ||
                    "Password must be at least 8 characters, include uppercase, lowercase, a number, and a special character.",
                })}
                placeholder="Password"
                required
                className="w-full border border-[#E73828] rounded-full px-4 py-2 pr-12 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#E73828] text-black bg-transparent placeholder:text-black"
                autoComplete="current-password"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[#E73828]/10 transition-colors duration-200 focus:outline-none"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
            {errors.password && (
              <div className="w-full mb-2 text-center text-red-600 text-xs sm:text-sm font-semibold">
                {errors.password.message as string}
              </div>
            )}
            <div className="w-full flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-xs text-[#E73828] hover:underline font-semibold"
              >
                Forgot Password ?
              </Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E73828] text-white font-bold py-3 rounded-full mt-2 hover:bg-white hover:text-[#E73828] border border-[#E73828] transition-colors duration-200 text-lg disabled:opacity-60 disabled:cursor-not-allowed no-wrap-login-btn"
            >
              {loading ? "Signing in..." : "LOGIN"}
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
          <GoogleButton
            onClick={handleLoginWithGoogle}
            text="CONTINUE WITH GOOGLE"
          />
          <div className="flex items-center justify-center gap-1 mt-4">
            <div className="text-center text-black text-sm sm:text-base ">
              Don&apos;t have an account ?{" "}

            </div>
            <div
              className="text-[#E73828] font-bold hover:underline cursor-pointer"
              onClick={() => {
                setCreateAccountOpen(true);
                setIsOpen(false);
              }}
            >
              Sign up
            </div>
          </div>

        </div>
      </Modal>
      {/* <VerifyEmailModal
        isOpen={showVerify}
        onClose={() => setShowVerify(false)}
        onVerify={handleVerify}
        loading={verifyLoading}
        error={verifyError}
        onResend={() => alert("Resend code logic here")}
      />
      <PendingApprovalModal
        isOpen={showPending}
        onClose={() => {
          setShowPending(false);

          router.push("/");
        }}
      /> */}
    </>
  );
}
