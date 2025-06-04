import React, { useState } from "react";
import Modal from "@/components/ui/modal";
import VerifyEmailModal from "@/components/ui/verify-email-modal";
import PendingApprovalModal from "@/components/ui/pending-approval-modal";
import { useAuth } from '@/context/AuthContext';
import GoogleButton from '@/components/ui/google-button';

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

export default function Signin() {
  const { login } = useAuth();
  const [form, setForm] = useState({
    emailOrPhone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [showVerify, setShowVerify] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

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
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    // Advanced validation
    if (!form.emailOrPhone || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!validateEmail(form.emailOrPhone) && !validatePhone(form.emailOrPhone)) {
      setError("Please enter a valid email or phone number.");
      return;
    }
    if (!validatePassword(form.password)) {
      setError(
        "Password must be at least 8 characters, include uppercase, lowercase, a number, and a special character."
      );
      return;
    }
    setLoading(true);
    // Simulate API call and user status
    setTimeout(() => {
      setLoading(false);
      // Simulate user status: 'unverified', 'pending', 'active'
      const status = form.emailOrPhone === "unverified@example.com"
        ? "unverified"
        : form.emailOrPhone === "pending@example.com"
        ? "pending"
        : "active";
      if (status === "unverified") {
        setIsOpen(false);
        setShowVerify(true);
      } else if (status === "pending") {
        setIsOpen(false);
        setShowPending(true);
      } else {
        setSuccess(true);
        login(); // Call login() to update the auth state
        window.location.href = '/account-dashboard'; // Redirect to dashboard
      }
    }, 1200);
  };

  const handleVerify = (code: string) => {
    setVerifyLoading(true);
    setVerifyError("");
    setTimeout(() => {
      setVerifyLoading(false);
      if (code === "123456") {
        setShowVerify(false);
        setShowPending(true);
      } else {
        setVerifyError("Invalid verification code. Please try again.");
      }
    }, 1000);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={() => { setIsOpen(false); window.history.back(); }}>
        <h2 className="text-3xl font-extrabold text-[#E73828] text-center mb-1 tracking-tight">WELCOME BACK</h2>
        <p className="text-center text-black text-base mb-6">Login to continue</p>
        {error && <div className="w-full mb-2 text-center text-red-600 text-sm font-semibold">{error}</div>}
        {success && <div className="w-full mb-2 text-center text-green-600 text-sm font-semibold">Signed in successfully!</div>}
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="emailOrPhone"
            placeholder="Email"
            value={form.emailOrPhone}
            onChange={handleChange}
            required
            className="w-full border border-[#E73828] rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E73828] text-black bg-transparent placeholder:text-black"
            autoComplete="username"
          />
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full border border-[#E73828] rounded-full px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-[#E73828] text-black bg-transparent placeholder:text-black"
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
          <div className="w-full flex justify-end">
            <a href="/auth/forgot-password" className="text-xs text-[#E73828] hover:underline font-semibold">Forgot Password ?</a>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E73828] text-white font-bold py-3 rounded-full mt-2 hover:bg-white hover:text-[#E73828] border border-[#E73828] transition-colors duration-200 text-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "LOGIN"}
          </button>
          <GoogleButton onClick={() => alert('Google login logic here')} />
        </form>
        <div className="w-full text-center mt-4 text-black text-base">
          Don't have an account ?{' '}
          <a href="/auth/register" className="text-[#E73828] font-bold hover:underline">Sign up</a>
        </div>
      </Modal>
      <VerifyEmailModal
        isOpen={showVerify}
        onClose={() => setShowVerify(false)}
        onVerify={handleVerify}
        loading={verifyLoading}
        error={verifyError}
        onResend={() => alert('Resend code logic here')}
      />
      <PendingApprovalModal
        isOpen={showPending}
        onClose={() => { setShowPending(false); window.location.href = '/'; }}
      />
    </>
  );
}
