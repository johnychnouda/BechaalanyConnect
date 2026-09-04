import React from "react";
import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/primitives/Button";

interface PendingApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOkay?: () => void;
  locale?: string;
}

/**
 * Used to be a dead end: a single "OKAY" button that just closed the modal,
 * leaving the customer back on the product page they were just blocked from
 * buying. "Browse products" gives them somewhere to go instead.
 */
const PendingApprovalModal: React.FC<PendingApprovalModalProps> = ({ isOpen, onClose, onOkay, locale = "en" }) => {
  const isArabic = locale === "ar";
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isArabic ? "بانتظار الموافقة" : "PENDING APPROVAL"}
      closeLabel={isArabic ? "إغلاق" : "Close"}
    >
      <p className="text-center text-app-black dark:text-white text-base mb-6">
        {isArabic
          ? "شكراً لتسجيلك! حسابك قيد المراجعة حالياً. ستتلقى إشعاراً عبر البريد الإلكتروني فور الموافقة عليه من قبل الإدارة."
          : "Thank you for registering! Your account is currently under review. You will receive an email notification once it is approved by the admin."}
      </p>
      <div className="w-full flex flex-col gap-2">
        <Button type="button" onClick={onOkay || onClose} fullWidth>
          {isArabic ? "حسناً" : "OKAY"}
        </Button>
        <Button href="/categories" variant="ghost" fullWidth onClick={onClose}>
          {isArabic ? "تصفح المنتجات" : "Browse products"}
        </Button>
      </div>
    </Modal>
  );
};

export default PendingApprovalModal;
