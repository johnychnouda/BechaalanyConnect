import React from "react";
import Modal from "@/components/ui/modal";
import { useForm } from "react-hook-form";

interface VerifyEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string) => void;
  onResend?: () => void;
  loading?: boolean;
  error?: string;
}

const VerifyEmailModal: React.FC<VerifyEmailModalProps> = ({ isOpen, onClose, onVerify, onResend, loading, error }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<{ code: string }>({
    defaultValues: { code: "" },
  });

  const onSubmit = (data: { code: string }) => {
    onVerify(data.code);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-3xl font-extrabold text-[#E73828] text-center mb-1 tracking-tight">VERIFY YOUR EMAIL</h2>
      <p className="text-center text-black text-base mb-6">We've sent a verification code to your email<br />please check your inbox and enter the code below</p>
      {error && <div className="w-full mb-2 text-center text-red-600 text-sm font-semibold">{error}</div>}
      <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <input
          type="text"
          {...register("code", { required: "Verification code is required" })}
          placeholder="Verification Code"
          className="w-full border border-[#E73828] rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E73828] text-black bg-transparent placeholder:text-black text-center"
        />
        {errors.code && (
          <span className="text-xs text-red-600 text-center">{errors.code.message}</span>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#E73828] text-white font-bold py-3 rounded-full mt-2 hover:bg-white hover:text-[#E73828] border border-[#E73828] transition-colors duration-200 text-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Verifying..." : "VERIFY"}
        </button>
      </form>
      <div className="w-full text-center mt-4 text-black text-base">
        Didn't Receive an Email ?{' '}
        {onResend && <button type="button" className="text-[#E73828] font-bold hover:underline" onClick={onResend}>Try Again</button>}
      </div>
    </Modal>
  );
};

export default VerifyEmailModal; 