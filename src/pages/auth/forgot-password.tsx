import React, { useState } from "react";

export default function ForgotPassword() {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    emailOrPhone: "",
    code: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };
  const validatePhone = (value: string) => {
    return /^\+?\d{7,15}$/.test(value.replace(/\s/g, ""));
  };
  const validatePassword = (value: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(value);
  };

  // Step 1: Request code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!form.emailOrPhone) {
      setError("Please enter your email or phone number.");
      return;
    }
    if (!validateEmail(form.emailOrPhone) && !validatePhone(form.emailOrPhone)) {
      setError("Please enter a valid email or phone number.");
      return;
    }
    setLoading(true);
    // TODO: Call API to send code
    setTimeout(() => {
      setLoading(false);
      setStep(2);
      setSuccess(false);
    }, 1200);
  };

  // Step 2: Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!form.code) {
      setError("Please enter the code you received.");
      return;
    }
    if (!form.newPassword || !form.confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!validatePassword(form.newPassword)) {
      setError(
        "Password must be at least 8 characters, include uppercase, lowercase, a number, and a special character."
      );
      return;
    }
    setLoading(true);
    // TODO: Call API to verify code and reset password
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen bg-black bg-opacity-95">
      <div className="relative w-full max-w-[400px] bg-white rounded-[20px] border border-[#E73828] p-8 flex flex-col items-center shadow-lg">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-[#E73828] text-xl hover:scale-110 transition-transform"
          aria-label="Close"
          onClick={() => window.history.back()}
        >
          &times;
        </button>
        <h2 className="text-3xl font-extrabold text-[#E73828] text-center mb-1 tracking-tight">FORGOT PASSWORD</h2>
        <p className="text-center text-black text-base mb-6">
          {step === 1
            ? "Enter your email or phone to receive a reset code."
            : "Enter the code you received and set a new password."}
        </p>
        {error && <div className="w-full mb-2 text-center text-red-600 text-sm font-semibold">{error}</div>}
        {success && step === 2 && (
          <div className="w-full mb-2 text-center text-green-600 text-sm font-semibold">
            Password reset successfully! <a href="/auth/signin" className="text-[#E73828] underline font-bold">Sign in</a>
          </div>
        )}
        {step === 1 && (
          <form className="w-full flex flex-col gap-4" onSubmit={handleRequestCode}>
            <input
              type="text"
              name="emailOrPhone"
              placeholder="Email or Phone Number"
              value={form.emailOrPhone}
              onChange={handleChange}
              required
              className="w-full border border-[#E73828] rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E73828] text-black bg-transparent placeholder:text-black"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E73828] text-white font-bold py-3 rounded-full mt-2 hover:bg-white hover:text-[#E73828] border border-[#E73828] transition-colors duration-200 text-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Code"}
            </button>
          </form>
        )}
        {step === 2 && !success && (
          <form className="w-full flex flex-col gap-4" onSubmit={handleResetPassword}>
            <input
              type="text"
              name="code"
              placeholder="Verification Code"
              value={form.code}
              onChange={handleChange}
              required
              className="w-full border border-[#E73828] rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E73828] text-black bg-transparent placeholder:text-black"
            />
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={form.newPassword}
              onChange={handleChange}
              required
              className="w-full border border-[#E73828] rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E73828] text-black bg-transparent placeholder:text-black"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm New Password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="w-full border border-[#E73828] rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E73828] text-black bg-transparent placeholder:text-black"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E73828] text-white font-bold py-3 rounded-full mt-2 hover:bg-white hover:text-[#E73828] border border-[#E73828] transition-colors duration-200 text-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
        {step === 2 && success && (
          <div className="w-full text-center mt-4 text-black text-base">
            <a href="/auth/signin" className="text-[#E73828] font-bold hover:underline">Back to Sign In</a>
          </div>
        )}
      </div>
    </div>
  );
} 