import React from "react";
import Modal from "@/components/ui/modal";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/primitives/Button";
import { Input } from "@/components/ui/primitives/Input";

interface VerifyEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string) => void;
  onResend?: () => void;
  loading?: boolean;
  error?: string;
  success?: string;
  locale?: string;
  disableBackdropClose?: boolean;
}

const VerifyEmailModal: React.FC<VerifyEmailModalProps> = ({ isOpen, onClose, onVerify, onResend, loading, error, success, locale, disableBackdropClose }) => {
  const isArabic = locale === 'ar';
  const { register, handleSubmit, formState: { errors } } = useForm<{ code: string }>({
    defaultValues: { code: "" },
  });

  const onSubmit = (data: { code: string }) => {
    onVerify(data.code);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      disableBackdropClose={disableBackdropClose}
      title={isArabic ? 'تحقق من بريدك الإلكتروني' : 'VERIFY YOUR EMAIL'}
      closeLabel={isArabic ? 'إغلاق' : 'Close'}
    >
      <p className="text-center text-app-black dark:text-white text-base mb-6">{ isArabic ? 'لقد أرسلنا رمز التحقق إلى بريدك الإلكتروني يرجى التحقق من صندوق الوارد وإدخال الرمز أدناه' : "We've sent a verification code to your email please check your inbox and enter the code below"}</p>
      {error && <div className="w-full mb-2 text-center text-red-600 text-sm font-semibold" role="alert">{error}</div>}
      {success && <div className="w-full mb-2 text-center text-green-600 text-sm font-semibold" role="status">{success}</div>}
      <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          type="text"
          {...register("code", { required: isArabic ? 'رمز التحقق مطلوب' : 'Verification code is required' })}
          placeholder="Verification Code"
          invalid={Boolean(errors.code)}
          className="text-center"
          aria-describedby={errors.code ? "verify-code-error" : undefined}
        />
        {errors.code && (
          <span id="verify-code-error" role="alert" className="text-xs text-red-600 text-center">{errors.code.message}</span>
        )}
        <Button type="submit" disabled={loading} loading={loading} fullWidth size="lg">
          {isArabic ? 'تحقق' : 'VERIFY'}
        </Button>
      </form>
      <div className="w-full text-center mt-4 text-app-black dark:text-white text-base">
        { isArabic ? 'لم تستلم بريد إلكتروني؟' : "Didn't Receive an Email ? "}
        {onResend && <button type="button" className="text-app-red font-bold hover:underline" onClick={onResend}>{ isArabic ? 'حاول مرة أخرى' : 'Try Again'}</button>}
      </div>
    </Modal>
  );
};

export default VerifyEmailModal;
