import React, { useState } from "react";
import CustomDropdown from "@/components/ui/custom-dropdown";
import GoogleButton from "@/components/ui/google-button";
import Modal from "@/components/ui/modal";
import VerifyEmailModal from "@/components/ui/verify-email-modal";
import PendingApprovalModal from "@/components/ui/pending-approval-modal";
import Link from "next/link";
import { useRouter } from "next/router";

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

  const [form, setForm] = useState({
    email: "",
    phone: "",
    username: "",
    country: "",
    userType: "",
    storeName: "",
    location: "",
    password: "",
    confirmPassword: "",
    isBusiness: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [showVerify, setShowVerify] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const input = e.target as HTMLInputElement;
      setForm((prev) => ({
        ...prev,
        [name]: input.checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string) => {
    return /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(
      password
    );
  };

  const validatePhone = (phone: string, country: string) => {
    const countryFormat =
      COUNTRY_PHONE_FORMATS[country as keyof typeof COUNTRY_PHONE_FORMATS];
    if (!countryFormat) return false;
    return countryFormat.regex.test(phone);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // All fields mandatory
    if (
      !form.username ||
      !form.country ||
      !form.phone ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!validateEmail(form.email)) {
      setError("Please enter a valid email address (e.g. user@example.com).");
      return;
    }
    if (!validatePhone(form.phone, form.country)) {
      setError(`Please enter a valid phone number for ${form.country}.`);
      return;
    }
    if (!validatePassword(form.password)) {
      setError(
        "Password must be at least 8 characters, include 1 uppercase letter, 1 number, and 1 special character."
      );
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.isBusiness) {
      if (!form.userType || !form.storeName || !form.location) {
        setError("Please fill in all business fields.");
        return;
      }
    }
    // Simulate duplicate user check
    if (
      form.username === "existinguser" ||
      form.email === "existing@example.com"
    ) {
      setError("Username or email already exists.");
      return;
    }
    // TODO: Add API call
    setIsOpen(false);
    setShowVerify(true);
  };

  const handleVerify = (code: string) => {
    setVerifyLoading(true);
    setVerifyError("");
    // Simulate API call
    setTimeout(() => {
      setVerifyLoading(false);
      if (code === "123456") {
        // Simulate correct code
        setShowVerify(false);
        setShowPending(true);
      } else {
        setVerifyError("Invalid verification code. Please try again.");
      }
    }, 1000);
  };

  // Helper for phone prefix
  const phonePrefix = form.country
    ? COUNTRY_PHONE_FORMATS[form.country as keyof typeof COUNTRY_PHONE_FORMATS]
        ?.code
    : "+";

  const handleGoogleSignup = () => {
    // Redirect to Google OAuth signup page
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
      >
        <h2 className="text-3xl font-extrabold text-[#E73828] text-center mb-1 tracking-tight">
          CREATE ACCOUNT
        </h2>
        <p className="text-center text-black text-base mb-6">
          Sign up to continue
        </p>
        {error && (
          <div className="w-full mb-2 text-center text-red-600 text-sm font-semibold">
            {error}
          </div>
        )}
        <form
          className="w-full flex flex-col gap-4"
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
            className="w-full border border-[#E73828] rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E73828] text-black bg-transparent placeholder:text-black"
          />
          <CustomDropdown
            options={COUNTRIES}
            value={form.country}
            onChange={(val) => setForm((prev) => ({ ...prev, country: val }))}
            placeholder="Country"
          />
          <div className="flex items-center border border-[#E73828] rounded-full px-4 py-2 bg-transparent">
            <span className="text-[#E73828] mr-2 min-w-[48px]">
              {phonePrefix}
            </span>
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              required
              className="flex-1 bg-transparent outline-none text-black placeholder:text-black"
            />
          </div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border border-[#E73828] rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E73828] text-black bg-transparent placeholder:text-black"
          />
          {/* Business-only fields */}
          {form.isBusiness && (
            <>
              <CustomDropdown
                options={USER_TYPES}
                value={form.userType}
                onChange={(val) =>
                  setForm((prev) => ({ ...prev, userType: val }))
                }
                placeholder="User Type"
              />
              <input
                type="text"
                name="storeName"
                placeholder="Store Name"
                value={form.storeName}
                onChange={handleChange}
                required={form.isBusiness}
                className="w-full border border-[#E73828] rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E73828] text-black bg-transparent placeholder:text-black"
              />
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={form.location}
                onChange={handleChange}
                required={form.isBusiness}
                className="w-full border border-[#E73828] rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E73828] text-black bg-transparent placeholder:text-black"
              />
            </>
          )}
          {/* Password field with show/hide icon */}
          <div className="relative w-full group">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full border border-[#E73828] rounded-full px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-[#E73828] text-black bg-transparent placeholder:text-black transition-all duration-200"
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
          {/* Confirm Password field with show/hide icon */}
          <div className="relative w-full group">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Passwords"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="w-full border border-[#E73828] rounded-full px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-[#E73828] text-black bg-transparent placeholder:text-black transition-all duration-200"
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[#E73828]/10 transition-colors duration-200 focus:outline-none"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              <EyeIcon open={showConfirmPassword} />
            </button>
          </div>
          <label className="flex items-center gap-2 text-black text-sm">
            <input
              type="checkbox"
              name="isBusiness"
              checked={form.isBusiness}
              onChange={(e) => {
                if (e.target instanceof HTMLInputElement) {
                  setForm((prev) => ({
                    ...prev,
                    isBusiness: e.target.checked,
                  }));
                }
              }}
              className="accent-[#E73828] w-4 h-4 rounded"
            />
            Register as a Business User
          </label>
          <button
            type="submit"
            className="w-full bg-[#E73828] text-white font-bold py-3 rounded-full mt-2 hover:bg-white hover:text-[#E73828] border border-[#E73828] transition-colors duration-200 text-lg"
          >
            CREATE ACCOUNT
          </button>
          <GoogleButton onClick={handleGoogleSignup} />
        </form>
        <div className="w-full text-center mt-4 text-black text-base">
          Already have an account ?{" "}
          <Link
            href="/auth/signin"
            className="text-[#E73828] font-bold hover:underline"
          >
            Login
          </Link>
        </div>
      </Modal>
      <VerifyEmailModal
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
      />
    </>
  );
}
